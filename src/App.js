import { Route, Routes } from "react-router-dom";
import './App.css';
import Dashboard from "./views/dashboard/Dashboard";
import Login from "./views/login/Login";
import PrivateOutlet from "./components/layouts/PrivateOutlet";
import Profile from "./views/profile/Profile";
import Password from "./views/profile/Password";
import User from "./views/user/User";
import { HeaderProvider } from "./components/context/HeaderContext";
import Project from "./views/settings/Project";
import Layout from "./views/settings/Layout";
import NotFound from "./views/error/NotFound";
import Measurement from "./views/settings/Measurement";
import Quatation from "./views/quotation/Quotation";
import Lead from "./views/lead/Lead";
import Order from "./views/order/Order";
import Log from "./views/log/Log";
import Color from "./views/settings/Color";
function App() {
  return (
    <>
    <HeaderProvider>
    <Routes>
      {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login title="Login"/>} />

        {/* Protected Routes */}
        <Route path="/*" element={<PrivateOutlet />}>
          <Route path="dashboard" element={<Dashboard title="Dashboard" />} />
          <Route path="profile" element={<Profile title="Update Profile" />} />
          <Route path="change-password" element={<Password title="Change Password" />} />
          <Route path="users" element={<User title="Users" />} />
          <Route path="project" element={<Project title="Project Setting" />} />
          <Route path="layout" element={<Layout title="Layout Setting" />} />
          <Route path="measurement" element={<Measurement title="Measurement Setting" />} />
          <Route path="colors" element={<Color title="Color Setting" />} />
          <Route path="quotation" element={<Quatation title="Quotation Builder" />} />
          <Route path="leads" element={<Lead title="Leads" />} />
          <Route path="orders" element={<Order title="Orders" />} />
          <Route path="activity-logs" element={<Log title="Activity Logs" />} />
          

          {/* Catch-all route for unmatched URLs */}
          <Route path="*" element={<NotFound />} />
        </Route>
        
       
      </Routes>
    </HeaderProvider>
    </>
  );
}

export default App;