import React from "react";

import PostForm from "../Post/post-form";
import Posts from "../Post/post";
import Navbar from "../../Shared/Navbar/navbar";
import "./home.css";

const Home = () => {
  return (
    <React.Fragment>
      <Navbar />
      <h1 className="home-head">POSTS</h1>
      <PostForm />
      <Posts />
    </React.Fragment>
  );
};

export default Home;
