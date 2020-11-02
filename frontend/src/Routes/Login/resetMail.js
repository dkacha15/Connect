import React from "react";
import "../Registration/confirmEmail.css";

const ResetMail = () => {
  return (
    <React.Fragment>
      <h1 className="log-head">CONNECT</h1>
      <div class="container col-lg-7 mail-box">
        <br />
        <h3>
          Hey There! <br />
          <br />
          We have sent an Reset Password email to your registered Email Address!
          We request you to check your mail box and click on the sent link to
          change your account password! &#128512; <br />
          <br />
          Regards
          <br />
          Team CONNECT &#128512;
        </h3>
        <br />
      </div>
    </React.Fragment>
  );
};

export default ResetMail;
