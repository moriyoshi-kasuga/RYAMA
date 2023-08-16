import React from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import './BaseHome.css';
import icon from '../../Assets/images/icon.png';
import logo from '../../Assets/images/logo.png';
import Publish from './Publish';
import About from './About';
import Features from './Features';
import NotFond from '../NotFound';
import Home from './Home';
import Signup from './Signup';
import Login from './Login';

function BaseHome() {
  return (
    <>
      <div className="base">
        <div id="header">
          <nav id="heaader-nav">
            <NavLink to="/" className="logo">
              <img src={icon} alt="" height="50" />
              <img src={logo} alt="" height="50" />
            </NavLink>
            <ul className="header-nav-list">
              <li>
                <NavLink to="/publish">公開機能</NavLink>
              </li>
              <li>
                <NavLink to="/about">サイト概要</NavLink>
              </li>
              <li>
                <NavLink to="/features">使い方</NavLink>
              </li>
              <li>
                <NavLink to="/markdowns">飾る</NavLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <div className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/publish" element={<Publish />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<NotFond />} />
        </Routes>
      </div>
    </>
  );
}

export default BaseHome;
