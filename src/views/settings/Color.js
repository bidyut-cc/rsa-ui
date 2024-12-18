import React, { useCallback, useEffect, useState } from "react";
import { Card, Row, Col, Popover, Button, Typography, message, Spin,Form, Breadcrumb } from "antd";
import { SketchPicker } from "react-color";
import apiService from "../../services/apiService";
import { Link } from "react-router-dom";

function Color({ title }) {
    const [form] = Form.useForm();
  const [data, setData] = useState({
    id: "",
    colors: [],
    errors: [],
    loading: false,
  });

  const [currentBoxIndex, setCurrentBoxIndex] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false); // Separate state for button-specific loading

  const handleColorChange = (color, index) => {
    // Update the specific color in the state
    setData((prevData) => {
      const updatedColors = [...prevData.colors];
      updatedColors[index] = color.hex; // Update the color
      return { ...prevData, colors: updatedColors };
    });
  };

  const updateData = async () => {
    // Capitalize all color codes before submitting
    const updatedColors = data.colors.map((color) => color.toUpperCase());
    const request = {
        colors: updatedColors,
      };
      setData((prev) => ({ ...prev, loading: true }));
      setButtonLoading(true); // Set button loading to true when the update starts
      try {
        const response = await apiService.post(
          `settings/updateColor/${data.id}`,
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



  const fetchRecords = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true }));
    try {
      const response = await apiService.get(`settings/view/?step=color`);
      if (response.status === 200) {
        setData((prevData) => ({
          ...prevData,
          loading: false,
          colors: response.data?.config?.colors || [],
          id: response.data?.id || "",
        }));
      } else {
        throw new Error("Failed to fetch records");
      }
    } catch (error) {
      setData((prev) => ({ ...prev, loading: false }));
      message.error(error.response?.statusText || "Failed to fetch records");
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const colorPickerContent = (index) => (
    <div style={{ padding: "8px" }}>
      <SketchPicker
        color={data.colors[index]}
        onChange={(color) => handleColorChange(color, index)}
      />
      <Button
        type="primary"
        style={{ marginTop: "8px", width: "100%" }}
        onClick={() => setCurrentBoxIndex(null)}
      >
        Close
      </Button>
    </div>
  );

  return (
    <div className="container-fluid">
      <Breadcrumb
      style={{ marginBottom: "16px" }}
      items={[
        {
          title: <Link to="/">Home</Link>,
        },
        {
          title: "Colors",
        },
      ]}
    />
      <h1 className="h3 mb-4 text-gray-800">{title}</h1>
      <Spin spinning={data.loading}>
        <Card>
        <Form form={form} layout="vertical">
        <Form.Item>
          <Row gutter={[16, 16]}>
            {data.colors.map((color, index) => (
              <Col key={index} span={3}>
                <Popover
                  content={colorPickerContent(index)}
                  trigger="click"
                  open={currentBoxIndex === index}
                  onOpenChange={(open) => setCurrentBoxIndex(open ? index : null)}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "50px",
                      backgroundColor: color,
                      borderRadius: "4px",
                      cursor: "pointer",
                      border: "1px solid #ddd",
                    }}
                  ></div>
                </Popover>
                <Typography.Text
                  style={{
                    display: "block",
                    textAlign: "center",
                    marginTop: "8px",
                  }}
                >
                  {color.toUpperCase()}
                </Typography.Text>
              </Col>
            ))}
          </Row>
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
        </Card>
      </Spin>
    </div>
  );
}

export default Color;
