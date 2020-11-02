import React, { useEffect, useState, useRef } from "react";
import Modal from "react-awesome-modal";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import * as moment from "moment";
import Picker from "emoji-picker-react";
import AddEventIcon from "../../Images/addEvent.png";
import Navbar from "../../Shared/Navbar/navbar";
import "./groupChatRoom.css";
import SendButton from "../../Images/sendMessage.png";
import EmojiButton from "../../Images/emojiIcon.png";
import Loader from "../../Shared/loader";
import AttachIcon from "../../Images/attachIcon.png";
const nl2br = require("react-nl2br");

const axios = require("axios");

const ENDPOINT = "http://localhost:5000";

let socket;

const ChatRoom = () => {
  let { chatroom_id } = useParams();

  const [search, setSearch] = useState();
  const [userDetails, setUserDetails] = useState([]);
  const [messages, setMessages] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [members, setMembers] = useState([]);
  const [groupmembers, setGroupMembers] = useState([]);
  const [emojiPicker, setEmojiPicker] = useState(false);
  const [groupChatRooms, setGroupChatRooms] = useState([]);
  const [addModal, setAddModal] = useState();
  const [memberModal, setMemberModal] = useState();
  const [admin, setAdmin] = useState();
  const [image, setImage] = useState();
  const [imageUrl, setImageUrl] = useState();
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState();
  const [userId, setUserId] = useState();
  const [file, setfile] = useState("");
  const [fileName, setfileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [size, setSize] = useState(0);

  useEffect(() => {
    socket = io(ENDPOINT);

    fetch("http://localhost:5000/api/connect/getCurrentUser", {
      method: "Get",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        setUserId(result.user._id);

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
        fetch(
          `http://localhost:5000/api/connect/${chatroom_id}/getAllMembers`,
          {
            method: "Get",
            credentials: "include",
          }
        )
          .then((res) => res.json())
          .then((data) => {
            setGroupMembers(data.members);
            setAdmin(data.admin);
            setImage(data.image);
          });
        fetch(
          `http://localhost:5000/api/connect/getGroupMessage/${result.user._id}/${chatroom_id}`,
          {
            method: "Get",
            credentials: "include",
          }
        )
          .then((res) => res.json())
          .then((data) => {
            if (data.message) {
              setMessages(data.chats);
              setTitle(data.title);
            }
          });
      });

    socket.on("refreshGroupChatPage", (data) => {
      getGroupChatRoom();
    });

    socket.on("refreshGroupMessagePage", (data) => {
      getAllMessage();
      getAllMembers();
    });
    //eslint-disable-next-line
  }, [chatroom_id]);

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({
      block: "end",
      inline: "nearest",
    });
  };

  useEffect(scrollToBottom, [messages]);

  const getGroupChatRoom = () => {
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
  };

  const getAllMembers = () => {
    fetch(`http://localhost:5000/api/connect/${chatroom_id}/getAllMembers`, {
      method: "Get",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setGroupMembers(data.members);
      });
  };

  const fetchUser = (query) => {
    setSearch(query);
    if (query !== "") {
      fetch("http://localhost:5000/api/connect/searchOtherUser", {
        method: "Post",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          query,
          chatroom_id,
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

  const onEmojiClick = (event, emojiObject) => {
    setMessage(message + emojiObject.emoji);
  };

  const addMember = () => {
    fetch(`http://localhost:5000/api/connect/addMember/${chatroom_id}`, {
      method: "Post",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        members,
        admin: userId,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          setAddModal(false);
          getAllMembers();
          socket.emit("refreshNotifications", {});
          socket.emit("refreshGroupChatRoom", {});
        }
      });
  };

  const getAllMessage = () => {
    fetch("http://localhost:5000/api/connect/getCurrentUser", {
      method: "Get",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        fetch(
          `http://localhost:5000/api/connect/getGroupMessage/${result.user._id}/${chatroom_id}`,
          {
            method: "Get",
            credentials: "include",
          }
        )
          .then((res) => res.json())
          .then((data) => {
            if (data.message) {
              setMessages(data.chats);
              setTitle(data.title);
            }
          });
      });
  };

  async function sendMessage() {

    if(file){
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "connect");
      data.append("cloud_name", "dy6relv7v");

      const options = {
        onUploadProgress: (ProgressEvent) => {
          const { loaded, total } = ProgressEvent;
          let percentage = Math.floor((loaded * 100) / total);
          setMessage(fileName + " Uploading:" + percentage + "%");
        },
      };

      // eslint-disable-next-line
      Array.prototype.insert = function ( index, item ) {
        this.splice( index, 0, item );
      };

      if (fileType === "image") {
        axios
          .post(
            "https://api.cloudinary.com/v1_1/dy6relv7v/image/upload",
            data,
            options
          )
          .then((data) => {
            var url=data.data.url;
            var link=url.split("/");
            link.insert(6,"fl_attachment");
            var download_link=link[0]+"//"+link[2]+"/"+link[3]+"/"+link[4]+"/"+link[5]+"/"+link[6]+"/"+link[7]+"/"+link[8];
            fetch(
              `http://localhost:5000/api/connect/sendGroupMessage/${userId}`,
              {
                method: "Put",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                  chatroom_id,
                  message: fileName,
                  message_type: "image",
                  attachment_URL: data.data.url,
                  download_URL:download_link,
                  size:size
                }),
              }
            )
              .then((res) => res.json())
              .then((data) => {
                socket.emit("refreshGroupMessages", {});
                setTimeout(() => {
                  socket.emit("refreshGroupChatRoom", {});
                  socket.emit("refreshNotifications", {});
                }, 100);

                setMessage("");
              });
          });
      }else if (fileType === "video") {
        axios
          .post(
            "https://api.cloudinary.com/v1_1/dy6relv7v/video/upload",
            data,
            options
          )
          .then((data) => {
            var url=data.data.url;
            var link=url.split("/");
            link.insert(6,"fl_attachment");
            var download_link=link[0]+"//"+link[2]+"/"+link[3]+"/"+link[4]+"/"+link[5]+"/"+link[6]+"/"+link[7]+"/"+link[8];
            fetch(
              `http://localhost:5000/api/connect/sendGroupMessage/${userId}`,
              {
                method: "Put",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                  chatroom_id,
                  message: fileName,
                  message_type: "video",
                  attachment_URL: data.data.url,
                  download_URL:download_link,
                  size:size
                }),
              }
            )
              .then((res) => res.json())
              .then((data) => {
                socket.emit("refreshGroupMessages", {});
                setTimeout(() => {
                   socket.emit("refreshNotifications", {});
                   socket.emit("refreshGroupChatRoom", {});
                }, 100);

                setMessage("");
              });
          });
      }else {
        axios
          .post(
            "https://api.cloudinary.com/v1_1/dy6relv7v/raw/upload",
            data,
            options
          )
          .then((data) => {
            var url=data.data.url;
            var link=url.split("/");
            link.insert(6,"fl_attachment");
            var download_link=link[0]+"//"+link[2]+"/"+link[3]+"/"+link[4]+"/"+link[5]+"/"+link[6]+"/"+link[7]+"/"+link[8];
            fetch(
              `http://localhost:5000/api/connect/sendGroupMessage/${userId}`,
              {
                method: "Put",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                  chatroom_id,
                  message: fileName,
                  message_type: "other",
                  attachment_URL: data.data.url,
                  download_URL:download_link,
                  size:size
                }),
              }
            )
              .then((res) => res.json())
              .then((data) => {
                socket.emit("refreshGroupMessages", {});
                setTimeout(() => {
                   socket.emit("refreshGroupChatRoom", {});
                   socket.emit("refreshNotifications", {});
                 }, 100);

                setMessage(""); 
              });
          });
      }
    }else{
      fetch(`http://localhost:5000/api/connect/sendGroupMessage/${userId}`, {
      method: "Put",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        chatroom_id,
        message,
        message_type: "Text",
        attachment_URL: "",
        download_URL:"",
        size:0
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          socket.emit("refreshGroupMessages", {});
          setTimeout(() => {
            socket.emit("refreshGroupChatRoom", {});
            socket.emit("refreshNotifications", {});
          }, 100);

          setMessage("");
        }
      });
    }
  }

  async function ChangePicture() {
    setLoading(true);
    const data = new FormData();
    data.append("file", imageUrl);
    data.append("upload_preset", "connect");
    data.append("cloud_name", "dy6relv7v");

    await fetch("https://api.cloudinary.com/v1_1/dy6relv7v/image/upload", {
      method: "Post",
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        setImage(data.url);
        fetch(
          `http://localhost:5000/api/connect/${chatroom_id}/changePicture`,
          {
            method: "Put",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              picture: data.url,
            }),
          }
        )
          .then((res) => res.json())
          .then((data) => {
            if (data.message) {
              setLoading(false);
              setMemberModal(false);
              socket.emit("refreshGroupChatRoom", {});
            } else {
              setLoading(false);
              console.log(data);
            }
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const Loading = () => {
    if (loading) {
      return <Loader />;
    } else {
      return null;
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
      <Loading />
      <h1 className="chat-heading">CHATS</h1>
      <div className="chatRoom">
        <div className="container chats-container">
          <div className="card chats-card">
            <h5 className="chats-heading">Group Chats</h5>
            {groupChatRooms.map((chatRoom) => {
              return (
                <a
                  href={`/groupChatRoom/${chatRoom.groupChatRoom_id._id}`}
                  onClick={() => {
                    setTitle(chatRoom.groupChatRoom_id.title);
                  }}
                  className="link"
                  key={chatRoom._id}
                >
                  <div className="chats-list">
                    <img
                      className="chats-list-user-picture"
                      src={chatRoom.groupChatRoom_id.picture}
                      alt="..."
                    />
                    <div>
                      <h5 className="chats-list-username">
                        {chatRoom.groupChatRoom_id.title}
                      </h5>

                      {chatRoom.lastMessage_sender === null ? (
                        <div></div>
                      ) : chatRoom.lastMessage_sender._id === userId ? (
                        <div>
                          {chatRoom.lastMessage.length < 12 ? (
                            <h5 className="chat-list-message">
                              You: {chatRoom.lastMessage}
                            </h5>
                          ) : (
                            <h5 className="chat-list-message">
                              You: {chatRoom.lastMessage.substring(0, 12)}...
                            </h5>
                          )}
                        </div>
                      ) : (
                        <div>
                          {chatRoom.lastMessage.length < 12 ? (
                            <h5 className="chat-list-message">
                              {chatRoom.lastMessage_sender.name}
                              {" : "}
                              {chatRoom.lastMessage}
                            </h5>
                          ) : (
                            <h5 className="chat-list-message">
                              {chatRoom.lastMessage.substring(0, 12)}...
                            </h5>
                          )}
                        </div>
                      )}
                      <hr />
                      <h5 className="chat-list-message-date">
                        {messageDate(chatRoom.lastMessage_time)}
                        {","}
                        {moment(chatRoom.lastMessage_time).format("hh:mm A")}
                      </h5>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
        <div className="container chatbox-container">
          <div className="card chatbox-card">
            <div className="chatbox-header">
              <img className="chatbox-user-picture" src={image} alt="..." />
              <div>
                <h5
                  className="chatbox-username"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setMemberModal(true);
                  }}
                >
                  {title}
                </h5>
              </div>
              <Modal
                visible={memberModal}
                width="400"
                effect="fadeInUp"
                onClickAway={() => setMemberModal(false)}
              >
                <div className="chat-search">
                  <h4 className="chat-head">Group Image</h4>
                  <img className="group-pic" src={image} alt="pic"></img>
                  <input
                    type="file"
                    name="poster"
                    style={{ color: "white" }}
                    placeholder="Event Poster"
                    onChange={(e) => setImageUrl(e.target.files[0])}
                    required
                  ></input>
                  <input
                    type="submit"
                    className="btn btn-primary"
                    value="Change Picture"
                    onClick={() => ChangePicture()}
                  ></input>
                  <br />
                  <br />
                  <h4 className="chat-head">Group Members</h4>
                  {groupmembers.map((user) => {
                    return (
                      <div key={user._id}>
                        {user._id === userId ? (
                          <div className="card chat-search-card">
                            <img
                              className="chat-search-user-picture"
                              src={user.image_URL}
                              alt="..."
                            />
                            <div>
                              <h5 className="card-title chat-search-name">
                                You
                              </h5>
                            </div>
                          </div>
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
                    );
                  })}
                </div>
              </Modal>
              {admin === userId ? (
                <img
                  className="chat-button"
                  src={AddEventIcon}
                  alt="add chat"
                  onClick={() => {
                    setAddModal(true);
                  }}
                />
              ) : (
                <div></div>
              )}

              <Modal
                visible={addModal}
                width="400"
                effect="fadeInUp"
                onClickAway={() => setAddModal(false)}
              >
                <div className="chat-search">
                  <h4 className="chat-head">Add Members</h4>
                  <input
                    type="text"
                    className="form-control chat-search-box"
                    placeholder="Search User..."
                    value={search}
                    onChange={(e) => fetchUser(e.target.value)}
                  />
                  {userDetails.map((user) => {
                    return (
                      <div
                        
                        className="link"
                        key={user._id}
                        style={{ cursor: "pointer" }}
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
                                <input key={Math.random()} type="checkbox" className="check-box" defaultChecked={false} onChange={() =>{
                          if (members.indexOf(user._id) <= -1) {
                            members.push(user._id);
                            console.log(members);
                          }
                          else{
                            members.splice(members.indexOf(user._id),1);
                            console.log(members);
                          }
                        }} ></input>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <br />

                  <button
                    className="btn btn-lg btn-primary add-btn"
                    onClick={() => {
                      addMember();
                      setMembers([]);
                    }}
                  >
                    Add
                  </button>
                  <br />
                  <br />
                </div>
              </Modal>
              <div></div>
            </div>
            <div className="chatbox-body">
              {messages.map((usermessage) => {
                return (
                  <div key={usermessage._id}>
                    {usermessage.senderId._id === userId?(
                      <div>
                        {usermessage.message_type === "image" ?(
                          <div className="chat">
                            <div className="bubble slide-right">
                                <h5 className="message">
                                <img
                                  style={{ maxWidth: "300px" }}
                                  src={usermessage.attachment_URL}
                                  alt="img"
                                  controls
                                />
                                </h5>
                                <a className="link" href={usermessage.download_URL} style={{float:"right"}}>
                                <button
                                style={{background:"lightsteelblue", border:"none"}}
                              >
                                <img src="https://cdn.iconscout.com/icon/premium/png-256-thumb/download-button-1136559.png"
                                style={{height:38+"px",width:40+"px", float:"right"}}
                                alt="img"></img>
                              </button>
                                </a>
                              
                                <hr />
                                {(usermessage.size>0?( <h6>{usermessage.size}MB</h6>):(<div></div>))}
                                <h6 className="chat-message-time">
                                  {messageDate(usermessage.createdAt)}
                                  {","}
                                  {moment(usermessage.createdAt).format(
                                      "hh:mm A"
                                  )}
                                </h6>
                              </div>
                            </div>
                          ):(
                            <div>
                              {usermessage.message_type === "video"?(
                                <div className="chat">
                                  <div className="bubble slide-right">
                                    <h5 className="message">
                                    <video
                                      style={{ maxWidth: "300px" }}
                                      src={usermessage.attachment_URL}
                                      alt="video"
                                      controls
                                    />
                                    </h5>
                                    <a className="link" href={usermessage.download_URL} style={{float:"right"}}>
                                    <button
                                style={{background:"lightsteelblue", border:"none"}}
                              >
                                <img src="https://cdn.iconscout.com/icon/premium/png-256-thumb/download-button-1136559.png"
                                style={{height:38+"px",width:40+"px", float:"right"}}
                                alt="img"></img>
                              </button>
                                    </a>
                                    <hr />
                                    {(usermessage.size>0?( <h6>{usermessage.size}MB</h6>):(<div></div>))}
                                    <h6 className="chat-message-time">
                                    {messageDate(usermessage.createdAt)}
                                    {","}
                                    {moment(usermessage.createdAt).format(
                                      "hh:mm A"
                                    )}
                                    </h6>
                                  </div>
                                </div>
                              ):(
                                <div>
                                  {usermessage.message_type === "other" ? (
                                    <div className="chat">
                                      <div className="bubble slide-right">
                                        <h5 className="message">
                                          {nl2br(usermessage.message)}
                                        </h5>
                                        <a className="link" href={usermessage.download_URL} style={{float:"right"}}>
                                        <button style={{background:"lightsteelblue", border:"none"}}>
                                          <img src="https://cdn.iconscout.com/icon/premium/png-256-thumb/download-button-1136559.png"
                                          style={{height:38+"px",width:40+"px", float:"right"}}
                                          alt="img"></img>
                                        </button>
                                        </a>
                                        <hr />
                                        {(usermessage.size>0?( <h6>{usermessage.size}MB</h6>):(<div></div>))}
                                        <h6 className="chat-message-time">
                                        {messageDate(usermessage.createdAt)}
                                        {","}
                                        {moment(usermessage.createdAt).format(
                                          "hh:mm A"
                                        )}
                                        </h6>
                                      </div>
                                    </div>
                                ) : (
                                  <div className="chat">
                                    <div className="bubble slide-right">
                                      <h5 className="message">
                                        {nl2br(usermessage.message)}
                                      </h5>
                                      <h6 className="chat-message-time">
                                        {messageDate(usermessage.createdAt)}
                                        {","}
                                        {moment(usermessage.createdAt).format(
                                          "hh:mm A"
                                        )}
                                      </h6>
                                    </div>
                                  </div>
                                )}
                              </div>
                           )}
                        </div>
                      )}
                    </div>
                  ):(
                      <div>
                        {usermessage.message_type === "image" ? (
                          <div className="chat">
                            <div className="bubble slide-left">
                                <h6 className="groupchatroom-sender-name">
                                {usermessage.senderId.name}
                                </h6>
                              <hr />
                              <h5 className="message left-message">
                                <img
                                  style={{ maxWidth: "300px" }}
                                  src={usermessage.attachment_URL}
                                  alt="img"
                                />
                              </h5>
                              <a className="link" href={usermessage.download_URL} style={{float:"right"}}>
                              <button style={{background:"lightsteelblue", border:"none"}}>
                                <img src="https://cdn.iconscout.com/icon/premium/png-256-thumb/download-button-1136559.png"
                                style={{height:38+"px",width:40+"px", float:"right"}}
                                alt="img"></img>
                              </button>
                              </a>
                              <hr />
                              {(usermessage.size>0?( <h6>{usermessage.size}MB</h6>):(<div></div>))}
                              <h6 className="chat-message-time">
                                {messageDate(usermessage.createdAt)}
                                {","}
                                {moment(usermessage.createdAt).format(
                                  "hh:mm A"
                                )}
                              </h6>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {usermessage.message_type === "video" ? (
                              <div className="chat">
                                <div className="bubble slide-left">
                                <h6 className="groupchatroom-sender-name">
                                {usermessage.senderId.name}
                                </h6>
                                <hr/>
                                
                                  <h5 className="message left-message">
                                    <video
                                      style={{ maxWidth: "300px" }}
                                      src={usermessage.attachment_URL}
                                      alt="video"
                                      controls
                                    />
                                  </h5>
                                  <a className="link" href={usermessage.download_URL} style={{float:"right"}}>
                                  <button style={{background:"lightsteelblue", border:"none"}}>
                                    <img src="https://cdn.iconscout.com/icon/premium/png-256-thumb/download-button-1136559.png"
                                    style={{height:38+"px",width:40+"px", float:"right"}}
                                    alt="img"></img>
                                  </button>
                                  </a>
                                  <hr />
                                  {(usermessage.size>0?( <h6>{usermessage.size}MB</h6>):(<div></div>))}
                                  <h6 className="chat-message-time">
                                    {messageDate(usermessage.createdAt)}
                                    {","}
                                    {moment(usermessage.createdAt).format(
                                      "hh:mm A"
                                    )}
                                  </h6>
                                </div>
                              </div>
                            ) : (
                              <div>
                                {usermessage.message_type === "other" ? (
                                  <div className="chat">
                                    <div className="bubble slide-left">
                                    <h6 className="groupchatroom-sender-name">
                                      {usermessage.senderId.name}
                                    </h6>
                                    <hr/>
                                      <h5 className="message left-message">
                                        {nl2br(usermessage.message)}
                                      </h5>
                                      <a className="link" href={usermessage.download_URL} style={{float:"right"}}>
                                      <button style={{background:"lightsteelblue", border:"none"}}>
                                        <img src="https://cdn.iconscout.com/icon/premium/png-256-thumb/download-button-1136559.png"
                                        style={{height:38+"px",width:40+"px", float:"right"}}
                                        alt="img"></img>
                                      </button>
                                      </a>
                                      <hr />
                                      {(usermessage.size>0?( <h6>{usermessage.size}MB</h6>):(<div></div>))}
                                      <h6 className="chat-message-time">
                                        {messageDate(usermessage.createdAt)}
                                        {","}
                                        {moment(usermessage.createdAt).format(
                                          "hh:mm A"
                                        )}
                                      </h6>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="chat">
                                    <div className="bubble slide-left">
                                    <h6 className="groupchatroom-sender-name">
                                      {usermessage.senderId.name}
                                    </h6>
                                    <hr/>
                                      <h5 className="message left-message">
                                        {nl2br(usermessage.message)}
                                      </h5>
                                      <h6 className="chat-message-time">
                                        {messageDate(usermessage.createdAt)}
                                        {","}
                                        {moment(usermessage.createdAt).format(
                                          "hh:mm A"
                                        )}
                                      </h6>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <div className="chatbox-inputs">
              <textarea
                rows={2}
                id="chat"
                type="text"
                className="form-control chatbox-input"
                placeholder="Enter message..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                }}
              />
              <button className="chat-send">
                <label className="upload-button-chat" htmlFor="upload">
                  <img
                    className="upload-button-icon-chat"
                    src={AttachIcon}
                    alt="Attach"
                  />
                </label>
                <input
                  id="upload"
                  type="file"
                  style={{display:"none"}}
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      if (e.target.files[0].type.substring(0, 11)) {
                        if (
                          e.target.files[0].type.substring(0, 5) === "image"
                        ) {
                          setFileType("image");
                        } else if (
                          e.target.files[0].type.substring(0, 5) === "video"
                        ) {
                          setFileType("video");
                        } else {
                          setFileType("other");
                        }
                      }
                      setfile(e.target.files[0]);
                      setMessage(e.target.files[0].name);
                      setfileName(e.target.files[0].name);
                      setSize(e.target.files[0].size)
                    }
                  }}
                />
              </button>
              <button
                className="chat-send"
                onClick={() => {
                  setEmojiPicker(!emojiPicker);
                }}
              >
                <img
                  className="chat-send-icon"
                  src={EmojiButton}
                  alt="add chat"
                />
              </button>
              {!message ? (
                <button className="chat-send" disabled={true}>
                  <img
                    className="chat-send-icon"
                    src={SendButton}
                    alt="add chat"
                  />
                </button>
              ) : (
                <button
                  className="chat-send"
                  onClick={() => {
                    sendMessage();
                    setEmojiPicker(false);
                  }}
                >
                  <img
                    className="chat-send-icon"
                    src={SendButton}
                    alt="add chat"
                  />
                </button>
              )}
            </div>
          </div>
          <div className="emoji-picker">
            {emojiPicker ? <Picker onEmojiClick={onEmojiClick} /> : <div></div>}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ChatRoom;