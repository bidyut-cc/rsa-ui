import React, { useState } from "react";
import apiService from "../../services/apiService";
import { message } from "antd";

function Password() {
    const [passwordData, setPasswordData] = useState({
        "new_password":"",
        "old_password":"",
        "confirm_new_password":"",
        "errors":[]
    });
 
    const handleInput = (e) =>{
        e.persist();
        const {name,value} = e.target;
        setPasswordData({...passwordData,[ name] : value});
    }
    const UpdatePassword = async(e) => {
        e.preventDefault();
        const data = {
            new_password : passwordData.new_password,
            old_password : passwordData.old_password,
            confirm_new_password : passwordData.confirm_new_password 
        }
        try {
            const response = await apiService.post('auth/change-password', data);
            if (response.status) {
              message.success(response.message);
              setPasswordData({
                "new_password":"",
                "old_password":"",
                "confirm_new_password":"",
                "errors":[]
            });
            }
          } catch (error) {
            setPasswordData({...passwordData,errors : error.response.data.errors});
          }
       
    }
   
  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4 text-gray-800">Change Password</h1>
      <section className="content">
        <div className="container-fluid">
          <div className="col-12 ">
            <div className="card">
              <div className="card-body">
                <div className="tab-content">
                  <div className="tab-pane active" id="profile">
                    <form className="form-horizontal" onSubmit={UpdatePassword}>
                    <div className="form-group">
                        <label
                          htmlFor="old_password"
                          className="col-sm-2 control-label"
                        >
                          Old Passwored :
                        </label>
                        <div className="col-sm-10">
                          <input
                            type="password"
                            className={`form-control ${passwordData.errors?.old_password ? 'is-invalid' : ''}`}
                            autoComplete="off"
                            id="old_password"
                            placeholder=" Old Password"
                            name="old_password"
                            value={passwordData.old_password}
                            onChange={handleInput}
                          />
                           <span className="text-danger">{passwordData.errors.old_password?.message}</span>
                        </div>
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="new_password"
                          className="col-sm-2 control-label"
                        >
                          New Password :
                        </label>
                        <div className="col-sm-10">
                          <input
                            type="password"
                            className={`form-control ${passwordData.errors?.new_password ? 'is-invalid' : ''}`}
                            autoComplete="off"
                            id="new_password"
                            placeholder=" New Password"
                            name="new_password"
                            value={passwordData.new_password}
                            onChange={handleInput}
                          />
                          <span className="text-danger">{passwordData.errors.new_password?.message}</span>
                        </div>
                      </div>
                     
                      <div className="form-group">
                        <label
                          htmlFor="inputEmail"
                          className="col-sm-2 control-label"
                        >
                          Confirm Password :
                        </label>
                        <div className="col-sm-10">
                          <input
                            type="password"
                            className={`form-control ${passwordData.errors?.confirm_new_password ? 'is-invalid' : ''}`}
                            autoComplete="off"
                            id="confirm_password"
                            placeholder="Confirm Password"
                            name="confirm_new_password"
                            value={passwordData.confirm_new_password}
                            onChange={handleInput}
                          />
                           <span className="text-danger">{passwordData.errors.confirm_new_password?.message}</span>
                        </div>
                      </div>
                      <div className="form-group">
                        <div className="col-sm-offset-2 col-sm-10 d-flex justify-content-center">
                          <button type="submit" className="btn btn-primary">
                            Update
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Password;
