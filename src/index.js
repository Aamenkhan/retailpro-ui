import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import Landing from "./Landing";
import Signup from "./Signup";
import BookDemo from "./BookDemo";
import DemoAccess from "./DemoAccess";
import Pricing from "./Pricing";
import ThtwaatPOSApp from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/book-demo" element={<BookDemo />} />
        <Route path="/demo" element={<DemoAccess />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/app" element={<ThtwaatPOSApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
