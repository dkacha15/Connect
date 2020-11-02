import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import * as moment from "moment";
import Picker from "emoji-picker-react";

import Navbar from "../../Shared/Navbar/navbar";
import "./chatRoom.css";
import SendButton from "../../Images/sendMessage.png";
import EmojiButton from "../../Images/emojiIcon.png";
import AttachIcon from "../../Images/attachIcon.png";

const axios = require("axios");

const nl2br = require("react-nl2br");

const ENDPOINT = "http://localhost:5000";

let socket;

const ChatRoom = () => {
  let { user2_id } = useParams();
  const [messages, setMessages] = useState([]);
  const [user2_name, setUser2Name] = useState("");
  const [user2_img, setUser2Img] = useState("");
  const [message, setMessage] = useState("");
  const [chatRooms, setchatRooms] = useState([]);
  const [emojiPicker, setEmojiPicker] = useState(false);
  const [userId, setUserId] = useState("");
  const [file, setfile] = useState("");
  const [fileName, setfileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [size, setSize] = useState(0);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket = io(ENDPOINT);
    scrollToBottom();

    fetch("http://localhost:5000/api/connect/getCurrentUser", {
      method: "Get",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        setUserId(result.user._id);

        fetch(
          `http://localhost:5000/api/connect/getMessage/${result.user._id}/${user2_id}`,
          {
            method: "Get",
            credentials: "include",
          }
        )
          .then((res) => res.json())
          .then((data) => {
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
            if (data) {
              setUser2Name(data.user.name);
              setUser2Img(data.user.image_URL);

              if (data.error) {
              } else {
                setMessages(data.chats.messages);
              }
            }
          });
      });

    socket.on("refreshPersonalChatPage", (data) => {
      getAllChatRoom();
    });

    socket.on("refreshPersonalMessagePage", (data) => {
      getAllMessage();
    });
    //eslint-disable-next-line
  }, [user2_id]);

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({
      block: "end",
      inline: "nearest",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const getAllMessage = () => {
    fetch("http://localhost:5000/api/connect/getCurrentUser", {
      method: "Get",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        fetch(
          `http://localhost:5000/api/connect/getMessage/${result.user._id}/${user2_id}`,
          {
            method: "Get",
            credentials: "include",
          }
        )
          .then((res) => res.json())
          .then((data) => {
            if (data) {
              setUser2Name(data.user.name);
              setUser2Img(data.user.image_URL);
              if (!data.error) {
                setMessages(data.chats.messages);
              }
            }
          });
      });
  };

  async function sendMessage() {
    if (file) {
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
              `http://localhost:5000/api/connect/sendMessage/${userId}/${user2_id}`,
              {
                method: "Post",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
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
                socket.emit("refreshPersonalMessages", {});
                setTimeout(() => {
                  socket.emit("refreshPersonalChatRoom", {});
                  socket.emit("refreshNotifications", {});
                }, 100);
                setMessage("");
              });
          });
      } else if (fileType === "video") {
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
              `http://localhost:5000/api/connect/sendMessage/${userId}/${user2_id}`,
              {
                method: "Post",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
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
                socket.emit("refreshPersonalMessages", {});
                setTimeout(() => {
                  socket.emit("refreshPersonalChatRoom", {});
                  socket.emit("refreshNotifications", {});
                }, 100);
                setMessage("");
              });
          });
      } else {
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
              `http://localhost:5000/api/connect/sendMessage/${userId}/${user2_id}`,
              {
                method: "Post",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
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
                socket.emit("refreshPersonalMessages", {});
                setTimeout(() => {
                  socket.emit("refreshPersonalChatRoom", {});
                  socket.emit("refreshNotifications", {});
                }, 100);
                setMessage("");
              });
          });
      }
    } else {
      fetch(
        `http://localhost:5000/api/connect/sendMessage/${userId}/${user2_id}`,
        {
          method: "Post",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            message,
            message_type: "Text",
            attachment_URL: "",
            download_URL:"",
            size:0,
          }),
        }
      )
        .then((res) => res.json())
        .then((data) => {
          socket.emit("refreshPersonalMessages", {});
          setTimeout(() => {
            socket.emit("refreshPersonalChatRoom", {});
            socket.emit("refreshNotifications", {});
          }, 100);
          setMessage("");
        });
    }
  }

  const messageDate = (date) => {
    return moment(date).calendar(null, {
      sameDay: "[Today]",
      lastDay: "[Yesterday]",
      lastWeek: "DD/MM/YYYY",
      sameElse: "DD/MM/YYYY",
    });
  };

  const onEmojiClick = (event, emojiObject) => {
    setMessage(message + emojiObject.emoji);
  };

  return (
    <React.Fragment>
      <Navbar />
      <h1 className="chat-heading">CHATS</h1>
      <div className="chatRoom">
        <div className="container chats-container">
          <div className="card chats-card">
            <h5 className="chats-heading">Chats</h5>
            {chatRooms.map((chatRoom) => {
              return (
                <a
                  href={`/chatRoom/${chatRoom.user2_id._id}`}
                  className="link"
                  key={chatRoom._id}
                >
                  <div className="chats-list">
                    <img
                      className="chats-list-user-picture"
                      src={chatRoom.user2_id.image_URL}
                      alt="..."
                    />
                    <div>
                      <h5 className="chats-list-username">
                        {chatRoom.user2_id.name}
                      </h5>
                      {chatRoom.lastMessage_sender === userId ? (
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
              <img className="chatbox-user-picture" src={user2_img} alt="..." />
              <div>
                <h5 className="chatbox-username">{user2_name}</h5>
              </div>
            </div>
            <div className="chatbox-body" id="chatbox-messages">
              {messages.map((usermessage) => {
                return (
                  <div key={usermessage._id}>
                    {usermessage.senderId === userId ? (
                      <div>
                        {usermessage.message_type === "image" ? (
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
                        ) : (
                          <div>
                            {usermessage.message_type === "video" ? (
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
                            ) : (
                              <div>
                                {usermessage.message_type === "other" ? (
                                  <div className="chat">
                                    <div className="bubble slide-right">
                                      <h5 className="message">
                                        {nl2br(usermessage.message)}
                                      </h5>
                                      <a className="link" href={usermessage.download_URL}  style={{float:"right"}}>
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
                    ) : (
                      <div>
                        {usermessage.message_type === "image" ? (
                          <div className="chat">
                            <div className="bubble slide-left">
                              <h5 className="message">
                                <img
                                  style={{ maxWidth: "300px" }}
                                  src={usermessage.attachment_URL}
                                  alt="img"
                                />
                              </h5>
                              <a className="link" href={usermessage.download_URL}  style={{float:"right"}}>
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
                        ) : (
                          <div>
                            {usermessage.message_type === "video" ? (
                              <div className="chat">
                                <div className="bubble slide-left">
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
                            ) : (
                              <div>
                                {usermessage.message_type === "other" ? (
                                  <div className="chat">
                                    <div className="bubble slide-left">
                                      <h5 className="message">
                                        {nl2br(usermessage.message)}
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
                                ) : (
                                  <div className="chat">
                                    <div className="bubble slide-left">
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
                    )}
                  </div>
                );
              })}
              <div className="endOfMessages" ref={messagesEndRef} />
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
                <button className="chat-send" disabled>
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