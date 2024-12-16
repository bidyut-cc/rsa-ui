import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useUserRole } from "../context/UserRoleContext";

function Sidebar({ style, toggleSidebar }) {
  const { userRole } = useUserRole();
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
        { path: '/measurement', label: 'Measurement (3)' },
        { path: '/colors', label: 'Color (6)' }
      ]
    },
    { path: '/quotation', label: 'Quatation Builder', icon: 'fas fa-list' },
    { path: '/leads', label: 'Leads', icon: 'fas fa-list' },
    { path: '/orders', label: 'Orders', icon: 'fas fa-list' },
    { path: '/users', label: 'Users', icon: 'fas fa-fw fa-users' }

  ];

  // Check if the route is accessible based on the role or condition
  const isRouteAccessible = (item) => {
    const restrictedPaths = ["/project", "/layout", "/measurement", "/colors", "/quotation"];
    const restrictedRoles = ["developer", "super_admin"];
    if (restrictedPaths.includes(item.path) && !restrictedRoles.includes(userRole)) {
      return false; // Hide restricted paths for non-authorized roles
    }
    return true;
  };

// Filter navItems based on accessibility
const filteredNavItems = navItems
  .map((item) => {
    if (item.subItems) {
      // Filter subItems based on accessibility
      const accessibleSubItems = item.subItems.filter(isRouteAccessible);
      if (accessibleSubItems.length > 0) {
        return { ...item, subItems: accessibleSubItems }; // Return item with accessible subItems
      }
      return null; // Hide main label if no subItems are accessible
    }
    return isRouteAccessible(item) ? item : null; // Check accessibility for single items
  })
  .filter(Boolean); // Remove null items
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
          {filteredNavItems.map((item, index) => (
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
