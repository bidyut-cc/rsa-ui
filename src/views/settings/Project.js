import React, { useCallback, useEffect, useState } from "react";
import { Form, Button, Card, Row, Col, message, Select, Spin,Switch } from "antd";
import apiService from "../../services/apiService";
const { Option } = Select;
function Project() {
  const [form] = Form.useForm();
  const max_stall_no = Array.from({ length: 10 }, (_, i) => i + 1);
  const max_urinal_no = Array.from({ length: 10 }, (_, i) => i + 1);
  const [data, setData] = useState({
    id: "",
    maximum_number_of_stalls: "",
    maximum_number_of_urinal_screens: "",
    interested_for_material_installation_quote: "",
    errors: [],
    loading: false,
  });
  
  const [buttonLoading, setButtonLoading] = useState(false); // Separate state for button-specific loading

  const fetchRecords = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true }));
    try {
      const response = await apiService.get(`settings/view/?step=project`);
      if (response.status === 200) {
        form.setFieldsValue({
          maximum_number_of_stalls: response.data?.config.maximum_number_of_stalls,
          maximum_number_of_urinal_screens: response.data?.config.maximum_number_of_urinal_screens,
          interested_for_material_installation_quote:
            response.data?.config.interested_for_material_installation_quote,
        });
        setData((prevData) => ({
          ...prevData,
          id: response.data.id,
          loading: false,
          ...response.data.config,
        }));
      }
    } catch (error) {
      message.error(error.response?.statusText);
      setData((prevData) => ({ ...prevData, loading: false,errors: [] }));
    }
  },[form]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);
  // Handle select changes
  const handleSelectChange = (value, name) => {
    setData((prevState) => ({ ...prevState, [name]: value }));
  };
  const updateData = async () => {
    const request = {
      maximum_number_of_stalls: data.maximum_number_of_stalls,
      maximum_number_of_urinal_screens: data.maximum_number_of_urinal_screens,
      interested_for_material_installation_quote:
        data.interested_for_material_installation_quote,
    };
    setData((prev) => ({ ...prev, loading: true }));
    setButtonLoading(true); // Set button loading to true when the update starts
    try {
      const response = await apiService.post(
        `settings/updateProject/${data.id}`,
        request
      );
      if (response.status === 200) {
        message.success(response.data.message);
        setData({ ...data, loading: false, errors: [] });
        setButtonLoading(false); // Set button loading to false after success
      }
    } catch (error) {
      setData((prev) => ({ ...prev, loading: false }));
      setButtonLoading(false); // Set button loading to false on error
      if (error.response) {
        if (error.response.status === 422) {
          setData({ ...data, errors: error.response.data.errors });
        } else if (error.response.status === 500) {
          setData({ ...data, errors: [] });
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
      <h1 className="h3 mb-4 text-gray-800">Project Setting</h1>
      <Row justify="center">
        <Col xs={24} sm={20} md={18} lg={16}>
        <Spin spinning={data.loading}>
          <Card>
            <Form form={form} layout="vertical">
              <Form.Item
                label={
                  <span>
                     Maximum Number Of Stalls <span style={{ color: "red" }}>*</span>
                  </span>
                }
                validateStatus={
                  data.errors?.maximum_number_of_stalls ? "error" : ""
                }
                help={data.errors?.maximum_number_of_stalls?.message} // Display only the error message
              >
                <Select
                  placeholder="Maximum Number Of Stalls"
                  onChange={(value) =>
                    handleSelectChange(value, "maximum_number_of_stalls")
                  } // Handle select change
                  value={data.maximum_number_of_stalls}
                >
                  {max_stall_no.map((stall) => (
                    <Option key={stall} value={stall}>
                      {stall}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label={
                  <span>
                    Maximum Number Of Urinal screens
                    <span style={{ color: "red" }}>*</span>
                  </span>
                }
                validateStatus={
                  data.errors?.maximum_number_of_urinal_screens ? "error" : ""
                }
                help={data.errors?.maximum_number_of_urinal_screens?.message} // Display only the error message
              >
                <Select
                  placeholder="Maximum Number Of Urinal screens"
                  onChange={(value) =>
                    handleSelectChange(value, "maximum_number_of_urinal_screens")
                  } // Handle select change
                  value={data.maximum_number_of_urinal_screens}
                >
                  {max_urinal_no.map((stall) => (
                    <Option key={stall} value={stall}>
                      {stall}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label={
                  <span>
                    Show "Interested For Material Installation Quote"
                    <span style={{ color: "red" }}>*</span>
                  </span>
                }
                validateStatus={
                  data.errors?.interested_for_material_installation_quote
                    ? "error"
                    : ""
                }
                help={
                  data.errors?.interested_for_material_installation_quote
                    ?.message
                } // Display only the error message
              >
                <Switch
                    checked={data.interested_for_material_installation_quote === "Yes"} // Set the switch state based on 'Yes' or 'No'
                    onChange={(checked) =>
                      handleSelectChange(checked ? "Yes" : "No", "interested_for_material_installation_quote")
                    } // Handle switch change
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
                  onClick={updateData}
                  loading={buttonLoading}  // Show loading spinner when loading is true 
                >
                   {buttonLoading ? "Processing..." : "Update"}
                </Button>
              </Form.Item>
            </Form>
          </Card>
          </Spin>
        </Col>
      </Row>
    </div>
  );
}

export default Project;
