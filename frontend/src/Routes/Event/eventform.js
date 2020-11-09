import React, { useState , useEffect } from "react";
import { useHistory } from "react-router-dom";
import DatePicker from "react-datepicker";
import io from "socket.io-client";
import Modal from "react-awesome-modal";
import Loader from "../../Shared/loader";
import Navbar from "../../Shared/Navbar/navbar";

import "react-datepicker/dist/react-datepicker.css";

import "./eventform.css";

const ENDPOINT = "http://localhost:5000";

let socket = io(ENDPOINT);

const EventForm = () => {
  const history = useHistory();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [edate, setDate] = useState(new Date());
  const [poster, setPoster] = useState("");
  const [venue, setVenue] = useState("");
  const [time, setTime] = useState("");
  const [registration_link, setLink] = useState("");
  const [loading, setLoading] = useState();
  const [message, setMessage] = useState("");
  const [modal, setModal] = useState(false);
  const [userid, setUserId] = useState();
  const [userDetails, setUserDetails] = useState([]);
  const [members, setMembers] = useState([]);
  const [skill, setSkill] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  //eslint-disable-next-line
  const [viewSkill, setViewSkill] = useState([]);
  //eslint-disable-next-line
  const [tcheck,setTcheck]=useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/connect/getCurrentUser", {
     method: "Get",
     credentials: "include",
   })
     .then((res) => res.json())
     .then((result) => {
       setUserId(result.user._id);
     })
   } ,[]); 
  
  
  const AddEvent = () => {
    setLoading(true);
    const data = new FormData();
    data.append("file", poster);
    data.append("upload_preset", "sdp-connect");
    data.append("cloud_name", "imkhy");
    fetch("https://api.cloudinary.com/v1_1/imkhy/image/upload", {
      method: "post",
      body: data,
    })
      .then((res) => res.json())
      .then((result) => {
        fetch("http://localhost:5000/api/connect/addevent", {
          method: "Post",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            userid,
            name,
            description,
            edate,
            time,
            poster_url: result.url,
            venue,
            registration_link,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            setTimeout(() => {
              if (data.error) {
                console.log(data.error);
                setLoading(false);
                setMessage(data.error);
              } else {
                console.log(data);
                setLoading(false);
                socket.emit("refresh", {});
                socket.emit("refreshNotifications", {});
                history.push("/event");
              }
            }, 1000);
          });
      })
      .catch((err) => {
        console.log(err);
      });
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
      return (
        <p className="errorMessage" style={{ textAlign: "center" }}>
          {message}
        </p>
      );
    } else {
      return null;
    }
  };

  const fetchUser = (query) => {
    setMembers([]);
    // setSearch(query);
    if (query !== "") {
      fetch("http://localhost:5000/api/connect/searchUserAsPerSkill", {
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
          console.log(result.user);
          while(result.l>0)
          {
            tcheck.push(true);
            result.l-=1;
            
          }
          setSkill("");
        });
    } else {
      setUserDetails([]);
    }
  };

  const AddCustomEvent = () => {
    setModal(false);
    setLoading(true);
    if (members.indexOf(userid) <= -1) {
      members.push(userid);
    }
    const data = new FormData();
    data.append("file", poster);
    data.append("upload_preset", "sdp-connect");
    data.append("cloud_name", "imkhy");
    fetch("https://api.cloudinary.com/v1_1/imkhy/image/upload", {
      method: "post",
      body: data,
    })
      .then((res) => res.json())
      .then((result) => {
        fetch("http://localhost:5000/api/connect/addcustomevent", {
          method: "Post",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name,
            description,
            edate,
            time,
            userid,
            poster_url: result.url,
            venue,
            registration_link,
            members
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            setTimeout(() => {
              if (data.error) {
                console.log(data.error);
                setLoading(false);
                setMessage(data.error);
              } else {
                console.log(data);
                setLoading(false);
                socket.emit("refresh", {});
                socket.emit("refreshNotifications", {});
                history.push("/event");
              }
            }, 1000);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  };
  
  const checkView = (id) => {
    if(viewSkill[id]==="true")
      {viewSkill[id]="false";}
    else
      {viewSkill[id]="true";}
  }

  const check = (id) => {
    let t=!tcheck[id];
    if (tcheck[id]){
      
      if (members.indexOf(userDetails[id]._id) >= 0) {
        members.splice(members.indexOf(userDetails[id]._id),1);
        console.log("pop",members);
      }
    }
    else{
      if(members.indexOf(userDetails[id]._id) <= -1){
        members.push(userDetails[id]._id);
        console.log("push",members);
      }
    }
    tcheck[id]=t;
    console.log(tcheck);
  }


  const getSkills=(userid)=>{
    fetch("http://localhost:5000/api/connect/getSkills", {
      method: "Post",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        userid
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setTimeout(() => {
          if (data.error) {
            setMessage(data.error);
          } else {
            console.log(data);
            setUserSkills(data.skills);
          }
        }, 1000);
      });

  }
  const pushAll=()=>{
    var checkboxes=document.getElementsByName('members[]');
    console.log(checkboxes);
    for(var i in checkboxes){
      if(checkboxes[i].checked===false){
        checkboxes[i].checked=true;
        userDetails.map((user) => {
          if (members.indexOf(user._id) <= -1) {
            members.push(user._id);
          }
          return null;
        });
      }
    }
  }
  
  return (
    <React.Fragment>
      <Navbar />
      <Loading />
      <h1 className="event-head">EVENTS</h1>
      <div className="container col-lg-4" id="event-block">
        <h2 className="add-event">Add Event</h2>
        <div className="event-form">
          <div className="form-group">
            <input
              className="event-ip"
              type="text"
              name="name"
              placeholder="Event Title"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
             
          </div>
         
          <div className="form-group">
            <textarea
              className="event-ip"
              rows={2}
              cols={20}
              name="desc"
              placeholder="Event Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <DatePicker
              className="event-ip"
              style={{ width: 250 + "px" }}
              selected={edate}
              onChange={(date) => setDate(date)}
            />
          </div>
          <div className="form-group">
            <input
              className="event-ip"
              type="text"
              name="time"
              placeholder="Event Time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="file"
              name="poster"
              placeholder="Event Poster"
              onChange={(e) => setPoster(e.target.files[0])}
              required
            />
          </div>
          <div className="form-group">
            <input
              className="event-ip"
              type="text"
              name="venue"
              placeholder="Event Venue"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              className="event-ip"
              type="text"
              name="reg_form"
              placeholder="Event Registration Link"
              value={registration_link}
              onChange={(e) => setLink(e.target.value)}
              required
            />
          </div>
          <br/>
          <button
            type="submit"
            className="btn"
            style={{ background: "black",color:"white", marginLeft: -5 + "%", float:"left" }}
            onClick={() => AddEvent()}
          >
            For Everyone
          </button>
          <button
            type="submit"
            className="btn"
            style={{ background: "black",color:"white", marginLeft: 5 + "%", float:"left" }}
            onClick={() => setModal(true)}
          >
            For Selected Users
          </button>
          <br/>
          
        </div>
        <Modal
          visible={modal}
          width="400"
          effect="fadeInUp"
          onClickAway={() =>{ setModal(false);setUserDetails([]);}}
          
        >
                <div className="chat-search viewmodal">
                  <h4 className="chat-head">Add Members</h4>
                  <br/>
                  <input
                    type="text"
                    // className="form-control chat-search-box"
                    placeholder="Search User By Skill..."
                    value={skill}
                    onChange={(e) =>setSkill(e.target.value)}
                    style={{height:40+"px",width:305+"px",float:"left", marginLeft:10+"px", marginRight:10+"px"}}
                  />
                  <button onClick={()=>fetchUser(skill)}
                  style={{border:"none", color:"white"}}>
                    <img src="https://static.thenounproject.com/png/14173-200.png"
                     style={{height:35+"px",width:35+"px",float:"left",border:"none"}}
                     alt="img"></img>
                  </button>
                  { 
                    userDetails.map((user) => {

                    const id=userDetails.indexOf(user);
                     if (members.indexOf(user._id) <= -1 && tcheck[id]) {
                      members.push(user._id);
                    }
                    viewSkill.push("false");
                    return (
                      <div
                        className="link"
                        key={user._id}
                        style={{ cursor: "pointer" }}
                        // onClick={() => socket.emit("refresh", {})}
                      >
                        
                        <div key={user._id}>
                          {user._id === userid ? (
                            <div></div>
                          ) : (
                            
                            <div className="card event-search-card">
                              
                              <img
                                className="chat-search-user-picture"
                                src={user.image_URL}
                                alt="..."
                              />
                              <div>
                                <h5 className="card-title event-search-name">
                                  {user.name}
                                </h5>
                                <input key={Math.random()} type="checkbox" className="check-box" name="members[]" defaultChecked={true} onChange={() =>{check(id); }}></input>
                                <button onClick={()=>{getSkills(user._id);checkView(id)}} 
                                  style={{border:"none",background:"transparent"}}  className="chat-search-view">
                                  <img src="https://cdn2.iconfinder.com/data/icons/pittogrammi/142/61-512.png"
                                  style={{height:30+"px",width:30+"px"}}
                                  alt="img"
                                  />
                                </button>
                              </div>
                              {(viewSkill[id]==="true")?(
                              <div><h5 style={{marginLeft:10+"px"}}>{user.name}'s Skill Set</h5></div>):(<div></div>)}
                              <div class="row justify-content-center" style={{marginLeft:10+"px", width:350+"px"}} >
                              {(viewSkill[id]==="true")?(
                                  
                                 userSkills.map((skill) => {
                                   return(
                                   
                                    <div
                                    class="col-lg-5"
                                    key={skill._id}
                                    style={{
                                      background: "lightsteelblue",
                                      padding: 5 + "px",
                                      margin: 5 + "px",
                                      border: 2 + "px solid pink",
                                      
                                    }}
                                  >
                               <h4>{skill.sname}</h4>
                               <div class="progress">
                                 <div
                                   class="progress-bar"
                                   role="progressbar"
                                   style={{ width:skill.strength * 10 + "%" }}
                                   aria-valuenow={skill.strength * 10}
                                   aria-valuemin="0"
                                   aria-valuemax="100"
                                 >
                                   {skill.strength * 10}%
                                 </div>
                               </div>
                             </div>
                            )
                              })
                              ):(<div></div>)}
                              </div>
                            </div>
                          
                           )} 
                        </div>
                      </div>
                    );
                  })}
                  <br />
                  <br />
                  <button
                    className="btn"
                    onClick={() => {
                      pushAll();
                    }}
                    style={{ background: "black",color:"white", marginLeft: 30 + "%", float:"left" }}
                  >
                    Select All
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      
                       AddCustomEvent();
                      setMembers([]);
                    }}
                    style={{ background: "black",color:"white", marginLeft: 30 + "%", float:"left" }}
                  >
                    Add Event For Them
                  </button>
                  <br />
                  <br />
                </div>
                
              </Modal>
        <Message />
      </div>
    </React.Fragment>
  );
};

export default EventForm;