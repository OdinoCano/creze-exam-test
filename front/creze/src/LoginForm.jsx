import React, { useState } from "react";
import { TextField, Button, Typography, Box, Container, Avatar } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";  // Importar Link para navegación
import axios from 'axios';
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
//const agent = new https.Agent({
//  rejectUnauthorized: false, // Deshabilitar validación SSL (no recomendado en producción)
//});

const LoginForm = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:8000/api/auth/login/',  // URL del servidor
        {
          username: username,    // Cuerpo de la solicitud (datos en formato JSON)
          password: password,
        },
        {
          headers: {
            'Content-Type': 'application/json',  // Tipo de contenido de la solicitud
          },
          //httpsAgent: agent,
        },
        { withCredentials: true }
      );
      localStorage.setItem('access', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
      navigate('/confirm-otp');
      //{
      // "refresh":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTczNDc1MTM3MSwiaWF0IjoxNzM0NjY0OTcxLCJqdGkiOiI0Zjc5MDk2MjQ1ZGM0OWI1ODU1ZDcyM2VlMjkzNGM4NSIsInVzZXJfaWQiOjF9.hpEFkuYGBCZRNVI4NJfuSWU_ssV0LssFmIsesHl9pVA",
      // "access":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzM0NjY1MjcxLCJpYXQiOjE3MzQ2NjQ5NzEsImp0aSI6IjYxNjcwOGYzNzZiNTQ2NzNiYWJiMTQ1YmYwMzQ1MDE1IiwidXNlcl9pZCI6MX0.zGzdG33_h8w-qezAxaOunm3fdHFZRJQrt2xb3qjOJ80",
      // "mfa_enabled":false
      //}
    } catch (error) {
      if(error?.response?.data?.detail){
        setError(error.response.data.detail);
      }else if (error.code === 'ECONNREFUSED') {
        setError('Conexión rechazada');
      } else if (error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
        setError('Certificado SSL no válido');
      } else {
        setError('Error general:', error);
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
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <img src="https://creze.com/wp-content/uploads/2024/09/Icon-Creze.webp" alt="Logo Creze" style={{ width: "100%", backgroundColor: "white" }} />
        </Avatar>
        <Typography component="h1" variant="h5">
          Iniciar sesión
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
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <Typography color="error">{error}</Typography>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Iniciar sesión
          </Button>

          <Typography variant="body2" align="center">
            {"¿No tienes cuenta? "}
            <Link to="/register">Regístrate</Link>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginForm;