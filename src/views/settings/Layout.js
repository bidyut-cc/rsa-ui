import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Form, Button, Card, Row, Col, Select, Checkbox, Image, Spin, message,Switch } from "antd";
import apiService from "../../services/apiService";

const { Option } = Select;

function Layout() {
  const [form] = Form.useForm();
  
 // Memoize layouts array to ensure stability
 const layouts = useMemo(() => [
  { id: 1, name: "In Corner Left", src: `${process.env.REACT_APP_API_URL}uploads/layouts/in_corner_left.svg` },
  { id: 2, name: "In Corner Right", src: `${process.env.REACT_APP_API_URL}uploads/layouts/in_corner_right.svg` },
  { id: 3, name: "Between Wall Left", src: `${process.env.REACT_APP_API_URL}uploads/layouts/between_wall_left.svg` },
  { id: 4, name: "Between Wall Right", src: `${process.env.REACT_APP_API_URL}uploads/layouts/between_wall_right.svg` },
  { id: 5, name: "Alcove Corner Left", src: `${process.env.REACT_APP_API_URL}uploads/layouts/alcove_corner_left.svg` },
  { id: 6, name: "Alcove Corner Right", src: `${process.env.REACT_APP_API_URL}uploads/layouts/alcove_corner_right.svg` },
  { id: 7, name: "Alcove Between Wall Left", src: `${process.env.REACT_APP_API_URL}uploads/layouts/alcove_beteen_wall_left.svg` },
  { id: 8, name: "Alcove Between Wall Right", src: `${process.env.REACT_APP_API_URL}uploads/layouts/alcove_beteen_wall_right.svg` }
], []);

  const [data, setData] = useState({
    id: "",
    layouts: [],
    is_include_handicap_accessible_stall: "",
    errors: [],
    loading: false,
  });

  const fetchRecords = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true }));
    try {
      const response = await apiService.get(`settings/view/?step=layout`);
      if (response.status === 200) {
        const fetchedLayouts = response.data?.config.layouts || [];
        
        // Set the checkbox values based on the fetched data
        const selectedLayoutIds = fetchedLayouts.map(layout => layout.id);
        
        // Populate the form and state with fetched data
        form.setFieldsValue({
          is_include_handicap_accessible_stall: response.data?.config.is_include_handicap_accessible_stall
        });

        setData((prevData) => ({
          ...prevData,
          id: response.data.id,
          layouts: fetchedLayouts,  // Store fetched layouts
          is_include_handicap_accessible_stall: response.data?.config.is_include_handicap_accessible_stall,
          loading: false,
        }));

        // Check the checkboxes for selected layouts
        layouts.forEach(layout => {
          form.setFieldsValue({
            [`layout_${layout.id}`]: selectedLayoutIds.includes(layout.id)
          });
        });
      }
    } catch (error) {
      setData((prev) => ({ ...prev, loading: false }));
      message.error(error.response?.statusText || "Failed to fetch records");
    }
  },[form,layouts]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

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
        updatedLayouts = updatedLayouts.filter(item => item.id !== layout.id);
      }

      return { ...prevState, layouts: updatedLayouts };
    });
  };

  const updateData = async () => {
    const request = {
      layouts: data.layouts,
      is_include_handicap_accessible_stall: data.is_include_handicap_accessible_stall,
    };
    setData((prev) => ({ ...prev, loading: true }));
    try {
      const response = await apiService.post(`settings/updateLayout/${data.id}`, request);
      if (response.status === 200) {
        message.success(response.data.message);
        setData({ ...data, loading: false, errors: [] });
      }
    } catch (error) {
      setData((prev) => ({ ...prev, loading: false }));
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
      <h1 className="h3 mb-4 text-gray-800">Layout Setting</h1>
      <Spin spinning={data.loading}>
        <Row justify="center">
          <Col xs={24} sm={20} md={18} lg={15}>
            <Card>
            <Form form={form} layout="vertical">
    <Form.Item
      label={
        <span>
          Select Maximum Layouts
          <span style={{ color: "red" }}>*</span>
        </span>
      }
    >
      <Row gutter={[16, 16]}>
        {layouts.map((layout) => (
          <Col xs={24} sm={12} md={6} key={layout.id}>
            <div> {/* Wrapper div to ensure single child */}
              <Image width={50} src={layout.src} preview={false} />
              <Form.Item
                name={`layout_${layout.id}`}
                validateStatus={data.errors?.layouts ? "error" : ""}
                help={data.errors?.layouts?.message}
                style={{ marginTop: "10px" }} // Adjust margin here if needed
              >
                <Checkbox
                  checked={data.layouts.some((l) => l.id === layout.id)} // Automatically check
                  onChange={(e) => handleCheckboxChange(e.target.checked, layout)}
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
          Show Handicap Accessible Stall
          <span style={{ color: "red" }}>*</span>
        </span>
      }
      name="is_include_handicap_accessible_stall"
      validateStatus={data.errors?.is_include_handicap_accessible_stall ? "error" : ""}
      help={data.errors?.is_include_handicap_accessible_stall?.message}
    >
      {/* <Select
        placeholder="Is Include Handicap Accessible Stall"
        onChange={(value) => handleSelectChange(value, "is_include_handicap_accessible_stall")}
        value={data.is_include_handicap_accessible_stall}
      >
        <Option value="No">No</Option>
        <Option value="Yes">Yes</Option>
      </Select> */}
      <Switch
    checked={data.is_include_handicap_accessible_stall === "Yes"} // Set the switch state based on 'Yes' or 'No'
    onChange={(checked) =>
      handleSelectChange(checked ? "Yes" : "No", "is_include_handicap_accessible_stall")
    } // Handle switch change
  />
    </Form.Item>

    <Form.Item style={{ display: "flex", justifyContent: "center" }}>
      <Button type="primary" style={{ marginRight: 8 }} onClick={updateData}
       loading={data.loading}  // Show loading spinner when loading is true
      >
        Update
      </Button>
    </Form.Item>
  </Form>

            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
}

export default Layout;
