import React, { useState, useEffect } from "react";
import "./editProfile.css";
import Navbar from "../../Shared/Navbar/navbar";
import { useHistory } from "react-router-dom";
import Add from "../../Images/registrationIcon.png";
import Loader from "../../Shared/loader";

const EditProfile = () => {
  const history = useHistory();
  const [skill, setSkill] = useState();
  const [strength, setStrength] = useState();
  const [image, setImage] = useState(
    "https://images.unsplash.com/photo-1555445091-5a8b655e8a4a?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjEyMDd9"
  );
  const [user, setUser] = useState();
  const [email, setEmail] = useState();
  const [contact, setContact] = useState();
  const [password, setPassword] = useState();
  const [loading, setLoading] = useState();
  const [userType, setUserType] = useState("");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/connect/getCurrentUser", {
      method: "Get",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        setUserType(result.user.type);
        setUserId(result.user._id);
        setUserName(result.user.name);

        fetch(`http://localhost:5000/api/connect/editProfile`, {
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
            setUser(result.founduser[0]);
            setImage(result.founduser[0].image_URL);
            setEmail(result.founduser[0].primary_email);
            setContact(result.founduser[0].contact);
            setPassword(result.founduser[0].password);
          });
      });
  }, []);
  async function UpdateProfile() {
    setLoading(true);
    fetch("http://localhost:5000/api/connect/updateProfile", {
      method: "Put",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        id: userId,
        primary_email: email,
        contact,
        password,
        skill,
        strength,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setLoading(false);
          setLoading(false);
        } else {
          setLoading(false);
          setUser(data.founduser[0]);
          history.push("/profile");
        }
      });
  }
  async function ChangePicture() {
    setLoading(true);
    const data = new FormData();
    data.append("file", image);
    data.append("upload_preset", "sdp-connect");
    data.append("cloud_name", "imkhy");
    
    fetch("https://api.cloudinary.com/v1_1/imkhy/image/upload", {
      method: "Post",
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        setImage(data.url);
        fetch("http://localhost:5000/api/connect/changePicture", {
          method: "Put",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            id: userId,
            image_URL: data.url,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              setLoading(false);
            } else {
              setLoading(false);
              setUser(data.founduser[0]);
              history.push("/profile");
            }
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }
  async function RemovePicture() {
    setLoading(true);

    fetch("http://localhost:5000/api/connect/removePicture", {
      method: "Put",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        id: userId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setLoading(false);
        } else {
          setLoading(false);
          setUser(data.founduser[0]);
          history.push("/profile");
        }
      });
  }
  async function ChangePassword() {
    setLoading(true);
    fetch("http://localhost:5000/api/connect/changePassword", {
      method: "Put",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        id: userId,
        password,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setLoading(false);
        } else {
          setLoading(false);
          setPassword(data.founduser.password);
          history.push("/profile");
        }
      });
  }
  const Loading = () => {
    if (loading) {
      return <Loader />;
    } else {
      return null;
    }
  };

  return (
    <React.Fragment>
      <Navbar />
      <Loading />
      <div className="container profile">
        <div className="row"></div>
        {user ? (
          <div>
            <div className="row justify-content-between">
              <div className="col-lg-4">
                <img
                  className="profile-pic"
                  src={user.image_URL}
                  alt="pic"
                ></img>
                <input
                  type="file"
                  name="poster"
                  style={{ color: "white" }}
                  placeholder="Event Poster"
                  onChange={(e) => setImage(e.target.files[0])}
                  required
                ></input>
                <input
                  type="submit"
                  className="btn btn-primary"
                  value="Change Picture"
                  onClick={() => ChangePicture()}
                ></input>
                &nbsp;
                <input
                  type="submit"
                  className="btn btn-primary"
                  value="Remove Picture"
                  onClick={() => RemovePicture()}
                ></input>
                &nbsp;
              </div>
              <div className="col-lg-7 bio">
                <h3>{userName}</h3>
                <h5>{userType.toUpperCase()}</h5>
                <br />
                <span>Email:</span>{" "}
                <input
                  type="text"
                  className="edit-ip"
                  defaultValue={user.primary_email}
                  onChange={(e) => setEmail(e.target.value)}
                ></input>
                <br />
                <br />
                <span>Contact:</span>{" "}
                <input
                  type="text"
                  className="edit-ip"
                  defaultValue={user.contact}
                  onChange={(e) => setContact(e.target.value)}
                ></input>
                <br />
                <br />
                <input
                  type="submit"
                  className="btn btn-primary"
                  value="Update Details"
                  onClick={() => UpdateProfile()}
                ></input>
                &nbsp;
                <br />
                <br />
                <span>Password:</span>{" "}
                <input
                  className="edit-ip"
                  type="password"
                  defaultValue=""
                  onChange={(e) => setPassword(e.target.value)}
                ></input>
                &nbsp;
                <input
                  type="submit"
                  className="btn btn-primary"
                  value="Update Password"
                  onClick={() => ChangePassword()}
                ></input>
                &nbsp;
                <br />
              </div>
            </div>
            <br />
            <div
              className="row justify-content-center tabs"
              style={{ background: "#66CCFF" }}
            >
              <div className="col-lg-12">
                <div className="row justify-content-center">
                  <h2>ADD SKILLS</h2>
                </div>
                <br />
                <div className="row justify-content-center">
                  <div className="col-lg-3">
                    &nbsp;<span>Skill:</span>{" "}
                    <input
                      className="edit-ip"
                      type="text"
                      defaultValue=""
                      onChange={(e) => setSkill(e.target.value)}
                    ></input>
                    &nbsp;
                  </div>
                  <div className="col-lg-5">
                    &nbsp;<span>Strength(1-10):</span>{" "}
                    <input
                      className="edit-ip"
                      type="text"
                      defaultValue=""
                      min="1"
                      max="10"
                      step="1"
                      onChange={(e) => setStrength(e.target.value)}
                    ></input>
                    &nbsp;
                  </div>
                  <div className="col-lg-2">
                    &nbsp;{" "}
                    <button
                      className="skill-btn"
                      onClick={() => UpdateProfile()}
                    >
                      <img
                        src={Add}
                        alt="pic"
                        style={{ height: 35 + "px", width: 35 + "px" }}
                      ></img>
                    </button>
                  </div>
                  <br />
                  <br />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </React.Fragment>
  );
};
export default EditProfile;
