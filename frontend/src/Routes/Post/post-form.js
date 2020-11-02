import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import Bus from '../../Shared/Utils/bus';
import Loader from "../../Shared/loader";
import AttachIcon from "../../Images/attachIcon.png";
import PostIcon from "../../Images/postIcon.png";
import "./post-form.css";
import Flash from "../../Shared/Flash/index";
const ENDPOINT = "http://localhost:5000";
const axios = require("axios");

let socket = io(ENDPOINT);

const PostForm = () => {
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState();
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [userImage, setUserImage] = useState("");
  const [file, setfile] = useState("");
  const [fileType, setFileType] = useState("");
  const [size, setSize] = useState("");
  useEffect(() => {
    fetch("http://localhost:5000/api/connect/getCurrentUser", {
      method: "Get",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        setUserImage(result.user.image_URL);
      });
  }, []);
  window.flash = (message, type="success") => Bus.emit('flash', ({message, type}));
  async function createPost() {
    // setLoading(true);
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
          
            fetch("http://localhost:5000/api/connect/createPost", {
              method: "Post",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                caption,
                image_URL: data.data.url,
                attachment_type: "image",
                file:fileName,
                download_URL:"",
                size:size
              }),
            })
          .then((res) => res.json())
          .then((data) => {
            if (data.error) {
              setError(data.error);
              setLoading(false);
            } else {
              setLoading(false);
              setMessage(data.message);
              setFileName("No file selected.");
              setfile("");
              setCaption("");
              socket.emit("refreshPost", {});
            }
          })
          .catch((err) => {
            console.log(err);
          });
        })
      } 
      else if (fileType === "video") {
        if(size>102400000){
          setError("Video Size should be less than 100MB");
          setfile("");
          setFileName("No file selected.");
          setCaption("");
        }
        else{
          axios
          .post(
            "https://api.cloudinary.com/v1_1/dy6relv7v/video/upload",
            data,
            options
          )
          .then((data) => {
            fetch("http://localhost:5000/api/connect/createPost", {
                method: "Post",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                  caption,
                  image_URL: data.data.url,
                  attachment_type: "video",
                  file:fileName,
                  download_URL:"",
                  size:size
                }),
            })
            .then((res) => res.json())
            .then((data) => {
              if (data.error) {
                setError(data.error);
                setLoading(false);
              } else {
                setLoading(false);
                setMessage(data.message);
                setFileName("No file selected.");
                setfile("");
                setCaption("");
                socket.emit("refreshPost", {});
              }
            })
            .catch((err) => {
              console.log(err);
            });
          });
        }
        
      } else {  
          axios
          .post(
            "https://api.cloudinary.com/v1_1/dy6relv7v/raw/upload",
            data,
            options
          )
          .then((data) => {
            console.log(fileName);
            var url=data.data.url;
            var link=url.split("/");
            link.insert(6,"fl_attachment");
            var download_link=link[0]+"//"+link[2]+"/"+link[3]+"/"+link[4]+"/"+link[5]+"/"+link[6]+"/"+link[7]+"/"+link[8];
            fetch("http://localhost:5000/api/connect/createPost", {
                method: "Post",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                  caption,
                  image_URL: data.data.url,
                  file:fileName,
                  attachment_type: "other",
                  download_URL:download_link,
                  size:size
                }),
            })
            .then((res) => res.json())
            .then((data) => {
              if (data.error) {
                setError(data.error);
                setLoading(false);
              } else {
                setLoading(false);
                setMessage(data.message);
                setFileName("No file selected.");
                setfile("");
                setCaption("");
                socket.emit("refreshPost", {});
              }
            })
            .catch((err) => {
              console.log(err);
            });
          });
        }
    }
  }

  const Name = () => {
    if (fileName) {
      return <h6 className="fileName">{fileName}</h6>;
    } else {
      return <h6 className="fileName">No file selected.</h6>;
    }
  };

  const Loading = () => {
    if (loading) {
      return <Loader />;
    } else {
      return null;
    }
  };

  
  const Message = () => {
    if (message) {
      window.flash(message, 'success');
      setMessage("");
      return null;
    } else if (error){
      window.flash(error, 'error');
      setError("");
      return null;
    }
      else {
      return null;
    }
  };

  return (
    <React.Fragment>
      <Loading />
      <Flash/>
      <Message />
      <br/>
      <br/>
      <div className="container post-form-container">
     
        <div className="card post-form-card">
          <div className="card-title post-form-body">
            <img className="post-from-user-picture" src={userImage} alt="..." />
            <div>
              <textarea
                className="form-control post-form-textarea"
                id="exampleFormControlTextarea1"
                placeholder="Type Something..."
                rows="2"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
              <div className="post-buttons">
                <label className="upload-button" htmlFor="upload">
                  <img
                    className="upload-button-icon"
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
                      setFileName(e.target.files[0].name);
                      setSize(e.target.files[0].size);
                      console.log(e.target.files[0]);
                    }
                  }}
                />
                <Name />
                <button
                  className="post-submit-button"
                  type="submit"
                  onClick={() => createPost()}
                >
                  <img
                    className="post-submit-button-icon"
                    src={PostIcon}
                    alt="Post"
                  />
                </button>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default PostForm;
