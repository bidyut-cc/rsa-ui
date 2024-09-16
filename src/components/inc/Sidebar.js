import React from "react";
import { Link, useLocation } from "react-router-dom";

function Sidebar({ style, changeStyle }) {
  const location = useLocation(); // Get the current route path
  return (
    <>
      {/*  <!-- Sidebar --> */}
      <ul className={style} id="accordionSidebar">
        {/*  <!-- Sidebar - Brand --> */}
        <Link
          className="sidebar-brand d-flex align-items-center justify-content-center"
          href="#"
        >
          <div className="sidebar-brand-icon rotate-n-15">
            <i className="fas fa-user"></i>
          </div>
          <div className="sidebar-brand-text mx-3">
            RSA Admin
          </div>
          <div className="text-center d-none d-md-inline">
            <button
              className="rounded-circle border-0"
              id="sidebarToggle"
              onClick={changeStyle}
            ></button>
          </div>
        </Link>

        {/*   <!-- Divider --> */}
        <hr className="sidebar-divider my-0" />

        {/*  <!-- Nav Item - Dashboard --> */}
        <li className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
        <Link className="nav-link" to="/dashboard">
            <i className="fas fa-fw fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </Link>
        </li>
        <li className={`nav-item ${location.pathname === '/users' ? 'active' : ''}`}>
            <Link className="nav-link" to="users">
                <i className="fas fa-fw fa fa-users"></i>
                <span>Users</span></Link>
        </li>
       
    
        {/*   <!-- Sidebar Toggler (Sidebar) --> */}
        {/* <div className="text-center d-none d-md-inline">
          <button
            className="rounded-circle border-0"
            id="sidebarToggle"
            onClick={changeStyle}
          ></button>
        </div> */}
      </ul>
      {/*  <!-- End of Sidebar --> */}
    </>
  );
}

export default Sidebar;
