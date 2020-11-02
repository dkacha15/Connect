import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import Bus from '../../Shared/Utils/bus';
import Loader from "../../Shared/loader";
import LoginIcon from "../../Images/loginIcon.png";
import RegistrationIcon from "../../Images/registrationIcon.png";
import "./login.css";
import Flash from "../../Shared/Flash/index";

const Login = () => {
  const history = useHistory();
  const [inputEmail, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState();
  
    window.flash = (message, type="success") => Bus.emit('flash', ({message, type}));

  const login = () => {
    setLoading(true);
    
    const email = inputEmail.trim();

    fetch("http://localhost:5000/api/connect/login", {
      method: "Post",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        email,
        password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setTimeout(() => {
          if (data.error) {
            setLoading(false);
            setMessage(data.error);
          } else {
            setMessage(data.message);
            history.push("/home");
            window.location.reload();
            setLoading(false);
            history.push("/home");
          }
        }, 1000);
      });
  };

  const resendEmail = () => {
    setLoading(true);
    const email = inputEmail.trim();
    // history.push("/resend-verification");
    fetch("http://localhost:5000/api/connect/resend-verification", {
      method: "Post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setTimeout(() => {
          if (data.error) {
            setLoading(false);
            setMessage(data.error);
          } else {
            setMessage(data.message);
            setLoading(false);
            history.push("/email-verification");
          }
        }, 1000);
      });
  };

  const forgetPassword = () => {
    setLoading(true);
    history.push("/forgetPassword");
  };

  const Loading = () => {
    if (loading) {
      return <Loader />;
    } else {
      return null;
    }
  };

  const Message = () => {
    if (message === "Email Confirmation Not Done") {
      window.flash(message, 'error');
      return (
        <div>
          {/* <h5 className="errorMessage">{message}</h5> */}
          <button
            className="form-btn"
            type="submit"
            onClick={() => resendEmail()}
          >
            Resend verification Code
          </button>
        </div>
      );
    } else if (message != null) {
      window.flash(message, 'error');
      setMessage("");
      // return <h5 className="errorMessage">{message}</h5>;
      return null;
    } else {
      return null;
    }
  };

 

  return (
    <React.Fragment>
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500&display=swap"
        rel="stylesheet"
      />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <Loading />
          
      <div className="log-body">
      <Flash/> 
        <div>
        
          <h1 className="log-head">CONNECT</h1>
           
          <div className="form-body">
            <h4 className="form-head">LOGIN</h4>

            <div className="log-form">
              <input
                className="form-ip"
                type="email"
                name="email"
                placeholder="Email"
                value={inputEmail}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <br />
              <input
                className="form-ip"
                type="password"
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
             
              {(message)?(
                 <Message />):(<div/>)
                 }
             
              <button
                className="form-btn"
                type="submit"
                onClick={() => forgetPassword()}
              >
                Forgot Password??
              </button>
              <br />
              <button
                className="form-btn"
                type="submit"
                onClick={() => login()}
              >
                <img className="form-icon" src={LoginIcon} alt="Login" />
              </button>
              <Link to={"/user-registration"}>
                <button className="form-btn">
                  <img
                    className="form-icon"
                    src={RegistrationIcon}
                    alt="Registration"
                  />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Login;
