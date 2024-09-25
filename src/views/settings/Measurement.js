import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  Input,
} from "antd";
import apiService from "../../services/apiService";

const { Option } = Select;

function Measurement() {
  const [form] = Form.useForm();
  const max_room_no = Array.from({ length: 4 }, (_, i) => i + 1);

  // Memoize swings array to ensure stability
  const swings = useMemo(
    () => [
      { id: 1, name: "Left In" },
      { id: 2, name: "Left Out" },
      { id: 3, name: "Right In" },
      { id: 4, name: "Right Out" },
    ],
    []
  );

  const [data, setData] = useState({
    id: "",
    swings: [],
    ada_stall_min_width: "",
    ada_stall_max_width: "",
    standard_stall_min_width: "",
    standard_stall_max_width: "",
    maximum_room_no: "",
    errors: [],
    loading: false,
  });
  const [buttonLoading, setButtonLoading] = useState(false); // Separate state for button-specific loading

  const fetchRecords = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true }));
    try {
      const response = await apiService.get(`settings/view/?step=measurement`);
      if (response.status === 200) {
        const fetchedSwings = response.data?.config.swings || [];

        // Set the checkbox values based on the fetched data
        const selectedSwingIds = fetchedSwings.map((swing) => swing.id);

        // Populate the form and state with fetched data
        form.setFieldsValue({
          ada_stall_min_width: response.data?.config.ada_stall_min_width,
          ada_stall_max_width: response.data?.config.ada_stall_max_width,
          standard_stall_min_width:
            response.data?.config.standard_stall_min_width,
          standard_stall_max_width:
            response.data?.config.standard_stall_max_width,
          maximum_room_no: response.data?.config.maximum_room_no,
        });

        setData((prevData) => ({
          ...prevData,
          id: response.data.id,
          swings: fetchedSwings, // Store fetched layouts
          ada_stall_min_width: response.data?.config.ada_stall_min_width,
          ada_stall_max_width: response.data?.config.ada_stall_max_width,
          standard_stall_min_width:
            response.data?.config.standard_stall_min_width,
          standard_stall_max_width:
            response.data?.config.standard_stall_max_width,
          maximum_room_no: response.data?.config.maximum_room_no,
          loading: false,
        }));

        // Check the checkboxes for selected layouts
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
  }, [fetchRecords]);

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
      <h1 className="h3 mb-4 text-gray-800">Measurement Setting</h1>
      <Spin spinning={data.loading}>
        <Row justify="center">
          <Col xs={24} sm={20} md={18} lg={15}>
            <Card>
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
                          {/* Wrapper div to ensure single child */}
                          <Form.Item
                            name={`swing_${swing.id}`}
                            validateStatus={data.errors?.swings ? "error" : ""}
                            help={data.errors?.swings?.message}
                            style={{ marginTop: "10px" }} // Adjust margin here if needed
                          >
                            <Checkbox
                              checked={data.swings.some(
                                (l) => l.id === swing.id
                              )} // Automatically check
                              onChange={(e) =>
                                handleCheckboxChange(e.target.checked, swing)
                              }
                            >
                              {swing.name}
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
                      ADA Stall Min Width
                      <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  validateStatus={
                    data.errors?.ada_stall_min_width ? "error" : ""
                  }
                  help={data.errors?.ada_stall_min_width?.message} // Display only the error message
                >
                  <Input
                    placeholder="ADA Stall Min Width"
                    name="ada_stall_min_width"
                    value={data?.ada_stall_min_width}
                    onChange={handleInput}
                  />
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      ADA Stall Max Width
                      <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  validateStatus={
                    data.errors?.ada_stall_max_width ? "error" : ""
                  }
                  help={data.errors?.ada_stall_max_width?.message} // Display only the error message
                >
                  <Input
                    placeholder="ADA Stall Max Width"
                    name="ada_stall_max_width"
                    value={data?.ada_stall_max_width}
                    onChange={handleInput}
                  />
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      Standard Stall Min Width
                      <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  validateStatus={
                    data.errors?.standard_stall_min_width ? "error" : ""
                  }
                  help={data.errors?.standard_stall_min_width?.message} // Display only the error message
                >
                  <Input
                    placeholder="Standard Stall Min Width"
                    name="standard_stall_min_width"
                    value={data?.standard_stall_min_width}
                    onChange={handleInput}
                  />
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      Standard Stall Max Width
                      <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  validateStatus={
                    data.errors?.standard_stall_max_width ? "error" : ""
                  }
                  help={data.errors?.standard_stall_max_width?.message} // Display only the error message
                >
                  <Input
                    placeholder="Standard Stall Max Width"
                    name="standard_stall_max_width"
                    value={data?.standard_stall_max_width}
                    onChange={handleInput}
                  />
                </Form.Item>
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
                    {max_room_no.map((room) => (
                      <Option key={room} value={room}>
                        {room}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

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
              </Form>
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
}

export default Measurement;
