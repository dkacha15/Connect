import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import cookie from "react-cookies";

import "./App.css";
import Landing from "./Routes/Landing/land";
import LoginPage from "./Routes/Login/login";
import RegistrationPage from "./Routes/Registration/registration";
import HomePage from "./Routes/Home/home";
import EventForm from "./Routes/Event/eventform";
import EventPage from "./Routes/Event/event";
import ChatPage from "./Routes/Chat/chat";
import ChatRoom from "./Routes/Chat/chatRoom";
import GroupChatRoom from "./Routes/Chat/groupChatRoom";
import ConfirmEmailPage from "./Routes/Registration/confirmEmail";
import ProfilePage from "./Routes/Profile/profile";
import UserProfilePage from "./Routes/Profile/userProfile";
import EditProfilePage from "./Routes/Profile/editProfile";
import ResetPasswordPage from "./Routes/Login/resetPass";
import ForgetPasswordMailPage from "./Routes/Login/resetMail";
import ForgetPasswordPage from "./Routes/Login/forgetPass";
import EmailVerifiedPage from "./Routes/Login/emailVeri";

const Routing = () => {
  const token = cookie.load("access_token");
  const [userType, setUserType] = useState("");

  useEffect(() => {
    if (token) {
      fetch("http://localhost:5000/api/connect/getCurrentUser", {
        method: "Get",
        credentials: "include",
      })
        .then((res) => res.json())
        .then((result) => {
          setUserType(result.user.type);
        });
    }
  });

  const Routes = () => {
    if (token) {
      return (
        <Switch>
          <Route path="/home" exact>
            <HomePage />
          </Route>
          {userType === "graduate" ? (
            <Route path="/addevent" exact>
              <EventForm />
            </Route>
          ) : null}
          <Route path="/event" exact>
            <EventPage />
          </Route>
          <Route path="/chat" exact>
            <ChatPage />
          </Route>
          <Route path="/chatRoom/:user2_id" exact>
            <ChatRoom />
          </Route>
          <Route path="/groupChatRoom/:chatroom_id" exact>
            <GroupChatRoom />
          </Route>
          <Route path="/profile" exact>
            <ProfilePage />
          </Route>
          <Route path="/profile/:userid" exact>
            <UserProfilePage />
          </Route>
          <Route path="/editprofile" exact>
            <EditProfilePage />
          </Route>
          <Redirect to="/home">
            <HomePage />
          </Redirect>
        </Switch>
      );
    } else {
      return (
        <Switch>
          <Route path="/" exact>
            <Landing />
          </Route>
          <Route path="/user-login" exact>
            <LoginPage />
          </Route>
          <Route path="/user-registration" exact>
            <RegistrationPage />
          </Route>
          <Route path="/email-verification" exact>
            <ConfirmEmailPage />
          </Route>
          <Route path="/resend-verification" exact>
            <ConfirmEmailPage />
          </Route>
          <Route path="/reset-password/:token">
            <ForgetPasswordPage />
          </Route>
          <Route path="/forget-password-mail">
            <ForgetPasswordMailPage />
          </Route>
          <Route path="/forgetPassword">
            <ResetPasswordPage />
          </Route>
          <Route path="/emailVerified">
            <EmailVerifiedPage />
          </Route>
          <Redirect to="/">
            <Landing />
          </Redirect>
        </Switch>
      );
    }
  };

  return <Routes />;
};

const App = () => {
  return (
    <Router>
      <Routing />
    </Router>
  );
};

export default App;
