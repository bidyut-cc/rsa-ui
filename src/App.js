import { Route, Routes } from "react-router-dom";
import './App.css';
import Dashboard from "./views/dashboard/Dashboard";
import Login from "./views/login/Login";
import PrivateOutlet from "./components/layouts/PrivateOutlet";
import Profile from "./views/profile/Profile";
import Password from "./views/profile/Password";
import User from "./views/user/User";
import { HeaderProvider } from "./components/context/HeaderContext";
import { useUserRole } from './components/context/UserRoleContext';
import Project from "./views/settings/Project";
import Layout from "./views/settings/Layout";
import PermissionDenied from "./views/error/PermissionDenied";
import NotFound from "./views/error/NotFound";
import Measurement from "./views/settings/Measurement";
import Quatation from "./views/quotation/Quotation";
import Lead from "./views/lead/Lead";
import Order from "./views/order/Order";
import Log from "./views/log/Log";
import Color from "./views/settings/Color";
import Quote from "./views/quote/Quote";
import Material from "./views/settings/Material";
import AbandonedOrder from "./views/order/AbandonedOrder";

function App() {

 // Role-based route component
 const RoleBasedRoute = ({ roles, children }) => {
  const { userRole } = useUserRole();
   if (!roles.includes(userRole)) {
     return <PermissionDenied />;
   }
   return children;
 };


  return (
    <>
    <HeaderProvider>
      <Routes>
      {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login title="Login"/>} />

        {/* Protected Routes */}
        <Route path="/*" element={<PrivateOutlet />}>
          
          {/* Common Routes for All Roles */}
          <Route path="dashboard" element={<Dashboard title="Dashboard" />} />
          <Route path="profile" element={<Profile title="Update Profile" />} />
          <Route path="change-password" element={<Password title="Change Password" />} />
          <Route path="orders" element={<Order title="Orders" />} />
          <Route path="abandoned-orders" element={<AbandonedOrder title="Abandoned Orders" />} />
          <Route path="users" element={<User title="Users" />} />
          <Route path="leads" element={<Lead title="Leads" />} />
          {/* <Route 
              path="users" 
              element={userRole === 'developer' ? <User title="Users" /> : <PermissionDenied />} 
            /> */}
            {/* Restricted Routes for Developer and Super Admin */}
           <Route
            path="project"
            element={
              <RoleBasedRoute roles={['developer', 'super_admin']}>
                <Project title="Project Setting" />
              </RoleBasedRoute>
            }
          /> 
         <Route
            path="layout"
            element={
              <RoleBasedRoute roles={['developer', 'super_admin']}>
                <Layout title="Layout Setting" />
              </RoleBasedRoute>
            }
          />
          <Route
            path="measurement"
            element={
              <RoleBasedRoute roles={['developer', 'super_admin']}>
                <Measurement title="Measurement Setting" />
              </RoleBasedRoute>
            }
          />
          <Route
            path="colors"
            element={
              <RoleBasedRoute roles={['developer', 'super_admin']}>
                <Color title="Color & Textures Setting" />
              </RoleBasedRoute>
            }
          />
          <Route
            path="quotation"
            element={
              <RoleBasedRoute roles={['developer', 'super_admin']}>
                <Quatation title="Quotation Builder" />
              </RoleBasedRoute>
            }
          />
          <Route
            path="activity-logs"
            element={
              <RoleBasedRoute roles={['developer', 'super_admin']}>
                <Log title="Activity Logs" />
              </RoleBasedRoute>
            }
          />
          {/* <Route
            path="material-installation-quote"
            element={
              <RoleBasedRoute roles={['developer', 'super_admin']}>
                <Quote title="Material Installation Quote" />
              </RoleBasedRoute>
            }
          /> */}
          <Route
            path="materials"
            element={
              <RoleBasedRoute roles={['developer', 'super_admin']}>
                <Material title="Materials" />
              </RoleBasedRoute>
            }
          />
          {/* Catch-all route for unmatched URLs */}
          <Route path="*" element={<NotFound />} />
        </Route>
        
       
      </Routes>
    </HeaderProvider>
   
   
    </>
  );
}

export default App;