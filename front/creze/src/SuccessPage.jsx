import React, { useEffect, useState } from 'react';

const SuccessPage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUserInfo = async () => {
      try{
        const response = await fetch('http://localhost:8000/api/auth/get-user-info/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('access')
          }
        });
        const data = await response.json();
        setData(data);
      }catch(err){
        if(err?.response?.data?.detail){
          console.log(err.response.data.detail);
          setError(err.response.data.detail);
        }else if (err.code === 'ECONNREFUSED') {
          setError('Conexión rechazada');
        } else if (err.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
          setError('Certificado SSL no válido');
        } else {
          setError('Error general:', err);
        }
      }
    }
    
    getUserInfo();
  }, [])
  return (
    <div>
      <h1>Scan Successful!</h1>
      {error?<p>Error:{JSON.stringify(error)}</p>:<p>Scanned data: {JSON.stringify(data)}</p>}
    </div>
  );
};

export default SuccessPage;