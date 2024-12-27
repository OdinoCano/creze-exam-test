import { useState } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField } from '@mui/material';
import axios from 'axios';
import TimedAlertDialog from "./TimedAlertDialog";

const ConfirmOTP = () => {
  const navigate = useNavigate(); // Add navigation hook
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const isMobile = (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) && window.innerWidth <= 3240;
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleChange = async(value, index) => {
    let newArr = [...otp];
    newArr[index] = value;
    setOtp(newArr);
    const code = newArr.join('')
    if(code.length===6){
      try {
        await axios.post(
          'http://localhost:8000/api/auth/mfa-validate/',  // URL del servidor
          {
            token:code
          },
          {
            headers: {
              'Content-Type': 'application/json',  // Tipo de contenido de la solicitud
              'Authorization': 'Bearer '+localStorage.getItem('access')
            },
            //httpsAgent: agent,
          }
        );
        navigate('/success-page');
      } catch (error) {
        console.log(error);
        if(error?.response?.data?.detail){
          setError(error.response.data.detail);
          setOtp(new Array(6).fill(""));
        }else if (error.code === 'ECONNREFUSED') {
          setError('Conexión rechazada');
        } else if (error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
          setError('Certificado SSL no válido');
        } else {
          setError('Error general:', error);
        }
        handleOpen();
      }
    }
  }
  return (
    <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '100vh'}}>
      <p style={{textAlign:'center'}}>One Time Password (OTP):</p>
      <div style={{display: 'flex',  justifyContent:'center', alignItems:'center'}}>
      {otp.map((digit, index)=>(
        <TextField 
          key={index}
          value={digit}
          slotProps={{ htmlInput: { maxLength: 1 } }}
          onChange={(e)=> handleChange(e.target.value, index)}
          style={{padding:6, width:isMobile?'10vw':'5vw'}}
        />
      ))}
      </div>
      {error && <TimedAlertDialog 
        open={open}
        onClose={handleClose}
        countdownTime={10}
        title="Error"
        content={error}
        type="error" 
      />}
    </div>
  );
};

export default ConfirmOTP;
