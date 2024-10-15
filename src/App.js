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
function App() {
  return (
    <>
    <HeaderProvider>
    <Routes>
      {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/*" element={<PrivateOutlet />}>
          <Route path="dashboard" element={<Dashboard title="Dashboard" />} />
          <Route path="profile" element={<Profile title="Profile" />} />
          <Route path="change-password" element={<Password title="Update Password" />} />
          <Route path="users" element={<User title="User" />} />
          <Route path="project" element={<Project title="Project Setting" />} />
          <Route path="layout" element={<Layout title="Layout Setting" />} />
          <Route path="measurement" element={<Measurement title="Measurement Setting" />} />
          <Route path="quotation" element={<Quatation title="Quotation" />} />
          <Route path="leads" element={<Lead title="Lead" />} />

          {/* Catch-all route for unmatched URLs */}
          <Route path="*" element={<NotFound />} />
        </Route>
        
       
      </Routes>
    </HeaderProvider>
    </>
  );
}

export default App;