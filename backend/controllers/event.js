const Event = require("../models/eventSchema");
const User = require("../models/userSchema");
const { JWT_SECRET, EMAIL, PASS } = require("../config/keys");
const nodemailer = require("nodemailer");
const moment = require("moment");

let transporter = nodemailer.createTransport({
  //host: 'smtp.gmail.com',
  service: "gmail",
  // port: 587,
  // ignoreTLS: false,
  // secure: false,
  auth: {
    user: EMAIL,
    pass: PASS,
  },
});
module.exports = {
  async createEvent(req, res) {
    const {
      name,
      description,
      edate,
      poster_url,
      venue,
      time,
      registration_link,
      userid
    } = req.body;
    if (!name || !description || !edate || !registration_link) {
      return res.json({ error: "Please Fill The Required Details" });
    }
    const event = new Event({
      name,
      description,
      date: edate,
      author: req.user._id,
      poster_url,
      venue,
      time,
      registration_link,
      createdAt: Date.now(),
    });
    await event
      .save()
      .then((result) => {

        if (result) {
          Event.findByIdAndUpdate(result._id,{
            $push: {
              interested: {
              user: userid,
              btntext: 'Show Interest',
            },
          },
        }).then((upd)=>{

          User.update(
            {
              _id:{$ne: result.author}
            },
            {
              $push: {
                notifications: {
                  senderId: result.author,
                  message: `${req.user.name} created a public event - ${result.name}.`,
                  createdAt: new Date(),
                  link:"/event"
                },
              },
            },
            {
              multi:true
            }
          ).then();
          res.json({
            message: "Event Created Successfully",
            event: result,
          });
        })
       } else {
          return res.json({ error: "Error creating event" });
        }
      })  
      .catch((err) => {
        console.log(err);
      });
  },
  async createCustomEvent(req, res) {
    const {
      name,
      description,
      edate,
      poster_url,
      venue,
      time,
      registration_link,
      members,
      userid
    } = req.body;
    if (!name || !description || !edate || !registration_link) {
      return res.json({ error: "Please Fill The Required Details" });
    }
    const event = new Event({
      name,
      description,
      date: edate,
      author: req.user._id,
      poster_url,
      venue,
      time,
      registration_link,
      members,
      createdAt: Date.now(),
    });
    await event
      .save()
      .then((result) => {
        if (result) {
          Event.findByIdAndUpdate(result._id,{
            $push: {
              interested: {
              user: userid,
              btntext: 'Show Interest',
            },
          },
        }).then((upd)=>{
          id=members.indexOf((result.author).toString());
          members.splice(id,1);
          User.update(
            {
              _id: {$in : members},
            },
            {
              $push: {
                notifications: {
                  senderId: result.author,
                  message: `${req.user.name} created a skill specific private event - ${result.name} .`,
                  createdAt: new Date(),
                  link:"/event"
                },
              },
            },{
              multi:true
            }
          ).then();
          res.json({
            message: "Event Created Successfully",
            event: result,
          });
        })} else {
          return res.json({ error: "Error creating event" });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  },

  async viewEvent(req, res) {

    await Event.find()
      .populate("author", "name type")
      .populate("interested","user btntext")
      .sort({ createdAt: -1 })
      .then((events) => {
        if (!events) {
          return res.json({ error: "No Events Found" });
        }
        else{
          events.map((event) =>{
            if(event.members.length>0){
              id=events.indexOf(event);
              if (event.members.indexOf(req.body.userid) <= -1) {
                    events.splice(id,1);
              }
           }
         });
         res.json({ events ,l:events.length});
        }
        
      })
      .catch((err) => {
        console.log(err);
      });
  },
  async interested(req, res) {

    await Event.findByIdAndUpdate(req.body.eid,{
      $push: {
        interested: {
        user: req.body.userid,
        btntext: 'Interested',
      },
    },
  })
      .then(()=>{
        Event.findById(req.body.eid)
        .populate("author", "name type")
        
      .then((fevent) => {
        if (!fevent) {
          return res.json({ error: "No Events Found" });
        }
        else{
         User.findById(req.body.userid)
         .then((fuser)=>{
          let mailOptions = {
            from: '"CONNECT" <complect.with.connect@gmail.com>',
            to: fuser.primary_email,
            subject: "Event Details -- "+fevent.name,
            html:
              "<h1>Greetings from Connect!</h1> <br/><img src="+fevent.poster_url+" <br/><h2> Details of the event: </h2><br/> <h4>Name : "+fevent.name+"</h4><h4>Description : "+fevent.description+"</h4><h4>Date : "+ moment(fevent.date).format("DD/MM/YYYY")+ "</h4><h4>Time : "+fevent.time +"</h4><h4>Venue :  "+fevent.venue+"</h4><br><a href=" + fevent.registration_link +">Click Here To Register</a><br/><br/><h4>You received this mail as you showed interest in this event! :)</h4>",
          };
          transporter.sendMail(mailOptions, function (err, data) {
            if (err) {
              console.log(err);
            } else {
              res.json({msg:true});
            }
         })
        })
      } 
      })
      .catch((err) => {
        console.log(err);
      });
      })  
  },
  async getSkills(req, res) {
    await User.findById(req.body.userid)
      .populate("skills", "name type")
      .then((user) => {
        if (!user) {
          return res.json({ error: "No User Found" });
        }
        else{
         res.json({ skills: user.skills});
        
        }
        
      })
      .catch((err) => {
        console.log(err);
      });
  },
};
