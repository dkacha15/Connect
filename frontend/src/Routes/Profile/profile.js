import React, { useState, useEffect } from "react";
import "./profile.css";
import Navbar from "../../Shared/Navbar/navbar";
import Tabs from "./tabs";
import { Link } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState([]);
  const [type, setType] = useState();
  useEffect(() => {
    fetch("http://localhost:5000/api/connect/getCurrentUser", {
      method: "Get",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        fetch(`http://localhost:5000/api/connect/myProfile`, {
          method: "Post",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            id: result.user._id,
          }),
        })
          .then((res) => res.json())
          .then((result) => {
            // console.log(result.user[0]);
            setUser(result.user[0]);
            setType(result.user[0].type.toUpperCase());
          });
      });
  }, []);
  return (
    <React.Fragment>
      <Navbar />
      <div className="container profile">
        <div className="row"></div>
        <div className="row justify-content-center">
          <div className="col-lg-4">
            <img className="profile-pic" src={user.image_URL} alt="..."></img>
          </div>
          <div className="col-lg-6 bio">
            &nbsp;
            <h3>{user.name}</h3>
            <h5>{type}</h5>
            <h6>Email: {user.primary_email}</h6>
            <h6>Contact: {user.contact}</h6>
            <div className="row">
              &nbsp;&nbsp;
              <Link className="btn btn-primary" to="/editprofile">
                Edit Profile
              </Link>
              &nbsp;
              <Link className="btn btn-primary" to="/editprofile">
                Change Password
              </Link>
            </div>
          </div>
        </div>
        <br />
        <br />
        <div className="row justify-content-center ">
          <div className="col-lg-12">
            <Tabs />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Profile;
