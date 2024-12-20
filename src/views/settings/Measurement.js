import React, { useCallback, useEffect, useState } from "react";
import {
  Form,
  Button,
  Card,
  Row,
  Col,
  Select,
  Checkbox,
  message,
  Spin,
  Breadcrumb,
} from "antd";
import { Link } from "react-router-dom";
import apiService from "../../services/apiService";

const { Option } = Select;

function Measurement({title}) {
  const [form] = Form.useForm();
    // Dynamically fetched layouts
    const [swings, setSwings] = useState([]); 
    const [maxRoom, setMaxRoom] = useState([1]);



  const [data, setData] = useState({
    id: "",
    swings: [],
    ada_stall_min_width: "",
    ada_stall_max_width: "",
    standard_stall_min_width: "",
    standard_stall_max_width: "",
    ada_stall_min_depth: "",
    ada_stall_max_depth: "",
    standard_stall_min_depth:"",
    standard_stall_max_depth:"",
    ada_stall_min_door_opening:"",
    ada_stall_max_door_opening:"",
    standard_stall_min_door_opening:"",
    standard_stall_max_door_opening:"",
    maximum_room_no: "",
    errors: [],
    loading: false,
  });
  const [buttonLoading, setButtonLoading] = useState(false); // Separate state for button-specific loading

    // Fetch the layouts from the API
    const fetchSwings = async () => {
      try {
        const response = await apiService.get(`masterSettings/view/?key=swings`);
        if (response.status === 200) {
          setSwings(response.data.value || []); // Set fetched layouts
        }
      } catch (error) {
        setSwings([]); // Default to an empty array on error
        message.error(error.response?.statusText || 'Error fetching layouts');
      }
    };

    const fetchMaxRoom = async () => {
      try {
        const response = await apiService.get(`masterSettings/view/?key=maximum_room_no`);
        if (response.status === 200) {
          const maxValue = response.data.value;
          setMaxRoom(Array.from({ length: maxValue }, (_, i) => i + 1));
        }
      } catch (error) {
        setMaxRoom(Array.from({ length: 1 }, (_, i) => i + 1)); 
        message.error(error.response?.statusText || 'Error fetching stall');
      }
    };

    const fetchRecords = useCallback(async () => {
      setData((prev) => ({ ...prev, loading: true }));
      try {
        const response = await apiService.get(`settings/view/?step=measurement`);
        if (response.status === 200) {
          const fetchedSwings = response.data?.config.swings || [];
          const selectedSwingIds = fetchedSwings.map((swing) => swing.id);
  
          form.setFieldsValue({
            ada_stall_min_width: response.data?.config.ada_stall_min_width,
            ada_stall_max_width: response.data?.config.ada_stall_max_width,
            standard_stall_min_width: response.data?.config.standard_stall_min_width,
            standard_stall_max_width: response.data?.config.standard_stall_max_width,
            ada_stall_min_depth:response.data?.config.ada_stall_min_depth,
            ada_stall_max_depth:response.data?.config.ada_stall_max_depth,
            standard_stall_min_depth:response.data?.config.standard_stall_min_depth,
            standard_stall_max_depth:response.data?.config.standard_stall_max_depth,
            ada_stall_min_door_opening:response.data?.config.ada_stall_min_door_opening,
            ada_stall_max_door_opening:response.data?.config.ada_stall_max_door_opening,
            standard_stall_min_door_opening:response.data?.config.standard_stall_min_door_opening,
            standard_stall_max_door_opening:response.data?.config.standard_stall_max_door_opening,
            maximum_room_no: response.data?.config.maximum_room_no,
          });
  
          setData((prevData) => ({
            ...prevData,
            id: response.data.id,
            swings: fetchedSwings, // Store fetched swings
            ada_stall_min_width: response.data?.config.ada_stall_min_width,
            ada_stall_max_width: response.data?.config.ada_stall_max_width,
            standard_stall_min_width: response.data?.config.standard_stall_min_width,
            standard_stall_max_width: response.data?.config.standard_stall_max_width,
            ada_stall_min_depth:response.data?.config.ada_stall_min_depth,
            ada_stall_max_depth:response.data?.config.ada_stall_max_depth,
            standard_stall_min_depth:response.data?.config.standard_stall_min_depth,
            standard_stall_max_depth:response.data?.config.standard_stall_max_depth,
            ada_stall_min_door_opening:response.data?.config.ada_stall_min_door_opening,
            ada_stall_max_door_opening:response.data?.config.ada_stall_max_door_opening,
            standard_stall_min_door_opening:response.data?.config.standard_stall_min_door_opening,
            standard_stall_max_door_opening:response.data?.config.standard_stall_max_door_opening,
            maximum_room_no: response.data?.config.maximum_room_no,
            loading: false,
          }));
  
          swings.forEach((swing) => {
            form.setFieldsValue({
              [`swing_${swing.id}`]: selectedSwingIds.includes(swing.id),
            });
          });
        }
      } catch (error) {
        setData((prev) => ({ ...prev, loading: false }));
        message.error(error.response?.statusText || "Failed to fetch records");
      }
    }, [form, swings]);

  useEffect(() => {
    fetchRecords();
    fetchMaxRoom();
  }, [fetchRecords]);

  useEffect(() => {
    fetchSwings(); 
  }, []);

  const handleInput = (e) => {
    e.persist();
    const { name, value } = e.target;
    setData((prevState) => ({ ...prevState, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (value, name) => {
    setData((prevState) => ({ ...prevState, [name]: value }));
  };

  // Handle checkbox change
  const handleCheckboxChange = (checked, swing) => {
    setData((prevState) => {
      let updatedSwings = [...prevState.swings];

      if (checked) {
        // Add layout to layouts array if checked
        updatedSwings.push(swing);
      } else {
        // Remove layout from layouts array if unchecked
        updatedSwings = updatedSwings.filter((item) => item.id !== swing.id);
      }

      return { ...prevState, swings: updatedSwings };
    });
  };

  const updateData = async () => {
    const request = {
      swings: data.swings,
      ada_stall_min_width: data.ada_stall_min_width,
      ada_stall_max_width: data.ada_stall_max_width,
      standard_stall_min_width: data.standard_stall_min_width,
      standard_stall_max_width: data.standard_stall_max_width,
      ada_stall_min_depth: data.ada_stall_min_depth,
      ada_stall_max_depth: data.ada_stall_max_depth,
      standard_stall_min_depth: data.standard_stall_min_depth,
      standard_stall_max_depth: data.standard_stall_max_depth,
      ada_stall_min_door_opening:data.ada_stall_min_door_opening,
      ada_stall_max_door_opening:data.ada_stall_max_door_opening,
      standard_stall_min_door_opening:data.standard_stall_min_door_opening,
      standard_stall_max_door_opening:data.standard_stall_max_door_opening,
      maximum_room_no: data.maximum_room_no,
    };
    setData((prev) => ({ ...prev, loading: true }));
    setButtonLoading(true); // Set button loading to true when the update starts
    try {
      const response = await apiService.post(
        `settings/updateMeasurement/${data.id}`,
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
      <Breadcrumb
      style={{ marginBottom: "16px" }}
      items={[
        {
          title: <Link to="/dashboard">Home</Link>,
        },
        {
          title: "Measurements",
        },
      ]}
    />
      <h1 className="h3 mb-4 text-gray-800">{title}</h1>
      <Spin spinning={data.loading}>
      <Card>
  <Row justify="center">
    <Col xs={24} sm={20} md={18} lg={12}>
      <Form form={form} layout="vertical">
        <Form.Item
          label={
            <span>
              Select Door Swing Options
              <span style={{ color: "red" }}>*</span>
            </span>
          }
        >
          <Row gutter={[16, 16]}>
            {swings.map((swing) => (
              <Col xs={24} sm={12} md={6} key={swing.id}>
                <div>
                  <Form.Item
                    name={`swing_${swing.id}`}
                    validateStatus={data.errors?.swings ? "error" : ""}
                    help={data.errors?.swings?.message}
                    style={{ marginTop: "10px" }}
                  >
                    <Checkbox
                      checked={data.swings.some((l) => l.id === swing.id)}
                      onChange={(e) => handleCheckboxChange(e.target.checked, swing)}
                    >
                      {swing.name}
                    </Checkbox>
                  </Form.Item>
                </div>
              </Col>
            ))}
          </Row>
        </Form.Item>

        {/* <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span>
                  ADA Stall Min Width
                  <span style={{ color: "red" }}>*</span>
                </span>
              }
              validateStatus={data.errors?.ada_stall_min_width ? "error" : ""}
              help={data.errors?.ada_stall_min_width?.message}
            >
              <Input
                placeholder="ADA Stall Min Width"
                name="ada_stall_min_width"
                value={data?.ada_stall_min_width}
                onChange={handleInput}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span>
                  ADA Stall Max Width
                  <span style={{ color: "red" }}>*</span>
                </span>
              }
              validateStatus={data.errors?.ada_stall_max_width ? "error" : ""}
              help={data.errors?.ada_stall_max_width?.message}
            >
              <Input
                placeholder="ADA Stall Max Width"
                name="ada_stall_max_width"
                value={data?.ada_stall_max_width}
                onChange={handleInput}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span>
                  Standard Stall Min Width
                  <span style={{ color: "red" }}>*</span>
                </span>
              }
              validateStatus={data.errors?.standard_stall_min_width ? "error" : ""}
              help={data.errors?.standard_stall_min_width?.message}
            >
              <Input
                placeholder="Standard Stall Min Width"
                name="standard_stall_min_width"
                value={data?.standard_stall_min_width}
                onChange={handleInput}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span>
                  Standard Stall Max Width
                  <span style={{ color: "red" }}>*</span>
                </span>
              }
              validateStatus={data.errors?.standard_stall_max_width ? "error" : ""}
              help={data.errors?.standard_stall_max_width?.message}
            >
              <Input
                placeholder="Standard Stall Max Width"
                name="standard_stall_max_width"
                value={data?.standard_stall_max_width}
                onChange={handleInput}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span>
                  ADA Stall Min Depth
                  <span style={{ color: "red" }}>*</span>
                </span>
              }
              validateStatus={data.errors?.ada_stall_min_depth ? "error" : ""}
              help={data.errors?.ada_stall_min_depth?.message}
            >
              <Input
                placeholder="ADA Stall Min Depth"
                name="ada_stall_min_depth"
                value={data?.ada_stall_min_depth}
                onChange={handleInput}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span>
                  ADA Stall Max Depth
                  <span style={{ color: "red" }}>*</span>
                </span>
              }
              validateStatus={data.errors?.ada_stall_max_depth ? "error" : ""}
              help={data.errors?.ada_stall_max_depth?.message}
            >
              <Input
                placeholder="ADA Stall Max Depth"
                name="ada_stall_max_depth"
                value={data?.ada_stall_max_depth}
                onChange={handleInput}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span>
                  Standard Stall Min Depth
                  <span style={{ color: "red" }}>*</span>
                </span>
              }
              validateStatus={data.errors?.standard_stall_min_depth ? "error" : ""}
              help={data.errors?.standard_stall_min_depth?.message}
            >
              <Input
                placeholder="Standard Stall Min Depth"
                name="standard_stall_min_depth"
                value={data?.standard_stall_min_depth}
                onChange={handleInput}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span>
                  Standard Stall Max Depth
                  <span style={{ color: "red" }}>*</span>
                </span>
              }
              validateStatus={data.errors?.standard_stall_max_depth ? "error" : ""}
              help={data.errors?.standard_stall_max_depth?.message}
            >
              <Input
                placeholder="Standard Stall Max Depth"
                name="standard_stall_max_depth"
                value={data?.standard_stall_max_depth}
                onChange={handleInput}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span>
                  ADA Stall Min Door Opening
                  <span style={{ color: "red" }}>*</span>
                </span>
              }
              validateStatus={data.errors?.ada_stall_min_door_opening ? "error" : ""}
              help={data.errors?.ada_stall_min_door_opening?.message}
            >
              <Input
                placeholder="ADA Stall Min Door Opening"
                name="ada_stall_min_door_opening"
                value={data?.ada_stall_min_door_opening}
                onChange={handleInput}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span>
                  ADA Stall Max Door Opening
                  <span style={{ color: "red" }}>*</span>
                </span>
              }
              validateStatus={data.errors?.ada_stall_max_door_opening ? "error" : ""}
              help={data.errors?.ada_stall_max_door_opening?.message}
            >
              <Input
                placeholder="ADA Stall Max Door Opening"
                name="ada_stall_max_door_opening"
                value={data?.ada_stall_max_door_opening}
                onChange={handleInput}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span>
                  Standard Stall Min Door Opening
                  <span style={{ color: "red" }}>*</span>
                </span>
              }
              validateStatus={data.errors?.standard_stall_min_door_opening ? "error" : ""}
              help={data.errors?.standard_stall_min_door_opening?.message}
            >
              <Input
                placeholder="Standard Stall Min Door Opening"
                name="standard_stall_min_door_opening"
                value={data?.standard_stall_min_door_opening}
                onChange={handleInput}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span>
                  Standard Stall Max Door Opening
                  <span style={{ color: "red" }}>*</span>
                </span>
              }
              validateStatus={data.errors?.standard_stall_max_door_opening ? "error" : ""}
              help={data.errors?.standard_stall_max_door_opening?.message}
            >
              <Input
                placeholder="Standard Stall Max Door Opening"
                name="standard_stall_max_door_opening"
                value={data?.standard_stall_max_door_opening}
                onChange={handleInput}
              />
            </Form.Item>
          </Col>
        </Row> */}
         <Row gutter={[16, 16]}>
          <Col xs={24} sm={24}>
           <Form.Item
                  label={
                    <span>
                      Maximum Room No
                      <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  validateStatus={data.errors?.maximum_room_no ? "error" : ""}
                  help={data.errors?.maximum_room_no?.message}
                >
                  <Select
                    placeholder="Maximum Room No"
                    onChange={(value) =>
                      handleSelectChange(value, "maximum_room_no")
                    } // Handle select change
                    value={data.maximum_room_no}
                  >
                    {maxRoom.map((room) => (
                      <Option key={room} value={room}>
                        {room}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
          </Col>
          </Row>
          <Row gutter={[16, 16]}>
          <Col xs={24} sm={24}>

                <Form.Item
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <Button
                    type="primary"
                    style={{ marginRight: 8 }}
                    onClick={updateData}
                    loading={buttonLoading} // Show loading spinner when loading is true
                  >
                    {buttonLoading ? "Processing..." : "Update"}
                  </Button>
                </Form.Item>
          </Col>
          </Row>
      </Form>
    </Col>
  </Row>
</Card>

      </Spin>
    </div>
  );
}

export default Measurement;
