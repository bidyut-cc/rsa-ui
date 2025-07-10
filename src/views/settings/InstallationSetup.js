import React, { useCallback, useEffect, useState } from "react";
import {
  Form,
  Button,
  Card,
  Row,
  Col,
  message,
  Spin,
  Breadcrumb,
  Input,
} from "antd";
import { Link } from "react-router-dom";
import apiService from "../../services/apiService";

function InstallationSetup({ title }) {
  const [form] = Form.useForm();

  const [data, setData] = useState({
    id: "",
    material_types: [],
    errors: [],
    loading: false,
  });

  const [buttonLoading, setButtonLoading] = useState(false);

  const fetchRecords = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true }));
    try {
      const response = await apiService.get(
        `settings/view/?step=installation_setup`
      );
      if (response.status === 200) {
        const config = response.data?.config;
        form.setFieldsValue(config);

        setData((prevData) => ({
          ...prevData,
          id: response.data.id,
          material_types: config.material_types || [],
          loading: false,
        }));
      }
    } catch (error) {
      setData((prev) => ({ ...prev, loading: false }));
      message.error(error.response?.statusText || "Failed to fetch records");
    }
  }, [form]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const updateData = async (values) => {
    const updatedMaterialTypes = values.material_types.map((material, index) => ({
      id: data.material_types[index]?.id,
      price: material.price,
      name: data.material_types[index]?.name ?? null,
    }));

    const request = {
      material_types: updatedMaterialTypes,
      charge_per_stalls: values.charge_per_stalls,
      charge_per_screens: values.charge_per_screens,
      charge_per_mile: values.charge_per_mile,
      max_distance_limit: values.max_distance_limit,
      charge_per_hotel_night: values.charge_per_hotel_night,
      charge_per_diem: values.charge_per_diem,
    };

    setData((prev) => ({ ...prev, loading: true }));
    setButtonLoading(true);

    try {
      const response = await apiService.post(
        `settings/updateInstallationSetup/${data.id}`,
        request
      );
      if (response.status === 200) {
        message.success(response.data.message);
        setData((prev) => ({ ...prev, loading: false, errors: [] }));
      }
    } catch (error) {
      setData((prev) => ({ ...prev, loading: false }));
      if (error.response?.status === 422) {
        setData((prev) => ({ ...prev, errors: error.response.data.errors }));
      } else {
        message.error("Something went wrong. Please try again.");
      }
    }

    setButtonLoading(false);
  };

  const priceFields = [
    "charge_per_mile",
    "charge_per_stalls",
    "charge_per_screens",
    "charge_per_hotel_night",
    "charge_per_diem",
  ];

  const formFields = [
    { name: "charge_per_mile", label: "Charge Per Mile" },
    { name: "charge_per_stalls", label: "Charge Per Stall" },
    { name: "charge_per_screens", label: "Charge Per Screen" },
    { name: "charge_per_hotel_night", label: "Charge Per Hotel Night" },
    { name: "charge_per_diem", label: "Charge Per Diem" },
    { name: "max_distance_limit", label: "Max Distance Limit (Miles)" },
  ];

  return (
    <div className="container-fluid">
      <Breadcrumb
        style={{ marginBottom: "16px" }}
        items={[
          {
            title: <Link to="/dashboard">Home</Link>,
          },
          {
            title: "Installation Setup",
          },
        ]}
      />
      <h1 className="h3 mb-4 text-gray-800">{title}</h1>
      <Spin spinning={data.loading}>
        <Card>
          <Row justify="center">
            <Col xs={24} sm={20} md={18} lg={12}>
              <Form
                form={form}
                layout="vertical"
                onFinish={updateData}
                initialValues={{
                  charge_per_stalls: "",
                  charge_per_screens: "",
                  charge_per_mile: "",
                  max_distance_limit: "",
                  charge_per_hotel_night: "",
                  charge_per_diem: "",
                  material_types: [],
                }}
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} style={{ display: "none" }}>
                    <Form.Item label={
                        <span>
                        Material Types Prices <span style={{ color: "red" }}>*</span>
                        </span>
                    }>
                      <Row gutter={[16, 16]}>
                        {data.material_types.map((material, index) => (
                          <Col xs={24} sm={12} md={8} key={material.id}>
                            <Form.Item
                              label={`${material.name || "Material"}`}
                              name={["material_types", index, "price"]}
                              rules={[
                                { required: true, message: `Please enter ${material.name} price.` },
                                {
                                  validator: (_, value) => {
                                    if (value && isNaN(value)) {
                                      return Promise.reject(
                                        new Error(`${material.name} price must be a valid number.`)
                                      );
                                    }
                                    if (value && value.toString().includes(" ")) {
                                      return Promise.reject(
                                        new Error(`${material.name} price cannot contain spaces.`)
                                      );
                                    }
                                    if (value && parseFloat(value) <= 0) {
                                      return Promise.reject(
                                        new Error(`${material.name} price must be greater than 0.`)
                                      );
                                    }
                                    return Promise.resolve();
                                  },
                                },
                              ]}
                            >
                              <Input
                                prefix={<span style={{ color: "blue" }}>$</span>}
                                placeholder={`Enter ${material.name} price`}
                                onChange={(e) => {
                                  const updatedMaterials = [...data.material_types];
                                  updatedMaterials[index] = {
                                    ...updatedMaterials[index],
                                    price: e.target.value,
                                  };
                                  setData((prev) => ({
                                    ...prev,
                                    material_types: updatedMaterials,
                                  }));
                                }}
                              />
                            </Form.Item>
                          </Col>
                        ))}
                      </Row>
                    </Form.Item>
                  </Col>

                  {formFields.map((field) => (
                    <Col xs={24} key={field.name}>
                      <Form.Item
                        label={field.label}
                        name={field.name}
                        rules={[
                          { required: true, message: `Please enter ${field.label.toLowerCase()}.` },
                          ...(priceFields.includes(field.name) || ["charge_per_stalls", "charge_per_screens"].includes(field.name)
                            ? [
                                {
                                  validator: (_, value) => {
                                    if (value && isNaN(value)) {
                                      return Promise.reject(new Error(`${field.label} must be a valid number.`));
                                    }
                                    if (value && value.toString().includes(" ")) {
                                      return Promise.reject(new Error(`${field.label} cannot contain spaces.`));
                                    }
                                    if (value && parseFloat(value) <= 0) {
                                      return Promise.reject(new Error(`${field.label} must be greater than 0.`));
                                    }
                                    return Promise.resolve();
                                  },
                                },
                              ]
                            : []),
                        ]}
                      >
                        <Input
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          prefix={
                            priceFields.includes(field.name)
                              ? <span style={{ color: "blue" }}>$</span>
                              : null
                          }
                        />
                      </Form.Item>
                    </Col>
                  ))}
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24}>
                    <Form.Item style={{ textAlign: "center" }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={buttonLoading}
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

export default InstallationSetup;
