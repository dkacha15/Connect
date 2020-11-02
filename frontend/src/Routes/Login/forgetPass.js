import React, { useState } from "react";
import { useHistory, useParams } from "react-router-dom";

import Loader from "../../Shared/loader";
import LoginIcon from "../../Images/loginIcon.png";
import "./login.css";

const ResetPassword = () => {
  const { token } = useParams();
  const history = useHistory();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState();
  const [message, setMessage] = useState();

  const Loading = () => {
    if (loading) {
      return <Loader />;
    } else {
      return null;
    }
  };

  async function ResetPass() {
    setLoading(true);
    fetch("http://localhost:5000/api/connect/changePass", {
      method: "Put",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setLoading(false);
          setMessage(data.error);
        } else if (data.message) {
          setLoading(false);
          history.push("/user-login");
        }
      });
  }
  const Message = () => {
    if (message != null) {
      return <h5 className="errorMessage">{message}</h5>;
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
        <div>
          <h1 className="log-head">CONNECT</h1>
          <div className="form-body">
            <h4 className="form-head">RESET PASSWORD</h4>
            <br />
            <div className="log-form">
              <input
                className="form-ip"
                type="password"
                name="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <br />
              <Message />
              <br />
              <button
                className="form-btn"
                type="submit"
                onClick={() => ResetPass()}
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
