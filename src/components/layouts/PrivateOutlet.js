import React, { useState, useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import Sidebar from "../inc/Sidebar.js";
import Footer from "../inc/Footer.js";
import Header from "../inc/Header.js";
import apiService from "../../services/apiService.js";
import { message } from "antd";
import { useHeader } from "../context/HeaderContext.js";
import { useUserRole } from "../context/UserRoleContext.js"; 

export default function PrivateOutlet() {
  const { setHeaderTitle } = useHeader(); // Access setHeaderTitle
  const { setUserRole } = useUserRole(); // Access setUserRole from context
  const navigate = useNavigate();
  const auth = useAuth();

// State for sidebar toggling
const [isSidebarToggled, setSidebarToggled] = useState(window.innerWidth <= 768);

  const toggleSidebar = () => {
    setSidebarToggled(prevState => !prevState);
  };

  // useEffect(() => {
  //   console.log("Sidebar toggled:", isSidebarToggled);
  // }, [isSidebarToggled]);

  useEffect(() => {
    const handleResize = () => {
      setSidebarToggled(window.innerWidth <= 768);
    };

    // Attach resize event listener
    window.addEventListener('resize', handleResize);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  


  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const { first_name, last_name } = JSON.parse(user);
      setHeaderTitle(`${first_name} ${last_name}`);
    }
  }, [setHeaderTitle]);
  const handleLogout = async (e) => {
    e.preventDefault(); // Prevent default link behavior

    try {
      // Call the API to log out if necessary
      await apiService.get("auth/logout");

      // Remove the token from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Clear userRole in context
      setUserRole(null); // This sets the userRole to null on logout
      // Manually trigger modal close
      const modalElement = document.getElementById("logoutModal");
      const modal = new window.bootstrap.Modal(modalElement); // For Bootstrap 5
      modal.hide(); // Hide the modal

      // Redirect after the modal has been hidden
      // modalElement.addEventListener('hidden.bs.modal', () => {
      navigate("/login");
      message.success("Logout Successfully.");
      // });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  

  return auth ? (
    <>
      <div id="wrapper">
        {isSidebarToggled}
        {/* <Sidebar style={style} changeStyle={changeStyle} /> */}
        <Sidebar 
          style={isSidebarToggled ? "navbar-nav bg-gradient-primary sidebar sidebar-dark accordion toggled" : "navbar-nav bg-gradient-primary sidebar sidebar-dark accordion"} 
          toggleSidebar={toggleSidebar} 
        />
        <div id="content-wrapper" className="d-flex flex-column">
          <div id="content">
            {/* <Header style={style} changeStyle1={changeStyle1} /> */}
            <Header style={isSidebarToggled ? "navbar-nav bg-gradient-primary sidebar sidebar-dark accordion toggled1" : "navbar-nav bg-gradient-primary sidebar sidebar-dark accordion"} toggleSidebar={toggleSidebar} />
            <Outlet />
          </div>
          <Footer />
        </div>
      </div>

      {/* Scroll to Top Button */}
      <a className="scroll-to-top rounded" href="#page-top">
        <i className="fas fa-angle-up"></i>
      </a>

      {/* Logout Modal */}
      <div
        className="modal fade"
        id="logoutModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                Ready to Leave?
              </h5>
              <button
                className="close"
                type="button"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="modal-body">
              Select "Logout" below if you are ready to end your current
              session.
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                type="button"
                data-dismiss="modal"
              >
                Cancel
              </button>
              <a
                className="btn btn-primary"
                href="/login"
                onClick={handleLogout}
                data-dismiss="modal"
              >
                Logout
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  ) : (
    <Navigate to="/login" />
  );
}
