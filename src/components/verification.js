import React, { useState } from 'react';
import {  useNavigate } from 'react-router-dom';
const VerificationForm = () => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
  
    const handleChange = (e, index) => {
      const { value } = e.target;
      if (/^\d?$/.test(value)) {
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
  
        if (value) {
  
          if (index < 5) {
            document.getElementById(`code-input-${index + 1}`).focus();
          }
          e.target.setAttribute('data-error', 'false');
        } else {
          if (index > 0) {
            document.getElementById(`code-input-${index - 1}`).focus();
          }
        }
      }
    };
  
    const handlePaste = (e) => {
      const pasteData = e.clipboardData.getData('Text');
      if (/^\d{6}$/.test(pasteData)) {
        const newCode = pasteData.split('');
        setCode(newCode);
        document.getElementById('code-input-5').focus();
      } else {
        setError('Pasted code must be 6 digits long');
      }
      e.preventDefault();
    };
  
    const validateInputs = () => {
      let isValid = true;
      let isSet = false
      code.forEach((digit, index) => {
  
        if (digit === '' || !/^\d$/.test(digit)) {
  
          document.getElementById(`code-input-${index}`).setAttribute('data-error', 'true');
  
          if (!isSet) {
  
            document.getElementById(`code-input-${index}`).focus();
            isSet = true
          }
          isValid = false;
        } else {
          document.getElementById(`code-input-${index}`).setAttribute('data-error', 'false');
  
        }
      });
      return isValid;
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      if (!validateInputs()) {
        setError('All fields must be filled with valid digits');
        return;
      }
  
      const codeStr = code.join('');
      try {
        const response = await fetch('http://localhost:5000/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ code: codeStr })
        });
  
        if (!response.ok) {
          throw new Error('Verification Error');
        }
  
        const result = await response.json();
        if (result.message === 'Success') {
          navigate('/success');
        }
      } catch (err) {
        setError('Verification Error');
      }
    };
  
    return (
      <div className="app">
        <h1>Verification code:</h1>
        <div className='formContainer'>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-input-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(e, index)}
                  onPaste={index === 0 ? handlePaste : null}
                />
              ))}
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit">SUBMIT</button>
          </form>
        </div>
      </div>
    );
  };

  export default VerificationForm;