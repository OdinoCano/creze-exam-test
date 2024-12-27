import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import QRCodePage from './QRCodePage';
import SuccessPage from './SuccessPage';
import ConfirmOTP from "./ConfirmOTP";

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          {/* Ruta para la página de login */}
          <Route path="/" element={<LoginForm />} />
          <Route path="/confirm-otp" element={<ConfirmOTP />} />

          {/* Ruta para la página de registro */}
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/qrcode" element={<QRCodePage />} />
          <Route path="/success-page" element={<SuccessPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
