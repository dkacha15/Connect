import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import Modal from "react-awesome-modal";
import * as moment from "moment";
import { Link } from "react-router-dom";

import LikedIcon from "../../Images/likedIcon.png";
import NonLikedIcon from "../../Images/nonLikedIcon.png";
import CommentIcon from "../../Images/comment.png";
import PostIcon from "../../Images/postIcon.png";
import CommentedIcon from "../../Images/commented.png";
import "./post.css";
const nl2br = require("react-nl2br");

const ENDPOINT = "http://localhost:5000";

let socket;

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [likesModal, setLikesModal] = useState();
  const [likes, setlikes] = useState([]);
  const [commentsModal, setCommentsModal] = useState();
  const [commentText, setCommentText] = useState("");
  const [commentArray, setCommentArray] = useState([]);
  const [postId, setPostId] = useState("");
  const [userID, setUserId] = useState("");

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

    fetch("http://localhost:5000/api/connect/allPosts", {
      method: "Get",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts);
      });

    socket.on("refreshPostPage", (data) => {
      getAllPosts();
      setCommentsModal(false);
    });
  }, []);

  const getAllPosts = () => {
    fetch("http://localhost:5000/api/connect/allPosts", {
      method: "Get",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.posts);
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
        socket.emit("refreshPost", {});
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
        socket.emit("refreshPost", {});
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
        socket.emit("refreshPost", {});
        socket.emit("refreshNotifications", {});
      });
  };

  return (
    <React.Fragment>
      {posts.map((item) => {
        return (
          <div key={item._id} className="container post-container">
            <div className="card post-card">
              <div className="card-title post-header">
                <img
                  className="post-user-picture"
                  src={item.user.image_URL}
                  alt="..."
                />
                <div>
                  <h5 className="card-title post-user-name">
                    {item.user._id === userID ? (
                      <Link className="link" to="/profile">
                        {item.user.name}
                      </Link>
                    ) : (
                      <Link className="link" to={"/profile/" + item.user._id}>
                        {item.user.name}
                      </Link>
                    )}
                  </h5>
                  <h5 className="post-user-job">
                    {item.user.type.toUpperCase()}
                  </h5>
                </div>
              </div>
              <hr />
              {(item.attachment_type==="image")?(
                  <img
                  src={item.image_URL}
                  className="card-img-top post-image"
                  alt="..."
                />
              ):(
                (item.attachment_type==="video")?(
                  <video
                  src={item.image_URL}
                  className="card-img-top post-image"
                  alt="video"
                  controls
                  />
                ):(
                  <div style={{background:"steelblue",width:400+"px", height:105+"px",padding:5+"px", marginLeft:10+"px", border:2+"px solid black", borderRadius:2+"%"}}>
                    <h5 className="message">
                      {item.file}
                    </h5>
                    <p>{item.size}MB
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
              <hr />
              <div className="post-body">
                <h5 className="card-text post-text">{nl2br(item.caption)}</h5>
              </div>
              <hr />
              <div>
                <h5 className="post-time">
                  {moment(item.createdAt).fromNow()}
                </h5>
              </div>
              <div className="like-comments-icon">
                <div>
                  {item.likes.some((like) => like.user_id._id === userID) ? (
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
                &nbsp; &nbsp; &nbsp;
                <div>
                  {item.comments.some(
                    (comment) => comment.user_id._id === userID
                  ) ? (
                    <button
                      className="post-comment-button"
                      type="submit"
                      onClick={() => {
                        setCommentsModal(true);
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
                        setCommentsModal(true);
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
                    setLikesModal(true);
                    setlikes(item.likes);
                  }}
                >
                  {item.likes.length} likes
                </h5>
               
                <h5
                  className="comments-counts"
                  onClick={() => {
                    setCommentsModal(true);
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
        );
      })}
      <Modal
        visible={likesModal}
        width="350"
        effect="fadeInUp"
        onClickAway={() => setLikesModal(false)}
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
                  {like.user_id._id === userID ? (
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
        visible={commentsModal}
        width="500"
        effect="fadeInUp"
        onClickAway={() => setCommentsModal(false)}
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
                  {comment.user_id._id === userID ? (
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
    </React.Fragment>
  );
};

export default Posts;
