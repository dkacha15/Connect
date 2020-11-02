import React from "react";
import { BoxLoading } from "react-loadingg";

import "./loader.css";

const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader">
        <BoxLoading color="#7FFFD4" speed="0.5" size="large" />
      </div>
    </div>
  );
};

export default Loader;
