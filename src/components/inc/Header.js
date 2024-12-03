import React from "react";
import { Link } from "react-router-dom";
import { useHeader } from "../context/HeaderContext"; // Import the context

function Header({ style, toggleSidebar }) {
  const { headerTitle } = useHeader(); // Access the shared state
  return (
    <>
      {/*  <!-- Topbar --> */}
      <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
        {/*  <!-- Sidebar Toggle (Topbar) --> */}
        <button
          id="sidebarToggleTop"
          className="btn btn-link d-md-none rounded-circle mr-3"
          onClick={toggleSidebar}
        >
          <i className="fa fa-bars"></i>
        </button>

        {/*  <!-- Topbar Navbar --> */}
        <ul className="navbar-nav ml-auto">
     

          {/*  <!-- Nav Item - Alerts --> */}
          <li className="nav-item dropdown no-arrow mx-1">
            {/* <Link
              className="nav-link dropdown-toggle"
              href="#"
              id="alertsDropdown"
              role="button"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <i className="fas fa-bell fa-fw"></i>
              <span className="badge badge-danger badge-counter">3+</span>
            </Link> */}
            {/*   <!-- Dropdown - Alerts --> */}
            {/* <div
              className="dropdown-list dropdown-menu dropdown-menu-right shadow animated--grow-in"
              aria-labelledby="alertsDropdown"
            >
              <h6 className="dropdown-header">Alerts Center</h6>
              <Link className="dropdown-item d-flex align-items-center" href="#">
                <div className="mr-3">
                  <div className="icon-circle bg-primary">
                    <i className="fas fa-file-alt text-white"></i>
                  </div>
                </div>
                <div>
                  <div className="small text-gray-500">December 12, 2019</div>
                  <span className="font-weight-bold">
                    A new monthly report is ready to download!
                  </span>
                </div>
              </Link>
              <Link className="dropdown-item d-flex align-items-center" href="#">
                <div className="mr-3">
                  <div className="icon-circle bg-success">
                    <i className="fas fa-donate text-white"></i>
                  </div>
                </div>
                <div>
                  <div className="small text-gray-500">December 7, 2019</div>
                  $290.29 has been deposited into your account!
                </div>
              </Link>
              <Link className="dropdown-item d-flex align-items-center" href="#">
                <div className="mr-3">
                  <div className="icon-circle bg-warning">
                    <i className="fas fa-exclamation-triangle text-white"></i>
                  </div>
                </div>
                <div>
                  <div className="small text-gray-500">December 2, 2019</div>
                  Spending Alert: We've noticed unusually high spending for your
                  account.
                </div>
              </Link>
              <Link
                className="dropdown-item text-center small text-gray-500"
                href="#"
              >
                Show All Alerts
              </Link>
            </div> */}
          </li>

          {/*  <!-- Nav Item - Messages --> */}
          <li className="nav-item dropdown no-arrow mx-1">
            <Link
              className="nav-link dropdown-toggle"
              href="#"
              id="messagesDropdown"
              role="button"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
      
            </Link>
            {/*   <!-- Dropdown - Messages --> */}
            <div
              className="dropdown-list dropdown-menu dropdown-menu-right shadow animated--grow-in"
              aria-labelledby="messagesDropdown"
            >
              <h6 className="dropdown-header">Message Center</h6>
              <Link className="dropdown-item d-flex align-items-center" href="#">
                <div className="dropdown-list-image mr-3">
                  <img
                    className="rounded-circle"
                    src="img/undraw_profile_1.svg"
                    alt="..."
                  />
                  <div className="status-indicator bg-success"></div>
                </div>
                <div className="font-weight-bold">
                  <div className="text-truncate">
                    Hi there! I am wondering if you can help me with a problem
                    I've been having.
                  </div>
                  <div className="small text-gray-500">Emily Fowler · 58m</div>
                </div>
              </Link>
              <Link className="dropdown-item d-flex align-items-center" href="#">
                <div className="dropdown-list-image mr-3">
                  <img
                    className="rounded-circle"
                    src="img/undraw_profile_2.svg"
                    alt="..."
                  />
                  <div className="status-indicator"></div>
                </div>
                <div>
                  <div className="text-truncate">
                    I have the photos that you ordered last month, how would you
                    like them sent to you?
                  </div>
                  <div className="small text-gray-500">Jae Chun · 1d</div>
                </div>
              </Link>
              <Link className="dropdown-item d-flex align-items-center" href="#">
                <div className="dropdown-list-image mr-3">
                  <img
                    className="rounded-circle"
                    src="img/undraw_profile_3.svg"
                    alt="..."
                  />
                  <div className="status-indicator bg-warning"></div>
                </div>
                <div>
                  <div className="text-truncate">
                    Last month's report looks great, I am very happy with the
                    progress so far, keep up the good work!
                  </div>
                  <div className="small text-gray-500">Morgan Alvarez · 2d</div>
                </div>
              </Link>
              <Link className="dropdown-item d-flex align-items-center" href="#">
                <div className="dropdown-list-image mr-3">
                  <img
                    className="rounded-circle"
                    src="https://source.unsplash.com/Mv9hjnEUHR4/60x60"
                    alt="..."
                  />
                  <div className="status-indicator bg-success"></div>
                </div>
                <div>
                  <div className="text-truncate">
                    Am I a good boy? The reason I ask is because someone told me
                    that people say this to all dogs, even if they aren't
                    good...
                  </div>
                  <div className="small text-gray-500">
                    Chicken the Dog · 2w
                  </div>
                </div>
              </Link>
              <Link
                className="dropdown-item text-center small text-gray-500"
                href="#"
              >
                Read More Messages
              </Link>
            </div>
          </li>

          <div className="topbar-divider d-none d-sm-block"></div>

          {/* <!-- Nav Item - User Information --> */}
          <li className="nav-item dropdown no-arrow">
            <Link
              className="nav-link dropdown-toggle"
              href="#"
              id="userDropdown"
              role="button"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <span className="mr-2 d-none d-lg-inline text-gray-600 small">
             {headerTitle}
              </span>
              <img
                className="img-profile rounded-circle"
                src="img/undraw_profile.svg"
                alt=""
              />
            </Link>
            {/*  <!-- Dropdown - User Information --> */}
            <div
              className="dropdown-menu dropdown-menu-right shadow animated--grow-in"
              aria-labelledby="userDropdown"
            >
              <Link className="dropdown-item" to="/profile">
                <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>
                Profile
              </Link>
              <Link className="dropdown-item" to="/change-password">
                <i className="fas fa-cogs fa-sm fa-fw mr-2 text-gray-400"></i>
                Change Password
              </Link>
              {/* <Link className="dropdown-item" href="#">
                <i className="fas fa-list fa-sm fa-fw mr-2 text-gray-400"></i>
                Activity Log
              </Link> */}
              <div className="dropdown-divider"></div>
              <Link
                className="dropdown-item"
                href="#"
                data-toggle="modal"
                data-target="#logoutModal"
              >
                <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                Logout
              </Link>
            </div>
          </li>
        </ul>
      </nav>
      {/*  <!-- End of Topbar --> */}
    </>
  );
}

export default Header;
