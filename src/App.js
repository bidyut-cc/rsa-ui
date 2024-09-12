import { Route, Routes } from "react-router-dom";
import './App.css';
import Dashboard from "./views/dashboard/Dashboard";
import Login from "./views/login/Login";
import PrivateOutlet from "./components/layouts/PrivateOutlet";
import './views/dashboard/Dashboard.css'
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<PrivateOutlet />}>
          <Route path="dashboard" element={<Dashboard title="Dashboard" />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;