import { Result, Button } from "antd";
import React from "react";
import {useNavigate } from "react-router-dom";

const PermissionDenied = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  // Function to handle navigation to the dashboard
  const handleBackHome = () => {
    navigate("/dashboard"); // Redirect to the dashboard route
  };
  return (
    <div className="container-fluid">
      <Result
       status="403"
       title="403"
       subTitle="Sorry, you are not authorized to access this page."
        extra={<Button type="primary" onClick={handleBackHome}>Back Home</Button>}
      />
    </div>
  );
};

export default PermissionDenied;
