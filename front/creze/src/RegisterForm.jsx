import React, { useState } from "react";
import { TextField, Button, Typography, Box, Container, Avatar } from "@mui/material";
import { Link } from "react-router-dom";  // Importar Link para navegación
import { useNavigate } from 'react-router-dom';
import axios from "axios";
//import https from 'https';
//import fs from 'fs';
//
// Ruta a tus archivos de certificado
//const certPath = '/path/to/certificate.pem';
//const keyPath = '/path/to/private-key.pem';
//const caPath = '/path/to/ca-certificate.pem'; // Si es necesario, usa el certificado de la autoridad certificadora
//
//const agent = new https.Agent({
//  cert: fs.readFileSync(certPath),
//  key: fs.readFileSync(keyPath),
//  ca: fs.readFileSync(caPath),  // Certificado de la autoridad certificadora (opcional)
//});

const RegisterForm = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Hook para redirigir a otra página
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
    } else if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
    } else if (!/[A-Z]/.test(password)) {
      setError("La contraseña debe contener al menos una letra mayúscula.");
    } else if (!/[a-z]/.test(password)) {
      setError("La contraseña debe contener al menos una letra minúscula.");
    } else if (!/[0-9]/.test(password)) {
      setError("La contraseña debe contener al menos un número.");
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError("La contraseña debe contener al menos un carácter especial.");
    } else if (!/[^\s]/.test(password)) {
      setError("La contraseña no puede contener espacios.");
    } else if (username.length < 4) {
      setError("El nombre de usuario debe tener al menos 4 caracteres.");
    } else if (!/^[a-zA-Z0-9]+$/.test(username)) {
      setError("El nombre de usuario solo puede contener letras y números.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("El correo electrónico no es válido.");
    } else if (email.length < 8) {
      setError("El correo electrónico debe tener al menos 8 caracteres.");
    } else if (email.length > 50) {
      setError("El correo electrónico no puede tener más de 50 caracteres.");
    } else if (username.length > 20) {
      setError("El nombre de usuario no puede tener más de 20 caracteres.");
    } else if (password.length > 50) {
      setError("La contraseña no puede tener más de 50 caracteres.");
    }
    else {
      try {
        const response = await axios.post(
          'http://localhost:8000/api/auth/register/',  // URL del servidor
          {
            username: username,
            email: email,
            password: password
          },
          {
            headers: {
              'Content-Type': 'application/json',  // Tipo de contenido de la solicitud
            },
            //httpsAgent: agent,
          }
        );
        console.log('Respuesta:', response.data);
        const uri = response.data.otp_uri; 
        const qrData = response.data.secrete;
        navigate('/qrcode', { state: { uri, qrData } });
      } catch (error) {
        if (error.code === 'ECONNREFUSED') {
          setError('Conexión rechazada');
        } else if (error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
          setError('Certificado SSL no válido');
        } else {
          setError('Error general:', error);
        }
      }
    }
  };
  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: 8,
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
          <img src="https://creze.com/wp-content/uploads/2024/09/Icon-Creze.webp" alt="Logo Creze" style={{ width: "100%", backgroundColor: "white" }} />
        </Avatar>
        <Typography component="h1" variant="h5">
          Crear cuenta
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 1 }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Nombre de usuario"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Correo electrónico"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirmar contraseña"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {error && <Typography color="error">{error}</Typography>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Registrarse
          </Button>
          <Typography variant="body2" align="center">
            {"¿Ya tienes cuenta? "}
            <Link to="/">Inicia sesión</Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default RegisterForm;