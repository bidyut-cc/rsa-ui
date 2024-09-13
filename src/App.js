import { Route, Routes } from "react-router-dom";
import './App.css';
import Dashboard from "./views/dashboard/Dashboard";
import Login from "./views/login/Login";
import PrivateOutlet from "./components/layouts/PrivateOutlet";
import './views/dashboard/Dashboard.css'
import Profile from "./views/profile/Profile";
import Password from "./views/profile/Password";
import User from "./views/user/User";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<PrivateOutlet />}>
          <Route path="dashboard" element={<Dashboard title="Dashboard" />} />
          <Route path="profile" element={<Profile title="Profile" />} />
          <Route path="change-password" element={<Password title="Update Password" />} />
          <Route path="users" element={<User title="User" />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;