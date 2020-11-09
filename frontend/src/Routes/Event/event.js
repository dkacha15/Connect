import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as moment from "moment";

import Navbar from "../../Shared/Navbar/navbar";
import AddEventIcon from "../../Images/addEvent.png";
import "./event.css";

const nl2br = require("react-nl2br");

const Event = () => {
  const [events, setEvents] = useState([]);
  const [userType, setUserType] = useState("");
  const [userid, setUserId] = useState();
  var k=false;
  var t=false;
  var x="Show Interest";
  var y="Interested"
 useEffect(() => {
     fetch("http://localhost:5000/api/connect/getCurrentUser", {
      method: "Get",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((result) => {
        setUserType(result.user.type);
        setUserId(result.user._id);
        
        fetch("http://localhost:5000/api/connect/event", {
          method: "Post",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            userid:result.user._id
          }),
        })
          .then((res) => res.json())
          .then((result) => {
            setEvents(result.events);
            
            
          });
      });
  }, []);

  const getAllEvents = () => {
    console.log(userid);
    fetch("http://localhost:5000/api/connect/event", {
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
      .then((result) => {
        setEvents(result.events);
      });
  };

  const interested = (eid) => {
    console.log(userid);
    fetch("http://localhost:5000/api/connect/interested", {
      method: "Post",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        userid,
        eid
      }),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.msg){
        }
      });
  };

  const checkstats = (index,id) => {
    
    events[index].interested.map((u)=>{
    if (u.user===userid)
    {
      k=true;
    }
    return null
  });
  if(!k){
    interested(id);
    getAllEvents();
  }
  else{
    k=false;
  }
   
};

 

  return (
    <React.Fragment>
      <Navbar />
      <h1 className="event-head">EVENTS</h1>
      <div className="container event-cards">
        <div className="row justify-content-center">
          {events.map((item) => {
            t=false;
            const id=events.indexOf(item);
            console.log(item.interested);
            return (
              <div key={item._id} className="col-lg-5">
                <div className="card event-card">
                  <img
                    className="card-img-top"
                    src={item.poster_url}
                    alt="Event Poster"
                    style={{ height: 180 + "px" }}
                  />
                  <div className="card-body">
                    <h5 className="card-title event-title">{item.name}</h5>
                    <p className="card-text">
                      {nl2br(item.description)}
                      <br />
                      <span>Event Date:</span>{" "}
                      {moment(item.date).format("DD/MM/YYYY")}
                      <br />
                      <span>Event Time:</span>{" "}
                      {item.time}
                      <br />
                      <span>Event Venue:</span>
                      {item.venue}
                      <br />
                      <span>Posted By:</span> {item.author.name}{" "}
                      <span> At </span>{" "}
                      {moment(item.createAt).format("DD/MM/YYYY")}
                    </p>
                    <p></p>
                    <div
                      key={item._id}
                      className="btn btn-primary"
                      onClick={()=>checkstats(id,item._id)}>
                      {
                        
                      item.interested.map((u)=>{
                          
                      if (u.user===userid)
                      {
                        t=true;
                      }
                      return null;
                    })
                    
                    }
                    {t?(y):(x)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {userType === "graduate" ? (
            <Link to="/addevent">
              <img
                className="fixedbutton"
                src={AddEventIcon}
                alt="add event"
              ></img>
            </Link>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default Event;
