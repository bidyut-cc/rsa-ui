import React, { useCallback, useEffect, useState } from "react";
import {
  Form,
  Button,
  Card,
  Row,
  Col,
  Checkbox,
  Image,
  Spin,
  message,
  Switch,
} from "antd";
import apiService from "../../services/apiService";

function Layout({title}) {
  const [form] = Form.useForm();

  // Dynamically fetched layouts
  const [layouts, setLayouts] = useState([]); 

  const [data, setData] = useState({
    id: "",
    layouts: [],
    show_handicap_accessible_stall: "",
    errors: [],
    loading: false,
  });

  const [buttonLoading, setButtonLoading] = useState(false); // Separate state for button-specific loading

  // Fetch the layouts from the API
  const fetchLayouts = async () => {
    try {
      const response = await apiService.get(`masterSettings/view/?key=layouts`);
      if (response.status === 200) {
        setLayouts(response.data.value || []); // Set fetched layouts
      }
    } catch (error) {
      setLayouts([]); // Default to an empty array on error
      message.error(error.response?.statusText || 'Error fetching layouts');
    }
  };

  const fetchRecords = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true }));
    try {
      const response = await apiService.get(`settings/view/?step=layout`);
      if (response.status === 200) {
        const fetchedLayouts = response.data?.config.layouts || [];

        // Set the checkbox values based on the fetched data
        const selectedLayoutIds = fetchedLayouts.map((layout) => layout.id);

        // Populate the form and state with fetched data
        form.setFieldsValue({
          show_handicap_accessible_stall:
            response.data?.config.show_handicap_accessible_stall,
        });

        setData((prevData) => ({
          ...prevData,
          id: response.data.id,
          layouts: fetchedLayouts, // Store fetched layouts
          show_handicap_accessible_stall:
            response.data?.config.show_handicap_accessible_stall,
          loading: false,
        }));

        // Check the checkboxes for selected layouts
        layouts.forEach((layout) => {
          form.setFieldsValue({
            [`layout_${layout.id}`]: selectedLayoutIds.includes(layout.id),
          });
        });
      }
    } catch (error) {
      setData((prev) => ({ ...prev, loading: false }));
      message.error(error.response?.statusText || "Failed to fetch records");
    }
  }, [form, layouts]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    fetchLayouts(); 
  }, []);

  // Handle select changes
  const handleSelectChange = (value, name) => {
    setData((prevState) => ({ ...prevState, [name]: value }));
  };

  // Handle checkbox change
  const handleCheckboxChange = (checked, layout) => {
    setData((prevState) => {
      let updatedLayouts = [...prevState.layouts];

      if (checked) {
        // Add layout to layouts array if checked
        updatedLayouts.push(layout);
      } else {
        // Remove layout from layouts array if unchecked
        updatedLayouts = updatedLayouts.filter((item) => item.id !== layout.id);
      }

      return { ...prevState, layouts: updatedLayouts };
    });
  };

  const updateData = async () => {
    const request = {
      layouts: data.layouts,
      show_handicap_accessible_stall: data.show_handicap_accessible_stall,
    };
    setData((prev) => ({ ...prev, loading: true }));
    setButtonLoading(true); // Set button loading to true when the update starts
    try {
      const response = await apiService.post(
        `settings/updateLayout/${data.id}`,
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
        message.error("Some Problem Occurred! Please try again later.");
      }
    }
  };

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4 text-gray-800">{title}</h1>
      <Spin spinning={data.loading}>
        <Card>
          <Row justify="center">
            <Col xs={24} sm={20} md={18} lg={12}>
              <Form form={form} layout="vertical">
                <Form.Item
                  label={
                    <span>
                      Select Layouts
                      <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                >
                  <Row gutter={[16, 16]}>
                    {layouts.map((layout) => (
                      <Col xs={24} sm={12} md={6} key={layout.id}>
                        <div>
                          <Image width={50} src={layout.src} preview={false} />
                          <Form.Item
                            name={`layout_${layout.id}`}
                            validateStatus={data.errors?.layouts ? "error" : ""}
                            help={data.errors?.layouts?.message}
                            style={{ marginTop: "10px" }}
                          >
                            <Checkbox
                              checked={data.layouts.some(
                                (l) => l.id === layout.id
                              )} // Automatically check
                              onChange={(e) =>
                                handleCheckboxChange(e.target.checked, layout)
                              }
                            >
                              {layout.name}
                            </Checkbox>
                          </Form.Item>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Form.Item>

                <Form.Item
                  label={
                    <span>
                      Show "Handicap Accessible Stall"
                      <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  validateStatus={
                    data.errors?.show_handicap_accessible_stall ? "error" : ""
                  }
                  help={data.errors?.show_handicap_accessible_stall?.message}
                >
                  <Switch
                    checked={data.show_handicap_accessible_stall === "Yes"}
                    onChange={(checked) =>
                      handleSelectChange(
                        checked ? "Yes" : "No",
                        "show_handicap_accessible_stall"
                      )
                    }
                  />
                </Form.Item>

                <Form.Item style={{ display: "flex", justifyContent: "center" }}>
                  <Button
                    type="primary"
                    style={{ marginRight: 8 }}
                    onClick={updateData}
                    loading={buttonLoading}
                  >
                    {buttonLoading ? "Processing..." : "Update"}
                  </Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
        </Card>
      </Spin>
    </div>
  );
}

export default Layout;
