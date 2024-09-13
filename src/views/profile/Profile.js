import React, { useEffect, useState } from "react";
import apiService from "../../services/apiService";
import { message } from "antd";

function Profile() {
    const [profileData, setProfileData] = useState({
        "first_name":"",
        "last_name":"",
        "email":"",
        "phone":"",
        "errors":[]
    });


    const fetchRecords = async () => {
      try {
        const response = await apiService.get('auth/profile');
        setProfileData(prevData => ({ ...prevData, ...response }));
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

  useEffect(() => {
    fetchRecords();
  }, []);

    const handleProfileInput = (e) =>{
        e.persist();
        const {name,value} = e.target;
        setProfileData({...profileData,[ name] : value});
    }
    const UpdateProfile = async(e) => {
        e.preventDefault();
        const data = {
            first_name : profileData.first_name,
            last_name : profileData.last_name,
            email : profileData.email,
            phone : profileData.phone,
        }
        try {
            const response = await apiService.post('auth/update-profile', data);
            if (response.status) {
              message.success(response.message);
            }
          } catch (error) {
            setProfileData({...profileData,errors : error.response.data.errors});
          }
   
       
    }
  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4 text-gray-800">Update Profile</h1>
      <section className="content">
        <div className="container-fluid">
          <div className="col-12 ">
            <div className="card">
              <div className="card-body">
                <div className="tab-content">
                  <div className="tab-pane active" id="profile">
                    <form className="form-horizontal" onSubmit={UpdateProfile}>
                      <div className="form-group">
                        <label
                          htmlFor="first_name"
                          className="col-sm-2 control-label"
                        >
                          First Name :
                        </label>
                        <div className="col-sm-10">
                          <input
                            type="text"
                            className={`form-control ${profileData.errors?.first_name ? 'is-invalid' : ''}`}
                            autoComplete="off"
                            id="first_name"
                            placeholder=" First Name"
                            name="first_name"
                            value={profileData?.first_name} 
                            onChange={handleProfileInput}
                          />
                          <span className="text-danger">{profileData.errors.first_name?.message}</span>
                        </div>
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="last_name"
                          className="col-sm-2 control-label"
                        >
                          Last Name :
                        </label>
                        <div className="col-sm-10">
                          <input
                            type="text"
                            className={`form-control ${profileData.errors?.last_name ? 'is-invalid' : ''}`}
                            autoComplete="off"
                            id="last_name"
                            placeholder=" Last Name"
                            name="last_name"
                            value={profileData?.last_name} 
                            onChange={handleProfileInput}
                          />
                           <span className="text-danger">{profileData.errors.last_name?.message}</span>
                        </div>
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="inputEmail"
                          className="col-sm-2 control-label"
                        >
                          Email :
                        </label>
                        <div className="col-sm-10">
                          <input
                            type="email"
                            className={`form-control ${profileData.errors?.email ? 'is-invalid' : ''}`}
                            autoComplete="off"
                            id="inputEmail"
                            placeholder="Email"
                            name="email"
                            value={profileData?.email} 
                            onChange={handleProfileInput}
                          />
                           <span className="text-danger">{profileData.errors.email?.message}</span>
                        </div>
                      </div>
                      <div className="form-group">
                        <label
                          htmlFor="phone"
                          className="col-sm-2 control-label"
                        >
                          Phone :
                        </label>
                        <div className="col-sm-10">
                          <input
                            type="text"
                            className={`form-control ${profileData.errors?.phone ? 'is-invalid' : ''}`}
                            autoComplete="off"
                            id="phone"
                            placeholder=" Phone"
                            name="phone"
                            value={profileData?.phone} 
                            onChange={handleProfileInput}
                          />
                           <span className="text-danger">{profileData.errors.phone?.message}</span>
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

export default Profile;
