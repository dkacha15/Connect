import React, { useState, useEffect } from "react";
import Modal from "react-awesome-modal";
import io from "socket.io-client";
import * as moment from "moment";
import PostIcon from "../../Images/postIcon.png";
import LikedIcon from "../../Images/likedIcon.png";
import NonLikedIcon from "../../Images/nonLikedIcon.png";
import CommentIcon from "../../Images/comment.png";
import CommentedIcon from "../../Images/commented.png";

const ENDPOINT = "http://localhost:5000";

let socket;
const nl2br = require("react-nl2br");

const Tabs = () => {
  const [post, setPost] = useState(true);
  const [modal, setModal] = useState();
  const [likes, setlikes] = useState([]);
  const [myposts, setPosts] = useState([]);
  const [myevents, setEvents] = useState([]);
  const [myskills, setSkills] = useState([]);
  const [event, setEvent] = useState(false);
  const [skillModal, setSkillModal] = useState(false);
  const [skillRatingArray, setSkillRatingArray] = useState([]);
  const [userType, setUserType] = useState("");
  const [userId, setUserId] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentArray, setCommentArray] = useState([]);
  const [commentModal, setCommentModal] = useState(false);
  const [postId, setPostId] = useState("");

  useEffect(() => {
    socket = io(ENDPOINT);

    setPost(true);
    setEvent(false);

    fetch("http://localhost:5000/api/connect/getCurrentUser", {
      method: "Get",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        setUserType(result.user.type);
        setUserId(result.user._id);

        fetch("http://localhost:5000/api/connect/myPosts", {
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
          .then((data) => {
            setPosts(data.posts);
            // console.log(data.posts);
          });
      });

    socket.on("refreshProfilePage", (data) => {
      setCommentModal(false);
      Posts();
    });
  }, []);

  const Posts = () => {
    setPost(true);
    setEvent(false);
    // setSkill(false);

    fetch("http://localhost:5000/api/connect/getCurrentUser", {
      method: "Get",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        fetch("http://localhost:5000/api/connect/myPosts", {
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
          .then((data) => {
            setPosts(data.posts);
            // console.log(data.posts);
            //setPost(false);
          });
      });
  };
  const Events = () => {
    setPost(false);
    setEvent(true);
    // setSkill(false);
    fetch("http://localhost:5000/api/connect/myEvents", {
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
      .then((data) => {
        setEvents(data.events);
        // console.log(data.events);
      });
  };
  const Skills = () => {
    setPost(false);
    setEvent(false);
    // setSkill(true);

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
            // console.log(result.user[0].skills);
            if (result.user[0].skills) {
              setSkills(result.user[0].skills);
            }
          });
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
        socket.emit("refreshNotifications", {});
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
        socket.emit("refreshNotifications", {});
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
        socket.emit("refreshNotifications", {});
      });
  };

  return (
    <React.Fragment>
      <div className="row justify-content-center">
        <button className="btn btn-primary" onClick={() => Posts()}>
          Posts
        </button>
        &nbsp; &nbsp;
        <button className="btn btn-primary" onClick={() => Skills()}>
          Skills
        </button>
        &nbsp; &nbsp;
        {userType === "graduate" ? (
          <button className="btn btn-primary" onClick={() => Events()}>
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
          myposts.length === 0 ? (
            <div>
              <h1>No Posts Yet</h1>
            </div>
          ) : (
            myposts.map((item) => {
              return (
                <div className="col-lg-4" key={item._id}>
                  <div
                    className="card event-card"
                    style={{ border: 3 + "px solid pink" }}
                  >
                    <img
                      className="card-img-top"
                      src={item.image_URL}
                      alt="Event Poster"
                      style={{ height: 180 + "px" }}
                    />
                    <div className="card-body">
                      <h5 className="card-title">{item.caption}</h5>
                      <hr/>
                      <div className="like-comments-icon">
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
          myevents.length === 0 ? (
            <div>
              <h1>No Events Yet</h1>
            </div>
          ) : (
            myevents.map((item) => {
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
                      style={{ height: 150 + "px" }}
                    />
                    <div className="card-body">
                      <h5 className="card-title" style={{fontSize:17+"px"}}><span>{item.name.toUpperCase()}</span></h5>
                      <p className="card-text" style={{fontSize:13+"px"}}>
                        {nl2br(item.description)}
                        <br />
                        <span style={{fontSize:14+"px"}}>Event Date:</span>{" "}
                        {moment(item.date).format("DD/MM/YYYY")}
                        <br />
                        <span style={{fontSize:14+"px"}}>Event Venue:</span> {item.venue}
                        <br />
                        <span style={{fontSize:14+"px"}}>Posted By </span>
                        {item.author._id === userId ? "You" : item.author.name}
                        <span style={{fontSize:14+"px"}}> At </span>{" "}
                        {moment(item.createAt).format("DD/MM/YYYY")}
                      </p>
                      <a
                        href={item.registration_link}
                        className="btn btn-primary"
                      >
                        Register Here
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          )
        ) : myskills.length === 0 ? (
          <div>
            <h1>No Skills Added Yet</h1>
          </div>
        ) : (
          myskills.map((item) => {
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
                <div class="progress">
                  <div
                    class="progress-bar"
                    role="progressbar"
                    style={{ width: item.strength * 10 + "%" }}
                    aria-valuenow={item.strength * 10}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {item.strength * 10}%
                  </div>
                </div>
                <h5
                  className="skill"
                  onClick={() => {
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
                    {comment.user_id._id === userId ? (
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
            {skillRatingArray.map((skill) => {
              return (
                <div className="card skill-rating-card" key={skill._id}>
                  <img
                    className="skill-rating-user-picture"
                    src={skill.user_id.image_URL}
                    alt="..."
                  />
                  <div>
                    <h5 className="card-title skill-rating-name">
                      {skill.user_id.name}
                    </h5>
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
      </div>
    </React.Fragment>
  );
};

export default Tabs;
