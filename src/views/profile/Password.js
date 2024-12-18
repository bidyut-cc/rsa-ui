import React, { useState } from "react";
import apiService from "../../services/apiService";
import {
  Form,
  Input as AntInput,
  Button,
  Card,
  Row,
  Col,
  message,
  Spin,
  Breadcrumb
} from "antd";
import { Link  } from "react-router-dom";
function Password({title}) {
  const [form] = Form.useForm();
  const [passwordData, setPasswordData] = useState({
    new_password: "",
    old_password: "",
    confirm_new_password: "",
    errors: [],
    loading: false,
  });
  const [buttonLoading, setButtonLoading] = useState(false); // Separate state for button-specific loading
  const handleInput = (e) => {
    e.persist();
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };
  const UpdatePassword = async () => {
    const data = {
      new_password: passwordData.new_password,
      old_password: passwordData.old_password,
      confirm_new_password: passwordData.confirm_new_password,
    };
    setPasswordData((prev) => ({ ...prev, loading: true }));
    setButtonLoading(true); // Set button loading to true when the update starts
    try {
      const response = await apiService.post("auth/change-password", data);
      if (response.status === 200) {
        message.success(response.data.message);
        setPasswordData({
          new_password: "",
          old_password: "",
          confirm_new_password: "",
          errors: [],
          loading: false,
        });
        setButtonLoading(false); // Set button loading to false after success
        form.resetFields();
      }
    } catch (error) {
      setPasswordData((prev) => ({ ...prev, loading: false }));
      setButtonLoading(false); // Set button loading to false on error
      if (error.response) {
        if (error.response.status === 422) {
          setPasswordData({
            ...passwordData,
            errors: error.response.data.errors,
          });
        } else if (error.response.status === 500) {
          setPasswordData({ ...passwordData, errors: [] });
          message.error(error.response.data.message);
        } else {
          message.error("Something went wrong. Please try again later.");
        }
      } else {
        message.error("Some Problem Occured! Please try again later.");
      }
    }
  };

  return (
    <div className="container-fluid">
        <Breadcrumb style={{ marginBottom: "16px" }}>
         <Breadcrumb.Item><Link to="/">Home</Link></Breadcrumb.Item>
        <Breadcrumb.Item>Change Password</Breadcrumb.Item>
      </Breadcrumb>
      <h1 className="h3 mb-4 text-gray-800">{title}</h1>
      <Card>
        <Row justify="center">
          <Col xs={24} sm={20} md={18} lg={12}>
            <Spin spinning={passwordData.loading}>
              <Form form={form} layout="vertical">
                <Form.Item
                  label={
                    <span>
                      Old Password <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  name="old_password"
                  validateStatus={
                    passwordData.errors?.old_password ? "error" : ""
                  }
                  help={passwordData.errors?.old_password?.message} // Display only the error message
                >
                  <AntInput.Password
                    placeholder="Old Password"
                    name="old_password"
                    value={passwordData?.old_password}
                    onChange={handleInput}
                  />
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      New Password <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  name="new_password"
                  validateStatus={
                    passwordData.errors?.new_password ? "error" : ""
                  }
                  help={passwordData.errors?.new_password?.message} // Display only the error message
                >
                  <AntInput.Password
                    placeholder="New Password"
                    name="new_password"
                    value={passwordData?.new_password}
                    onChange={handleInput}
                  />
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      Confirm Password <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  name="confirm_new_password"
                  validateStatus={
                    passwordData.errors?.confirm_new_password ? "error" : ""
                  }
                  help={passwordData.errors?.confirm_new_password?.message} // Display only the error message
                >
                  <AntInput.Password
                    placeholder="Confirm Password"
                    name="confirm_new_password"
                    value={passwordData?.confirm_new_password}
                    onChange={handleInput}
                  />
                </Form.Item>
                {/* Submit and Reset buttons */}
                <Form.Item
                  style={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Button
                    type="primary"
                    style={{ marginRight: 8 }}
                    onClick={UpdatePassword}
                    loading={buttonLoading} // Show loading spinner when loading is true
                  >
                    {buttonLoading ? "Processing..." : "Update"}
                  </Button>
                </Form.Item>
              </Form>
            </Spin>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default Password;
