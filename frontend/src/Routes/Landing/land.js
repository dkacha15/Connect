import React, { Component } from "react";
import { Link } from "react-router-dom";

import "./land.css";

export default class Login extends Component {
  render() {
    return (
      <React.Fragment>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat+Subrayada:wght@700&display=swap"
          rel="stylesheet"
        />
        <div className="land-body">
          <div className="land-header">
            <h3 className="land-a">GET...</h3>
            <h3 className="land-c">SET..</h3>
            <Link to="/user-login">
              <h1 className="land-head">CONNECT.</h1>
            </Link>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
