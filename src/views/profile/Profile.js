import React, { useCallback, useEffect, useState } from "react";
import apiService from "../../services/apiService";
import { Form, Input, Button, Card, Row, Col , message, Spin} from 'antd';
import { useHeader } from "../../components/context/HeaderContext"; // Import the context

function Profile() {
  const { setHeaderTitle } = useHeader(); // Get the function to update the header
  

  const [form] = Form.useForm();
    const [profileData, setProfileData] = useState({
        first_name:"",
        last_name:"",
        email:"",
        phone:"",
        errors:[],
        loading: false,
    });
    const [buttonLoading, setButtonLoading] = useState(false); // Separate state for button-specific loading

    const fetchRecords = useCallback(async () => {
      try {
        setProfileData((prev) => ({ ...prev, loading: true }));
        const response = await apiService.get('auth/profile');
        if(response.status === 200){
          form.setFieldsValue({
            first_name:response.data.first_name,
            last_name:response.data.last_name,
            email:response.data.email,
            phone:response.data.phone,
          });
          setProfileData(prevData => ({ ...prevData, loading: false, ...response.data }));
        }
      } catch (error) {
        setProfileData((prevData) => ({ ...prevData, loading: false,errors: [] }));
        message.error(error.response?.statusText);
      }
    },[form]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

    const handleInput = (e) =>{
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
        setProfileData((prev) => ({ ...prev, loading: true }));
        setButtonLoading(true); // Set button loading to true when the update starts
        try {
            const response = await apiService.post('auth/update-profile', data);
            if (response.status === 200) {
            // Extract user data from response (assuming response.data contains user info)
            const { id, first_name,last_name, email, phone } = data;

            // Update localStorage with new user info
            localStorage.setItem('user', JSON.stringify({ id, first_name,last_name, email, phone }));

            // Update the header title
            setHeaderTitle(`${first_name} ${last_name}`); // Change the header title from Profile
              message.success(response.data.message);
              setProfileData({...profileData,loading: false, errors : []});
              setButtonLoading(false); // Set button loading to false after success
            }
          } catch (error) {
            setProfileData((prev) => ({ ...prev, loading: false }));
            setButtonLoading(false); // Set button loading to false on error
            if (error.response) {
              if (error.response.status === 422) {
                setProfileData({...profileData,errors : error.response.data.errors});
              }else if (error.response.status === 500) {
                setProfileData({...profileData,errors : []});
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
    <div className="container-fluid">
      <h1 className="h3 mb-4 text-gray-800">Update Profile</h1>
      <Row justify="center">
        <Col xs={24} sm={20} md={18} lg={16}>
        <Spin spinning={profileData.loading}> 
           <Card>
              <Form form={form} layout="vertical">
                  <Form.Item
                    label={<span>First Name <span style={{ color: 'red' }}>*</span></span>}
                    name="first_name"
                    validateStatus={profileData.errors?.first_name ? 'error' : ''}
                    help={profileData.errors?.first_name?.message} // Display only the error message
                  >
                  <Input placeholder="First Name"  
                    name="first_name"
                    value={profileData?.first_name}
                    onChange={handleInput} />
                  </Form.Item>
                  <Form.Item
                    label={<span>Last Name <span style={{ color: 'red' }}>*</span></span>}
                    name="last_name"
                    validateStatus={profileData.errors?.last_name ? 'error' : ''}
                    help={profileData.errors?.last_name?.message} // Display only the error message
                  >
                  <Input placeholder="Last Name"  
                    name="last_name"
                    value={profileData?.last_name}
                    onChange={handleInput} />
                  </Form.Item>
                  <Form.Item
                    label={<span>Email <span style={{ color: 'red' }}>*</span></span>}
                    name="email"
                    validateStatus={profileData.errors?.email ? 'error' : ''}
                    help={profileData.errors?.email?.message} // Display only the error message
                  >
                  <Input placeholder="Email"  
                    name="email"
                    value={profileData?.email}
                    onChange={handleInput} />
                  </Form.Item>
                  <Form.Item
                    label={<span>Phone <span style={{ color: 'red' }}>*</span></span>}
                    name="phone"
                    validateStatus={profileData.errors?.phone ? 'error' : ''}
                    help={profileData.errors?.phone?.message} // Display only the error message
                  >
                  <Input placeholder="Phone"  
                    name="phone"
                    value={profileData?.phone}
                    onChange={handleInput} />
                  </Form.Item>
                    {/* Submit and Reset buttons */}
                    <Form.Item
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        <Button type="primary"  style={{ marginRight: 8 }} onClick={UpdateProfile}
                        loading={buttonLoading}   // Show loading spinner when loading is true
                        > {buttonLoading ? "Processing..." : "Update"}</Button> 
                      </Form.Item>

                  </Form>
            </Card>
          </Spin>
        </Col>
      </Row>
    </div>
  );
}

export default Profile;
