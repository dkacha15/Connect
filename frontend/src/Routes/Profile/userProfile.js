import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import "./profile.css";
import Navbar from "../../Shared/Navbar/navbar";
import UserTabs from "./userTabs";

const UserProfile = () => {
  const [user, setUser] = useState();
  const [userstatus, setUserStatus] = useState(false);
  const userid = useParams();
  useEffect(() => {
    // console.log("userid");
    fetch(`http://localhost:5000/api/connect/profile/${userid.userid}`, {
      method: "Get",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        // console.log(data);
        setUser(data.fuser);
        setUserStatus(true);
      });
  }, [userid.userid]);
  return (
    <React.Fragment>
      <Navbar />
      <div className="container profile">
        <div className="row"></div>
        {userstatus ? (
          <div className="row justify-content-between">
            <div className="col-lg-4">
              <img className="profile-pic" src={user.image_URL} alt="..."></img>
            </div>
            <div className="col-lg-7 bio">
              <br />
              <h3>{user.name}</h3>
              <h5>{user.type.toUpperCase()}</h5>
              <h6>Email: {user.primary_email}</h6>
              <h6>Contact:{user.contact}</h6>
              <div className="row">
                &nbsp;
                <Link to={`/chatRoom/${userid.userid}`}>
                  <button className="btn btn-primary">Send Message</button>
                </Link>
                &nbsp;
              </div>
            </div>
          </div>
        ) : (
          <div></div>
        )}

        <br />
        <div className="row justify-content-center">
          <div className="col-lg-12">
            <UserTabs />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default UserProfile;
