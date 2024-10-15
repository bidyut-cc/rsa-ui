import React from "react";
import { Link, useLocation } from "react-router-dom";

function Sidebar({ style, toggleSidebar }) {
  const location = useLocation(); // Get the current route path

  // Define navigation items
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'fas fa-fw fa-tachometer-alt' },
    { 
      label: 'Settings', 
      icon: 'fas fa-fw fa-cogs', 
      subItems: [
        { path: '/project', label: 'Project (1)' },
        { path: '/layout', label: 'Layout (2)' },
        { path: '/measurement', label: 'Measurement (3)' }
      ]
    },
    { path: '/quotation', label: 'Quatation Builder', icon: 'fas fa-list' },

    { path: '/users', label: 'Users', icon: 'fas fa-fw fa-users' }

  ];
  return (
    <>
      {/*  <!-- Sidebar --> */}
      <ul className={style} id="accordionSidebar">
        {/*  <!-- Sidebar - Brand --> */}
        <Link
          className="sidebar-brand d-flex align-items-center justify-content-center"
          to="dashboard"
        >
          <img
                className="img-profile rounded-circle"
                src="img/undraw_profile.svg"
                alt=""
                style={{ height: "2rem", width: "2rem" }}
              />
          <div className="sidebar-brand-icon rotate-n-15">
            {/* <i className="fas fa-user"></i> */}
            
          </div>
          {/* <div className="sidebar-brand-text mx-3">
            RSA Admin
          </div> */}
          {/* <div className="text-center d-none d-md-inline">
            <button
              className="rounded-circle border-0"
              id="sidebarToggle"
              onClick={toggleSidebar}
            ></button>
          </div> */}
        </Link>

        {/*   <!-- Divider --> */}
        <hr className="sidebar-divider my-0" />
          {navItems.map((item, index) => (
              item.subItems ? (
                <li className={`nav-item ${item.subItems.some(subItem => location.pathname === subItem.path) ? 'active' : ''}`} key={index}>
                  <Link
                    className={`nav-link collapsed ${item.subItems.some(subItem => location.pathname === subItem.path) ? 'active' : ''}`}
                    href="#"
                    data-toggle="collapse"
                    data-target={`#collapse${item.label}`}
                    aria-expanded={item.subItems.some(subItem => location.pathname === subItem.path)}
                    aria-controls={`collapse${item.label}`}
                  >
                    <i className={item.icon}></i>
                    <span>{item.label}</span>
                  </Link>
                  <div
                    id={`collapse${item.label}`}
                    className={`collapse ${item.subItems.some(subItem => location.pathname === subItem.path) ? 'show' : ''}`}
                    aria-labelledby={`heading${item.label}`}
                    data-parent="#accordionSidebar"
                  >
                    <div className="bg-white py-2 collapse-inner rounded">
                      {item.subItems.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          className={`collapse-item ${location.pathname === subItem.path ? 'active' : ''}`}
                          to={subItem.path}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </li>
              ) : (
                <li className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} key={index}>
                  <Link className="nav-link" to={item.path}>
                    <i className={item.icon}></i>
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
      ))}
    
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
