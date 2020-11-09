import React, { useState } from "react";
import { useHistory } from "react-router-dom";

import Loader from "../../Shared/loader";
import LoginIcon from "../../Images/loginIcon.png";
import Flash from "../../Shared/Flash/index";
import Bus from '../../Shared/Utils/bus';
import "./login.css";

const ResetPassword = () => {
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState();
  const [message,setMessage]=useState("");

  window.flash = (message, type="success") => Bus.emit('flash', ({message, type}));

  const Loading = () => {
    if (loading) {
      return <Loader />;
    } else {
      return null;
    }
  };

  async function Mailer() {
    setLoading(true);
    fetch("http://localhost:5000/api/connect/changePassMailer", {
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
        if (data.error) {
          setLoading(false);
        } else if (data.message) {
          setLoading(false);
          history.push("/forget-password-mail");
        } else if(!data.message) {
          setLoading(false);
          setMessage(data.reason);
        }
      });
  }

  const Message = () => {
    if (message === "Email Confirmation Not Done" || "User Not Found") {
      window.flash(message, 'error');
      return null;
    }
    else {
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
            <br />
            <h4 className="form-head">ENTER EMAIL</h4>
            <br />
            {(message)?(
                 <Message/>):(<div/>)
                 }
            <div className="log-form">
              <input
                className="form-ip"
                type="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <br />
              <br />
              <button
                className="form-btn"
                type="submit"
                onClick={() => Mailer()}
              >
                <img className="form-icon" src={LoginIcon} alt="Login" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ResetPassword;
