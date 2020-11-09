import React from "react";
import "../Registration/confirmEmail.css";

const EmailVeri = () => {
  return (
    <React.Fragment>
      <h1 className="log-head">CONNECT</h1>
      <div class="container col-lg-7 mail-box">
        <br />
        <h3>
          Hey There! <br />
          <br />
         Your email has been successfully verified. You can login now! &#128512; <br />
          <br />
            <a className="btn btn-lg btn-primary" href="http://localhost:3000/user-login">Login</a>
          <br/>
          <br/>
          
          Regards
          <br />
          Team CONNECT &#128512;
        </h3>
        <br />
      </div>
    </React.Fragment>
  );
};

export default EmailVeri;
