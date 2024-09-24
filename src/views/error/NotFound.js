import { Result, Button } from "antd";
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  // Function to handle navigation to the dashboard
  const handleBackHome = () => {
    navigate("/dashboard"); // Redirect to the dashboard route
  };
  return (
    <div className="container-fluid">
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={<Button type="primary" onClick={handleBackHome}>Back Home</Button>}
      />
    </div>
  );
};

export default NotFound;
