import { useEffect, useState } from 'react';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { QRCode } from 'react-qrcode-logo';

// Greatest Common Divisor (GCD) using Euclidean algorithm
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  
  while (b) {
      const temp = b;
      b = a % b;
      a = temp;
  }
  return a;
}

// Least Common Multiple (LCM)
//function lcm(a, b) {
//  return Math.abs((a * b) / gcd(a, b));
//}

function calculateProportionOfAspectRatio(width, height) {
  const gcdValue = gcd(width, height);
  const aspectMaximumRatio = width>height?width / gcdValue:height / gcdValue;
  const aspectMinimumRatio = width>height?height / gcdValue:width / gcdValue;

  return aspectMaximumRatio/aspectMinimumRatio;
}

function calculateSizeOfElement(screen, porcent, proportion) {
  return screen*(porcent/100)/proportion;
}

//// Examples of usage:
//console.log(gcd(48, 18));  // Output: 6
//console.log(lcm(48, 18));  // Output: 144

//// For multiple numbers
//function gcdMultiple(numbers) {
//  return numbers.reduce((a, b) => gcd(a, b));
//}
//
//function lcmMultiple(numbers) {
//  return numbers.reduce((a, b) => lcm(a, b));
//}
//
//// Example with multiple numbers
//const numbers = [12, 18, 24];
//console.log(gcdMultiple(numbers));  // Output: 6
//console.log(lcmMultiple(numbers));  // Output: 72

const QRCodePage = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Add navigation hook
  const uri = location.state?.uri;
  const qrData = location.state?.qrData; // Obtener el valor pasado desde el login
  const [dimensions, setDimensions] = useState({ 
    width: window.innerWidth, 
    height: window.innerHeight 
  });
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  if (!uri) {
    return <div>Error: No se ha recibido el valor del código QR</div>;
  }
  const proportion = calculateProportionOfAspectRatio(dimensions.width, dimensions.height);
  const { innerWidth: width, innerHeight: height } = window;
  const isMobile = (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) && dimensions.width <= 3240;
  const isWidthMaxSize = dimensions.width > dimensions.height;
  let percent, fontZise = 0;
  if(isMobile){
    if(isWidthMaxSize){
      percent = 45;
      fontZise = 5;
    }else{
      percent = 70;
      fontZise = 15;
    }
  }else{
    if(isWidthMaxSize){
      percent = 60;
      fontZise = 10;
    }else{
      percent = 70;
      fontZise = 25;
    }
  }
  return (
    <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '100vh'}}>
      <h3 style={{
        position:'absolute', 
        fontSize:isMobile?calculateProportionOfAspectRatio(width,19,proportion):200+'%', 
        textAlign:'center',
        marginLeft:fontZise,
        marginRight:fontZise,
        top:'5vh'
      }}>
        {isMobile?
          <text>Escribe: 
            <text 
              style={{color: 'blue'}} 
              onClick={() => {
                navigator.clipboard.writeText(qrData);
              }}
            > 
              {qrData} 
            </text>
            o escanea el QR
          </text>:
          "Escanea el QR"}
      </h3>
      <QRCode
        style={{position:'absolute'}}
        value={uri}
        level="H"
        enableCORS={true}
        size={calculateSizeOfElement(isWidthMaxSize?width:height, percent, proportion)}
        //quietZone={70}
        bgColor="#ffffff"
        //fgColor="#78BE20"
        logoImage="https://creze.com/wp-content/uploads/2024/09/Icon-Creze.webp" // Si tienes un logo que quieres agregar al QR
        logoWidth={calculateSizeOfElement(isWidthMaxSize?width:height, percent, proportion)}
        logoHeight={calculateSizeOfElement(isWidthMaxSize?width:height, percent, proportion)}
        logoOpacity={0.31}
        //removeQrCodeBehindLogo={true}
        //logoPadding?: number;
        //logoPaddingStyle="square" //'square' | 'circle';
        //eyeRadius={[
        //    { // top/left eye
        //        outer: [10, 10, 0, 10],
        //        inner: [0, 10, 10, 10],
        //    },
        //    [10, 10, 10, 0], // top/right eye
        //    [10, 0, 10, 10], // bottom/left
        //]}
        //eyeColor?: EyeColor | [EyeColor, EyeColor, EyeColor];
        qrStyle="squares" //'squares' | 'dots' | 'fluid';
      />
      <div style={{position:'absolute', top:'80vh', width:'100vw', display: 'flex',  justifyContent:'center', alignItems:'center'}} >
        <Button
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          onClick={() => navigate('/')} // Navegar a la página de inicio de sesión al hacer clic en el botón
        >
          Login
        </Button>
      </div>
    </div>
  );
};

export default QRCodePage;
