import React, { useState, useEffect } from "react";
import Modal from "react-awesome-modal";
import io from "socket.io-client";
import * as moment from "moment";
import "./chat.css";
import Navbar from "../../Shared/Navbar/navbar";
import AddChatIcon from "../../Images/addChat.png";
import GroupChatIcon from "../../Images/groupChat.png";

const ENDPOINT = "http://localhost:5000";

let socket;

const Chat = () => {
  const [chatModal, setChatModal] = useState();
  const [title, setTitle] = useState("");
  const [groupChatModal, setGroupChatModal] = useState();
  const [search, setSearch] = useState();
  const [userDetails, setUserDetails] = useState([]);
  const [chatRooms, setchatRooms] = useState([]);
  const [groupChatRooms, setGroupChatRooms] = useState([]);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    socket = io(ENDPOINT);
    fetch("http://localhost:5000/api/connect/getCurrentUser", {
      method: "Get",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        setUserId(result.user._id);
      });

    fetch("http://localhost:5000/api/connect/getAllChatroom", {
      method: "Get",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setchatRooms(
          data.chatRoom.sort((a, b) =>
            b.lastMessage_time > a.lastMessage_time ? 1 : -1
          )
        );
      });
    fetch("http://localhost:5000/api/connect/getGroupChatRooms", {
      method: "Get",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setGroupChatRooms(
          data.chatRoom.sort((a, b) =>
            b.lastMessage_time > a.lastMessage_time ? 1 : -1
          )
        );
      });

    socket.on("refreshPersonalChatPage", (data) => {
      getAllChatRoom();
    });
    socket.on("refreshGroupChatPage", (data) => {
      getGroupChatRoom();
      // createChatRoom();
    });
  }, []);

  const getAllChatRoom = () => {
    fetch("http://localhost:5000/api/connect/getAllChatroom", {
      method: "Get",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setchatRooms(
          data.chatRoom.sort((a, b) =>
            b.lastMessage_time > a.lastMessage_time ? 1 : -1
          )
        );
      });
  };

  const getGroupChatRoom = () => {
    fetch("http://localhost:5000/api/connect/getGroupChatRooms", {
      method: "Get",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setGroupChatRooms(
          data.chatRoom.sort((a, b) =>
            b.lastMessage_time > a.lastMessage_time ? 1 : -1
          )
        );
      });
  };

  const createChatRoom = () => {
    fetch("http://localhost:5000/api/connect/createChatroom", {
      method: "Post",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        title,
        sender_id: userId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          getGroupChatRoom();
        }
      });
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

  const messageDate = (date) => {
    return moment(date).calendar(null, {
      sameDay: "[Today]",
      lastDay: "[Yesterday]",
      lastWeek: "DD/MM/YYYY",
      sameElse: "DD/MM/YYYY",
    });
  };

  return (
    <React.Fragment>
      <Navbar />
      <h1 className="chat-heading">CHATS</h1>
      <div className="container">
        <div className="row justify-content-between">
          <div className="col-lg-6 header">
            <h3>Your Chats</h3>
          </div>
          <div className="col-lg-6 header">
            <h3>Your Groups</h3>
          </div>
        </div>

        <div className="etr">
          <div className="container your-chat-container">
            <div className="chats col-lg-6">
              {chatRooms.map((room) => {
                return (
                  <a
                    href={`/chatRoom/${room.user2_id._id}`}
                    className="link col-lg-6"
                    key={room._id}
                  >
                    <div className="container chatRoom-container">
                      <div className="card chatRoom-card">
                        <div className="chatRoom-header">
                          <img
                            className="chatRoom-user-picture"
                            src={room.user2_id.image_URL}
                            alt="..."
                          />
                          <div>
                            <h5 className="card-title chatRoom-user">
                              {room.user2_id.name}
                            </h5>

                            {room.lastMessage_sender === userId ? (
                              <div>
                                {room.lastMessage.length < 20 ? (
                                  <h5 className="chatRoom-message">
                                    You: {room.lastMessage}
                                  </h5>
                                ) : (
                                  <h5 className="chatRoom-message">
                                    You: {room.lastMessage.substring(0, 20)}...
                                  </h5>
                                )}
                              </div>
                            ) : (
                              <div>
                                {room.lastMessage.length < 20 ? (
                                  <h5 className="chatRoom-message">
                                    {room.lastMessage}
                                  </h5>
                                ) : (
                                  <h5 className="chatRoom-message">
                                    {room.lastMessage.substring(0, 20)}...
                                  </h5>
                                )}
                              </div>
                            )}

                            <h5 className="message-date">
                              {messageDate(room.lastMessage_time)}{" "}
                            </h5>
                            <h5 className="message-time">
                              {moment(room.lastMessage_time).format("hh:mm A")}
                            </h5>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="container your-chat-container">
            <div className="groups col-lg-6">
              {groupChatRooms.map((room) => {
                // console.log(room);
                return (
                  <a
                    href={`/groupChatRoom/${room.groupChatRoom_id._id}`}
                    className="link col-lg-6"
                    key={room._id}
                  >
                    <div className="container chatRoom-container">
                      <div className="card chatRoom-card">
                        <div className="chatRoom-header">
                          <img
                            className="chatRoom-user-picture"
                            src={room.groupChatRoom_id.picture}
                            alt="..."
                          />
                          <div>
                            <h5 className="card-title chatRoom-user">
                              {room.groupChatRoom_id.title}
                            </h5>

                            {room.lastMessage_sender === null ? (
                              room.admin._id === userId ? (
                                <div>
                                  <h5 className="chatRoom-message">
                                    You created the group!
                                  </h5>
                                </div>
                              ) : (
                                <div>
                                  <h5 className="chatRoom-message">
                                    {room.admin.name} created the group!
                                  </h5>
                                </div>
                              )
                            ) : room.lastMessage_sender._id === userId ? (
                              <div>
                                {room.lastMessage.length < 20 ? (
                                  <h5 className="chatRoom-message">
                                    You: {room.lastMessage}
                                  </h5>
                                ) : (
                                  <h5 className="chatRoom-message">
                                    You: {room.lastMessage.substring(0, 20)}...
                                  </h5>
                                )}
                              </div>
                            ) : (
                              <div>
                                {room.lastMessage.length < 20 ? (
                                  <h5 className="chatRoom-message">
                                    {room.lastMessage_sender.name}
                                    {" : "}
                                    {room.lastMessage}
                                  </h5>
                                ) : (
                                  <h5 className="chatRoom-message">
                                    {room.lastMessage_sender.name}
                                    {" : "}
                                    {room.lastMessage.substring(0, 20)}...
                                  </h5>
                                )}
                              </div>
                            )}

                            <h5 className="message-date">
                              {messageDate(room.lastMessage_time)}{" "}
                            </h5>
                            <h5 className="message-time">
                              {moment(room.lastMessage_time).format("hh:mm A")}
                            </h5>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          <img
            className="chat-button"
            src={AddChatIcon}
            alt="add chat"
            onClick={() => {
              setChatModal(true);
            }}
          />
          <img
            className="group-chat-button"
            src={GroupChatIcon}
            alt="add chat"
            onClick={() => {
              setGroupChatModal(true);
              setTitle("");
            }}
          />
          <Modal
            visible={chatModal}
            width="400"
            effect="fadeInUp"
            onClickAway={() => setChatModal(false)}
          >
            <div className="chat-search">
              <h4 className="chat-head">Start Chatting</h4>
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
                    href={`/chatRoom/${user._id}`}
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
          <Modal
            visible={groupChatModal}
            width="400"
            effect="fadeInUp"
            onClickAway={() => setGroupChatModal(false)}
          >
            <div className="chat-search">
              <h4 className="chat-head">Create a Group</h4>
              <input
                type="text"
                className="form-control chat-search-box"
                placeholder="Add Group Title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              &nbsp;&nbsp;&nbsp;&nbsp;
              <button
                className="btn btn-md btn-primary"
                onClick={() => {
                  setGroupChatModal(false);
                  createChatRoom();
                }}
              >
                Create Group
              </button>
            </div>
          </Modal>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Chat;
