import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import Flash from "../../Shared/Flash/index";
import Bus from '../../Shared/Utils/bus';
import Loader from "../../Shared/loader";
import RegistrationIcon from "../../Images/registrationIcon.png";
import "./registration.css";

const Registration = () => {
  const history = useHistory();
  const [name, setName] = useState("");
  const [primary_email, setPrimary_email] = useState("");
  const [secondary_email, setSecondary_email] = useState("");
  const [type, setType] = useState("Student");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState();
  window.flash = (message, type="success") => Bus.emit('flash', ({message, type}));
  const signUp = () => {
    setLoading(true);
    fetch("http://localhost:5000/api/connect/signup", {
      method: "Post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        primary_email: primary_email.toLocaleLowerCase(),
        secondary_email: secondary_email.toLocaleLowerCase() + "@ddu.ac.in",
        type: type.toLocaleLowerCase(),
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
            // localStorage.setItem("token", data.token);
            // localStorage.setItem("id", data.user.id);
            // localStorage.setItem("type", data.user.type);
            // localStorage.setItem("name", data.user.name);
            setMessage(data.message);
            setLoading(false);
            history.push("/email-verification");
          }
        }, 1000);
      });
  };

  const Loading = () => {
    if (loading) {
      return <Loader />;
    } else {
      return null;
    }
  };

  const Message = () => {
    if (message) {
      window.flash(message, 'error');
      return null;
    } else {
      return null;
    }
  };

  const thirdMethod = (e) => {
    const re = /[0-9a-zA-Z]+/g;
    if (!re.test(e.key)) {
      e.preventDefault();
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
      <div className="reg-body">
        <Flash/>
        <div>
          <h1 className="reg-head">CONNECT</h1>
          <div className="reg-form-body">
            <h4 className="form-head">Registration</h4>

            <div className="reg-form">
              <input
                className="form-ip"
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <br />
              <select
                className="form-ip"
                placeholder="User Type"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                }}
                required
              >
                <option name="student"> Student</option>
                <option name="graduate"> Graduate</option>
              </select>
              <br />
              <input
                className="form-ip"
                type="email"
                name="email"
                placeholder="Email"
                value={primary_email}
                onChange={(e) => setPrimary_email(e.target.value)}
                required
              />
              <br />
              {type === "Student" ? (
                <div>
                  <input
                    className="id-ip"
                    type="email"
                    name="sec-email"
                    placeholder="University ID"
                    value={secondary_email}
                    onChange={(e) => {
                      setSecondary_email(e.target.value);
                    }}
                    onKeyPress={(e) => thirdMethod(e)}
                    required
                  />
                  <p className="suffix">@ddu.ac.in</p>
                </div>
              ) : (
                <div></div>
              )}

              <input
                className="form-ip"
                type="password"
                name="fullName"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <br />
              <Message />
              <button
                className="form-btn"
                type="submit"
                onClick={() => signUp()}
              >
                <img
                  className="form-icon"
                  src={RegistrationIcon}
                  alt="Registration"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Registration;
