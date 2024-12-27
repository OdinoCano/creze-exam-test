provider "aws" {
  region = "us-east-1"
}

# Crear un VPC
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

# Crear una subred pública
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
}

# Crear una segunda subred pública
resource "aws_subnet" "public_2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.2.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "us-east-1b"
}

# Crear una Gateway de Internet
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id
}

# Asociar la Gateway de Internet con la tabla de rutas
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_2" {
  subnet_id      = aws_subnet.public_2.id
  route_table_id = aws_route_table.public.id
}

# Crear un grupo de seguridad para permitir tráfico HTTP/HTTPS
resource "aws_security_group" "web_sg" {
  vpc_id = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Crear un balanceador de carga para gestionar tráfico
resource "aws_lb" "main" {
  name               = "django-lb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.web_sg.id]
  subnets            = [aws_subnet.public.id, aws_subnet.public_2.id]
}

output "load_balancer_dns" {
  value = aws_lb.main.dns_name
}

# Solicitar un certificado SSL en ACM para el dominio del balanceador de carga
#resource "aws_acm_certificate" "ssl_cert" {
  #domain_name       = aws_lb.main.dns_name
  #validation_method = "DNS"
#}

# Configurar un target group para el balanceador de carga
resource "aws_lb_target_group" "django" {
  name        = "django-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "instance"
}

# Crear un listener para HTTPS
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = aws_iam_server_certificate.self_signed.arn #aws_acm_certificate.ssl_cert.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.django.arn
  }
}

# Subir certificado a AWS IAM
resource "aws_iam_server_certificate" "self_signed" {
  name        = "self-signed-cert"
  certificate_body = file("/var/www/html/inProgress/tech/self-signed.crt")
  private_key      = file("/var/www/html/inProgress/tech/self-signed.key")
}

# Listener para HTTP que redirige a HTTPS
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# Crear una instancia EC2 para ejecutar el contenedor Docker
resource "aws_instance" "django" {
  ami           = "ami-0c02fb55956c7d316" # Amazon Linux 2 AMI
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.public.id
  security_groups = [aws_security_group.web_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              amazon-linux-extras install docker -y
              service docker start
              usermod -a -G docker ec2-user

               # Log in to Docker Hub
              echo "" | docker login --username "a" --password-stdin

              docker run -d -p 80:8000 --name django-app openquantumsafe/python bash -c "
              pip3 install django && django-admin startproject creze &&
              cd creze && python3 manage.py runserver 0.0.0.0:8000"
              EOF
}

# Asociar la instancia al target group
resource "aws_lb_target_group_attachment" "tg_attach" {
  target_group_arn = aws_lb_target_group.django.arn
  target_id        = aws_instance.django.id
  port             = 80
}