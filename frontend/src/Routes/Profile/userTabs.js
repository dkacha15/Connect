import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import Modal from "react-awesome-modal";
import { useParams } from "react-router-dom";
import * as moment from "moment";
import PostIcon from "../../Images/postIcon.png";
import LikedIcon from "../../Images/likedIcon.png";
import NonLikedIcon from "../../Images/nonLikedIcon.png";
import CommentIcon from "../../Images/comment.png";
import CommentedIcon from "../../Images/commented.png";
import CertificateIcon from "../../Images/certificate.png";

import "./userTabs.css";

const ENDPOINT = "http://localhost:5000";

let socket = io(ENDPOINT);

const nl2br = require("react-nl2br");

const UserTabs = () => {
  const [post, setPost] = useState(false);
  const [modal, setModal] = useState();
  const [type, setType] = useState();
  const [likes, setlikes] = useState([]);
  const [commentModal, setCommentModal] = useState(false);
  const [userposts, setUserPosts] = useState([]);
  const [userevents, setUserEvents] = useState([]);
  const [userskills, setUserSkills] = useState([]);
  const [event, setEvent] = useState(false);
  const [skillModal, setSkillModal] = useState(false);
  const [skillRatingArray, setSkillRatingArray] = useState([]);
  const [skill_id, setSkill_id] = useState("");
  const [skillRating, setskillRating] = useState();
  const [skill_Name, setSkill_name] = useState();
  const [commentText, setCommentText] = useState("");
  const [commentArray, setCommentArray] = useState([]);
  const [postId, setPostId] = useState("");
  const [userId, setUserId] = useState("");
  const [certificateModal,setCertificateModal]=useState(false);
  const [certificateURL,setCertificateURL]=useState("");

  const userid = useParams();

  useEffect(() => {
    fetch("http://localhost:5000/api/connect/getCurrentUser", {
      method: "Get",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        setUserId(result.user._id);
      });

    fetch(`http://localhost:5000/api/connect/posts/${userid.userid}`, {
      method: "Get",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setUserPosts(data.posts);
        setType(data.type);
        setPost(true);
        setEvent(false);
        // setSkill(false);
      });
  }, [userid.userid]);

  const UserPosts = () => {
    setPost(true);
    setEvent(false);
    // setSkill(false);
    fetch(`http://localhost:5000/api/connect/posts/${userid.userid}`, {
      method: "Get",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setUserPosts(data.posts);
        setType(data.type);
      });
  };
  const UserEvents = () => {
    setPost(false);
    setEvent(true);
    // setSkill(false);
    fetch(`http://localhost:5000/api/connect/events/${userid.userid}`, {
      method: "Get",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setUserEvents(data.events);
        setType(data.type);
        // console.log(data.events);
      });
  };
  const UserSkills = () => {
    setPost(false);
    setEvent(false);
    // setSkill(true);
    fetch(`http://localhost:5000/api/connect/skills/${userid.userid}`, {
      method: "Get",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        // console.log(result.user);
        if (result.user.skills) {
          setUserSkills(result.user.skills);
        }
      });
  };

  const rating = (id, name) => {
    fetch(`http://localhost:5000/api/connect/skillRating/${userid.userid}`, {
      method: "Post",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        skill_id: id,
        rating: skillRating,
        skill_name: name,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        setSkillModal(false);
        setskillRating("");
        socket.emit("refreshNotifications", {});
        socket.emit("refreshProfile", {});
      });
  };

  const likePost = (id) => {
    fetch("http://localhost:5000/api/connect/likePost", {
      method: "Put",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        postId: id,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        socket.emit("refreshProfile", {});
      });
  };

  const disLike = (id) => {
    fetch("http://localhost:5000/api/connect/disLikePost", {
      method: "Put",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        postId: id,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        socket.emit("refreshProfile", {});
      });
  };

  const sendComment = (id) => {
    fetch("http://localhost:5000/api/connect/comment", {
      method: "Put",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        postId: id,
        comment_text: commentText,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setCommentText("");
        socket.emit("refreshProfile", {});
      });
  };

  socket.on("refreshProfilePage", (data) => {
    setCommentModal(false);
    UserPosts();
  });

  return (
    <React.Fragment>
      <div className="row justify-content-center">
        <button className="btn btn-primary" onClick={() => UserPosts()}>
          Posts
        </button>
        &nbsp; &nbsp;
        <button className="btn btn-primary" onClick={() => UserSkills()}>
          Skills
        </button>
        &nbsp; &nbsp;
        {type === "graduate" ? (
          <button className="btn btn-primary" onClick={() => UserEvents()}>
            Events
          </button>
        ) : (
          <div></div>
        )}
        &nbsp; &nbsp;
        <br />
      </div>
      <div
        className="row justify-content-center tabs"
        style={{ background: "steelblue" }}
      >
        {post ? (
          userposts.length === 0 ? (
            <div>
              <h1>No Posts Yet</h1>
            </div>
          ) : (
            userposts.map((item) => {
              return (
                <div className="col-lg-4" key={item._id}>
                  <div
                    className="card event-card"
                    style={{ border: 3 + "px solid pink" }}
                  >
                    {(item.attachment_type==="image")?(
                 <img
                 className="card-img-top"
                 src={item.image_URL}
                 alt="Event Poster"
                 style={{ height: 180 + "px" }}
               />
              ):(
                (item.attachment_type==="video")?(
                  <video
                  src={item.image_URL}
                  className="card-img-top post-image"
                  alt="video"
                  style={{ height: 180 + "px",width: 310+"px" }}
                  controls
                  />
                ):(
                  <div style={{background:"steelblue",width:300+"px", height:180+"px",padding:5+"px", marginLeft:10+"px", border:2+"px solid black", borderRadius:2+"%"}}>
                   <br/>
                   <br/>
                    <h5 className="message">
                      {item.file}
                    </h5>
                    <p>{item.size}MB
                    <br/>
                    <br/>
                    <a className="link" href={item.download_URL} style={{float:"right"}}>
                        <button
                          style={{background:"steelblue", border:"none"}}
                        >
                          <img src="https://cdn.iconscout.com/icon/premium/png-256-thumb/download-button-1136559.png"
                          style={{height:38+"px",width:40+"px", float:"right"}}
                          alt="img"></img>
                        </button>
                    </a>
                    </p>
                  </div>
                )  
              ) }      
                    <div className="card-body">
                      <h5 className="card-title">{item.caption}</h5>
                      <hr/>
                      <div className="like-comments-icon">
                      &nbsp; 
                        <div>
                          {item.likes.some(
                            (like) => like.user_id._id === userId
                          ) ? (
                            <button
                              className="post-like-button"
                              type="submit"
                              onClick={() => {
                                disLike(item._id);
                              }}
                            >
                              <img
                                className="post-like-button-icon"
                                src={LikedIcon}
                                alt="Post"
                              />
                            </button>
                          ) : (
                            <button
                              className="post-like-button"
                              type="submit"
                              onClick={() => {
                                likePost(item._id);
                              }}
                            >
                              <img
                                className="post-like-button-icon"
                                src={NonLikedIcon}
                                alt="Post"
                              />
                            </button>
                          )}
                        </div>
                        &nbsp; &nbsp;
                        <div>
                          {item.comments.some(
                            (comment) => comment.user_id._id === userId
                          ) ? (
                            <button
                              className="post-comment-button"
                              type="submit"
                              onClick={() => {
                                setCommentModal(true);
                                setPostId(item._id);
                                setCommentArray(item.comments);
                              }}
                            >
                              <img
                                className="post-like-button-icon"
                                src={CommentedIcon}
                                alt="Post"
                              />
                            </button>
                          ) : (
                            <button
                              className="post-comment-button"
                              type="submit"
                              onClick={() => {
                                setCommentModal(true);
                                setPostId(item._id);
                                setCommentArray(item.comments);
                              }}
                            >
                              <img
                                className="post-like-button-icon"
                                src={CommentIcon}
                                alt="Post"
                              />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="like-comment-count">
                        <h5
                          className="like-counts"
                          onClick={() => {
                            setModal(true);
                            setlikes(item.likes);
                          }}
                        >
                          {item.likes.length} likes
                        </h5>
                          
                        <h5
                          className="comments-counts"
                          onClick={() => {
                            setCommentModal(true);
                            setCommentArray(
                              item.comments.sort((a, b) =>
                                b.createdAt > a.createdAt ? 1 : -1
                              )
                            );
                            setPostId(item._id);
                          }}
                        >
                          {item.comments.length} comments
                        </h5>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )
        ) : event ? (
          userevents.length === 0 ? (
            <div>
              <h1>No Events Yet</h1>
            </div>
          ) : (
            userevents.map((item) => {
              return (
                <div className="col-lg-4">
                  <div
                    className="card event-card"
                    style={{ border: 3 + "px solid pink" }}
                  >
                    <img
                      className="card-img-top"
                      src={item.poster_url}
                      alt="Event Poster"
                      style={{ height: 180 + "px" }}
                    />
                    <div className="card-body">
                      <h5 className="card-title" style={{fontSize:18+"px"}}>{item.name}</h5>
                      <p className="card-text" style={{fontSize:18+"px"}}>
                        {nl2br(item.description)}
                        <br />
                        <span style={{fontSize:18+"px"}}>Event Date:</span>{" "}
                        {moment(item.date).format("DD/MM/YYYY")}
                        <br />
                        <span style={{fontSize:18+"px"}}>Event Time:</span>{" "}
                        {item.time}
                        <br />
                        <span style={{fontSize:18+"px"}}>Event Venue:</span> {item.venue}
                        <br />
                        <span style={{fontSize:18+"px"}}>Posted By </span>
                        {item.author._id === userId ? "You" : item.author.name}
                        <span style={{fontSize:18+"px"}}> At </span>{" "}
                        {moment(item.createAt).format("DD/MM/YYYY")}
                      </p>
                      
                    </div>
                  </div>
                </div>
              );
            })
          )
        ) : userskills.length === 0 ? (
          <div>
            <h1>No Skills Added Yet</h1>
          </div>
        ) : (
          userskills.map((item) => {
            return (
              <div
                key={item._id}
                class="col-lg-3"
                style={{
                  background: "#66CCFF",
                  padding: 10 + "px",
                  margin: 10 + "px",
                  border: 3 + "px solid pink",
                }}
              >
                <h3>{item.sname}</h3>
                <div className="progress">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: item.strength * 10 + "%" }}
                    aria-valuenow={item.strength * 10}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {item.strength * 10}%
                  </div>
                </div>
                <button
                  className="certificate-button"
                  onClick={()=>{
                    setCertificateModal(true);
                    setCertificateURL(item.certificate);
                  }}
                >
                <img className="certificate-icon" src={CertificateIcon} alt="Certificate" />
              </button>
                <h5
                  className="skill"
                  onClick={() => {
                    setSkill_id(item._id);
                    setSkill_name(item.sname);
                    setSkillModal(true);
                    setSkillRatingArray(item.ratings);
                  }}
                >
                  {item.ratings.length} Ratings
                </h5>
              </div>
            );
          })
        )}
        <Modal
          visible={modal}
          width="350"
          effect="fadeInUp"
          onClickAway={() => setModal(false)}
        >
          <div className="likes">
            <h4 className="like-heading">Likes</h4>
            {likes.map((like) => {
              return (
                <div className="card like-card" key={like._id}>
                  <img
                    className="like-user-picture"
                    src={like.user_id.image_URL}
                    alt="..."
                  />
                  <div>
                    {like.user_id._id === userId ? (
                      <h5 className="card-title like-name">You</h5>
                    ) : (
                      <h5 className="card-title like-name">
                        {like.user_id.name}
                      </h5>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Modal>
        <Modal
          visible={commentModal}
          width="500"
          effect="fadeInUp"
          onClickAway={() => setCommentModal(false)}
        >
          <div className="comments">
            <h4 className="comments-heading">Comments</h4>
            <div className="comment-form">
              <textarea
                className="form-control comment-textarea"
                id="exampleFormControlTextarea1"
                placeholder="Type Comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows="1"
              />
              <button
                className="comment-submit-button"
                type="submit"
                onClick={() => sendComment(postId)}
              >
                <img
                  className="comment-submit-button-icon"
                  src={PostIcon}
                  alt="Post"
                />
              </button>
            </div>
            {commentArray.map((comment) => {
              return (
                <div className="card comments-card" key={comment._id}>
                  <img
                    className="comments-user-picture"
                    src={comment.user_id.image_URL}
                    alt="..."
                  />
                  <div>
                    {comment.user_id._id === localStorage.getItem("id") ? (
                      <h5 className="card-title comments-name">You</h5>
                    ) : (
                      <h5 className="card-title comments-name">
                        {comment.user_id.name}
                      </h5>
                    )}
                    <h5 className="comment-time">
                      {moment(comment.createdAt).fromNow()}
                    </h5>
                    <hr />
                    <h5 className="comments-text">{comment.comment_text}</h5>
                  </div>
                </div>
              );
            })}
          </div>
        </Modal>
        <Modal
          visible={skillModal}
          width="350"
          effect="fadeInUp"
          onClickAway={() => setSkillModal(false)}
        >
          <div className="skill-ratings">
            <h4 className="skill-rating-heading">Ratings</h4>
            <div className="skill-rating-form">
              <input
                className="form-control skill-rating-text"
                placeholder="Rate between 1 to 10"
                type="text"
                defaultValue=""
                min="1"
                max="10"
                step="1"
                value={skillRating}
                onChange={(e) => setskillRating(e.target.value)}
              />
              <button
                className="skill-rating-submit-button"
                type="submit"
                onClick={() => rating(skill_id, skill_Name)}
              >
                <img
                  className="comment-rating-button-icon"
                  src={PostIcon}
                  alt="Post"
                />
              </button>
            </div>
            {skillRatingArray.map((skill) => {
              return (
                <div className="card skill-rating-card" key={skill._id}>
                  <img
                    className="skill-rating-user-picture"
                    src={skill.user_id.image_URL}
                    alt="..."
                  />
                  <div>
                    {skill.user_id._id === userId ? (
                      <h5 className="card-title skill-rating-name">You</h5>
                    ) : (
                      <h5 className="card-title skill-rating-name">
                        {skill.user_id.name}
                      </h5>
                    )}
                    <hr />
                    <div class="progress skill-rating-progress-bar">
                      <div
                        class="progress-bar"
                        role="progressbar"
                        style={{ width: skill.rate * 10 + "%" }}
                        aria-valuenow="90"
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >
                        {skill.rate * 10}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Modal>
        <Modal
          visible={certificateModal}
          width="530"
          effect="fadeInUp"
          onClickAway={() => setCertificateModal(false)}
        >
          <div className="skill-ratings">
          {certificateURL===""?(
              <h4 className="skill-rating-heading">No Certificate</h4>
            ):(
              <h4 className="skill-rating-heading">Certificate</h4>
            )}
            {certificateURL===""?(
              <div></div>
            ):(
              <img className="certificate-image" src={certificateURL} alt="certificate"/>
            )}
          </div>
        </Modal>
      </div>
    </React.Fragment>
  );
};

export default UserTabs;
