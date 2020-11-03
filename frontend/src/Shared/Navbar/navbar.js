import React, { useEffect, useState } from "react";
import Modal from "react-awesome-modal";
import _ from "lodash";
import * as moment from "moment";
import "./navbar.css";
import cookie from "react-cookies";
import io from "socket.io-client";
import { Link } from "react-router-dom";

const ENDPOINT = "http://localhost:5000";

let socket;

const Navbar = () => {
  const [notificationModal, setNotificationModal] = useState(false);
  const [notificationCount, setNotificationCount] = useState();
  const [notificationArr, setNotificationArr] = useState([]);
  const [searchModal, setSearchModal] = useState(false);
  const [search, setSearch] = useState();
  const [userDetails, setUserDetails] = useState([]);
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    socket = io(ENDPOINT);

    fetch("http://localhost:5000/api/connect/getCurrentUser", {
      method: "Get",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        setUserId(result.user._id);
        setUserName(result.user.name);
      });

    fetch("http://localhost:5000/api/connect/allNotifications", {
      method: "Get",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setNotificationArr(
          data.notifications.sort((a, b) =>
            b.createdAt > a.createdAt ? 1 : -1
          )
        );
        setNotificationCount(
          _.filter(data.notifications, ["marked", false]).length
        );
      });

    socket.on("refreshNotificationsModal", () => {
      getAllNotifications();
    });
  }, [userId]);

  const markAllNotification = () => {
    fetch("http://localhost:5000/api/connect/markedAllNotifications", {
      method: "Get",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        socket.emit("refreshNotifications", {});
      });
  };

  const Profile = () => {
    fetch("http://localhost:5000/api/connect/myProfile/", {
      method: "Post",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        id: userId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {});
  };

  const fetchUser = (query) => {
    setSearch(query);
    if (query !== "") {
      fetch("http://localhost:5000/api/connect/searchUser", {
        method: "Post",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          query,
        }),
      })
        .then((res) => res.json())
        .then((result) => {
          setUserDetails(result.user);
        });
    } else {
      setUserDetails([]);
    }
  };

  const getAllNotifications = () => {
    fetch("http://localhost:5000/api/connect/allNotifications", {
      method: "Get",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setNotificationArr(
          data.notifications.sort((a, b) =>
            b.createdAt > a.createdAt ? 1 : -1
          )
        );
        setNotificationCount(
          _.filter(data.notifications, ["marked", false]).length
        );
      });
  };

  const logOut = () => {
    cookie.remove("access_token");
    fetch("http://localhost:5000/api/connect/logOut", {
      method: "Get",
      credentials: "include",
    })
      .then((res) => res.json())
      .then();
  };

  return (
    <React.Fragment>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark .connect-nav-bar navbar-fixed-top">
        <a className="navbar-brand" href="/">
          CONNECT
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item" style={{ marginLeft: 30 + "px" }}>
              <a className="nav-link" href="/home">
                Home <span className="sr-only">(current)</span>
              </a>
            </li>
            <li className="nav-item" style={{ marginLeft: 30 + "px" }}>
              <a className="nav-link" href="/event">
                Events <span className="sr-only">(current)</span>
              </a>
            </li>
            <li className="nav-item" style={{ marginLeft: 30 + "px" }}>
              <a className="nav-link" href="/chat">
                Chats<span className="sr-only">(current)</span>
              </a>
            </li>
            <li className="nav-item" style={{ marginLeft: 30 + "px" }}>
              <div
                className="nav-link"
                style={{ cursor: "pointer" }}
                onClick={() => setSearchModal(true)}
              >
                Search<span className="sr-only">(current)</span>
              </div>
            </li>
          </ul>
          <ul className="nav navbar-nav navbar-right">
            <li className="nav-item" style={{ marginLeft: 30 + "px" }}>
              <a
                className="nav-link"
                href="/profile"
                onClick={() => {
                  Profile();
                }}
              >
                Howdy, {userName}
              </a>
            </li>
            <li className="nav-item" style={{ marginLeft: 30 + "px" }}>
              <h5
                className="nav-link notification"
                onClick={() => setNotificationModal(true)}
              >
                Notifications{"  "}
                <span className="badge badge-light notification-count">
                  {notificationCount}
                </span>
              </h5>
            </li>
            <li className="nav-item" style={{ marginLeft: 30 + "px" }}>
              <a
                className="nav-link"
                onClick={() => {
                  logOut();
                  cookie.remove("access_token");
                }}
                href="/"
              >
                LogOut
              </a>
            </li>
          </ul>
          <form className="form-inline my-2 my-lg-0">
            {/* <input className="form-control mr-sm-2" type="search" placeholder="Search" aria-label="Search"/>
            <button className="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button> */}
          </form>
        </div>
      </nav>
      <Modal
        visible={notificationModal}
        width="450"
        effect="fadeInUp"
        onClickAway={() => setNotificationModal(false)}
      >
        <div className="notifications">
          {notificationArr.length === 0 ? (
            <h4 className="notification-heading">No Notifications</h4>
          ) : (
            <h4 className="notification-heading">Notifications</h4>
          )}
          {notificationArr.map((notification) => {
            return (
              <a classname="elink" href={notification.link} key={notification._id}>
                <div className="card notifications-card" key={notification._id}>
                <img
                  className="notifications-user-picture"
                  src={notification.senderId.image_URL}
                  alt="..."
                />
                <div>
                  {notification.marked ? (
                    <h5 className="notifications-text marked link">
                      {notification.message}
                    </h5>
                  ) : (
                    <h5 className="notifications-text link">
                      {notification.message}
                    </h5>
                  )}
                  <hr />
                  <h6 className="notification-time link">
                    {moment(notification.createdAt).fromNow()}
                  </h6>
                </div>
              </div>
              </a>
            );
          })}
          {notificationArr.length === 0 ? (
            <div></div>
          ) : (
            <button
              className="btn btn-primary marked-all"
              onClick={() => markAllNotification()}
            >
              Marked All
            </button>
          )}
        </div>
      </Modal>
      <Modal
        visible={searchModal}
        width="400"
        effect="fadeInUp"
        onClickAway={() => setSearchModal(false)}
      >
        <div className="chat-search">
          <h4 className="chat-head">Search User</h4>
          <input
            type="text"
            className="form-control chat-search-box"
            placeholder="Search User..."
            value={search}
            onChange={(e) => fetchUser(e.target.value)}
          />
          {userDetails.map((user) => {
            return (
              <a
                href={`/profile/${user._id}`}
                className="link"
                key={user._id}
                // onClick={() => socket.emit("refresh", {})}
              >
                <div key={user._id}>
                  {user._id === userId ? (
                    <div></div>
                  ) : (
                    <div className="card chat-search-card">
                      <img
                        className="chat-search-user-picture"
                        src={user.image_URL}
                        alt="..."
                      />
                      <div>
                        <h5 className="card-title chat-search-name">
                          {user.name}
                        </h5>
                      </div>
                    </div>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      </Modal>
    </React.Fragment>
  );
};

export default Navbar;
