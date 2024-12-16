import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import useAuth from '../../components/hooks/useAuth';
import { message, Spin} from 'antd';
import { useUserRole } from "../../components/context/UserRoleContext"; 
function Login({title}) {
  const { setUserRole } = useUserRole(); // Access setUserRole from context
    const [loginInput,setLogin] = useState({
      email:"",
      password:"",
      errors:[],
      loading: false,
  });
  const handleInput = (e) =>{
    e.persist();
    const {name,value} = e.target;
    setLogin({...loginInput,[ name] : value});
  }
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    // Check if the user is already authenticated
    if (auth) {
      navigate('/dashboard'); // Redirect to dashboard if already logged in
    }
  }, [auth, navigate]);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    const data = {
        email : loginInput.email,
        password : loginInput.password 
    }
    setLogin((prev) => ({ ...prev, loading: true }));
    try {
      const response = await apiService.post('auth/login', data);
      if (response.status === 200) {
        // Assuming the response contains user data
        const { id, first_name, last_name, email, phone , roles } = response.data.data;
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify({ id, first_name, last_name, email, phone, roles }));
        localStorage.setItem('token', response.data.access_token);
        setUserRole(roles[0]);
        // Redirect to dashboard
        navigate('/dashboard');
        setLogin((prev) => ({ ...prev, loading: false,errors:[] }));
        message.success(response.data.message);
      }
      
    } catch (error) {
      setLogin((prev) => ({ ...prev, loading: false }));
      if (error.response) {
        if (error.response.status === 422) {
           setLogin({...loginInput, errors: error.response.data.errors});
        }else if (error.response.status === 500) {
          setLogin({...loginInput,errors : []});
          message.error(error.response.data.message);
        } else {
          message.error('Something went wrong. Please try again later.');
        }
      }else{
         message.error('Some Problem Occured! Please try again later.');
      }
      
      
    }
  
   
}

  return (
    <div className="bg-gradient-primary">
      <div className="container">
        <div className="row justify-content-center align-items-center">
          <div className="col-xl-10 col-lg-12 col-md-9">
            <div className="card o-hidden border-0 shadow-lg my-5">
              <div className="card-body p-0">
                <div className="row">
                  <div className="col-lg-6 d-flex justify-content-center align-items-center bg-login-image">
                    <div className="logo p-5 w-100">
                      <img src="img/logo.gif" alt="" className="img-fluid" />
                    </div>
                  </div>
                  <div className="col-lg-6">
                  <Spin spinning={loginInput.loading}>
                    <div className="p-5">
                      <div className="text-center">
                        <h1 className="h4 text-gray-900 mb-4">{title}</h1>
                      </div>
                      <form className="user" onSubmit={handleLogin}>
                        <div className="form-group">
                          <input
                            type="email"
                            className={`form-control form-control-user ${loginInput.errors?.email ? 'is-invalid' : ''}`}
                            id="exampleInputEmail"
                            aria-describedby="emailHelp"
                            placeholder="Email"
                            name="email"
                            value={loginInput.email} 
                            onChange={handleInput}
                          />
                         <span className="text-danger">{loginInput.errors.email?.message}</span>
                        </div>
                        <div className="form-group">
                          <input
                            type="password"
                            className={`form-control form-control-user ${loginInput.errors?.password ? 'is-invalid' : ''}`}
                            id="exampleInputPassword"
                            placeholder="Password"
                            name="password"
                            value={loginInput.password}
                            onChange={handleInput}
                          />
                        <span className="text-danger">{loginInput.errors.password?.message}</span>
                        </div>
                        <div className="form-group">
                          <div className="custom-control custom-checkbox small">
                            <input
                              type="checkbox"
                              className="custom-control-input"
                              id="customCheck"
                            />
                            <label className="custom-control-label" htmlFor="customCheck">
                              Remember Me
                            </label>
                          </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-user btn-block">
                          Login
                        </button>
                        <hr />
                        <div className="text-center">
                          <Link className="small" href="">Forgot Password?</Link>
                        </div>
                        {/* <div className="text-center">
                          <Link className="small" href="">Create an Account!</Link>
                        </div> */}
                      </form>
                    </div>
                  </Spin>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;