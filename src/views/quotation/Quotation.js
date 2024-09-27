// Full Quotation Component
import { Tabs, Card, Row, Col, Form, Input, Button, message, Spin } from "antd";
import { DollarOutlined } from "@ant-design/icons";
import React, { useCallback, useEffect, useState } from "react";
import apiService from "../../services/apiService";

function Quotation() {
  const [formIC] = Form.useForm();
  const [formBW] = Form.useForm(); 
  const [formALIC] = Form.useForm();
  const [formALBW] = Form.useForm(); 
  const [materials, setMaterials] = useState([]);
  const [maxStall, setMaxStall] = useState(1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    id: "",
    config: {},
    errors: [],
    loading: false,
  });
  const [buttonLoading, setButtonLoading] = useState(false); // Separate state for button-specific loading

  const fetchMaterials = async () => {
    try {
      const response = await apiService.get(`masterSettings/materialView/?key=materials`);
      if (response.status === 200) {
        setMaterials(response.data);
      }
    } catch (error) {
      setMaterials([]); 
      message.error(error.response?.statusText || 'Error fetching materials');
    }
  };

  const fetchMaxStall = async () => {
    try {
      const response = await apiService.get(`settings/view/?step=project`);
      if (response.status === 200) {
        setMaxStall(response.data?.config?.maximum_number_of_stalls || 1);
      }
    } catch (error) {
      setMaxStall(1); 
      message.error(error.response?.statusText || 'Error fetching stalls');
    }
  };

  useEffect(() => {
    fetchMaterials();
    fetchMaxStall();
  }, []);

  const fetchRecords = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true }));
    try {
      const response = await apiService.get(`settings/view/?step=quotation_builder`);
      if (response.status === 200) {
        const config = response.data.config;

        const formValuesIC = {};
        const formValuesBW = {};
        const formValuesALIC = {};
        const formValuesALBW = {};

        Object.keys(config).forEach((type) => {
          const typeConfig = config[type];
          if (typeConfig) {
            Object.keys(typeConfig).forEach((stallKey) => {
              const stallData = typeConfig[stallKey];

              stallData.forEach((material) => {
                const materialName = Object.keys(material).find(key => key !== 'id'); // Get material name
                const materialPrice = material[materialName]; // Get material price

                // Check type and set form values accordingly
                if (type === 'IC') {
                  formValuesIC[`${materialName}_${stallKey - 1}`] = materialPrice;
                } else if (type === 'BW') {
                  formValuesBW[`${materialName}_${stallKey - 1}`] = materialPrice;
                } else if (type === 'ALIC') {
                  formValuesALIC[`${materialName}_${stallKey - 1}`] = materialPrice;
                } else if (type === 'ALBW') {
                  formValuesALBW[`${materialName}_${stallKey - 1}`] = materialPrice;
                }
              });
            });
          }
        });

        // Set form values for all types
        formIC.setFieldsValue(formValuesIC);
        formBW.setFieldsValue(formValuesBW);
        formALIC.setFieldsValue(formValuesALIC);
        formALBW.setFieldsValue(formValuesALBW);

        setData((prevData) => ({
          ...prevData,
          id: response.data.id,
          config: config,  
          loading: false,
        }));
      }
    } catch (error) {
      message.error(error.response?.statusText);
      setData((prev) => ({ ...prev, loading: false }));
    } finally {
      setData((prev) => ({ ...prev, loading: false }));
    }
  }, [formIC, formBW, formALIC, formALBW]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const setFormErrors = (formInstance, errors) => {
    const fieldErrors = Object.keys(errors).map((key) => ({
      name: key, 
      errors: [errors[key].message], // Get the error message
    }));
    console.log(fieldErrors);
    formInstance.setFields(fieldErrors); // Use setFields on the correct form instance
    message.error(fieldErrors[0].errors[0]);
  };

  const handleFinish = async (formValues, type, form) => {
    setData((prev) => ({ ...prev, loading: true }));
    setButtonLoading(true); // Set button loading to true when the update starts
  
    const result = {
      [type]: {},
    };
  
    for (let i = 0; i < maxStall; i++) {
      const stallKey = (i + 1).toString();
      result[type][stallKey] = materials.map((material) => {
        const price = formValues[`${material.name}_${i}`] !== undefined
          ? formValues[`${material.name}_${i}`] === ""
            ? null
            : formValues[`${material.name}_${i}`]
          : null;
        return {
          id: material.id,
          [material.name]: price.trim(),
        };
      });
    }
  
    const request = {
      result,
      type: type,
    };
  
    try {
      const response = await apiService.post(`settings/updateQuotationBuilder/${data.id}`, request);
      if (response.status === 200) {
        message.success(response.data.message);
        setData({ ...data, loading: false, errors: [] });
        setButtonLoading(false); // Set button loading to false after success
      }
    } catch (error) {
      setData((prev) => ({ ...prev, loading: false }));
      setButtonLoading(false); // Set button loading to false on error
  
      if (error.response && error.response.status === 422) {
        setData({ ...data, errors: error.response.data.errors });
        const errors = error.response.data.errors;

        // Use the correct form instance based on the type
        if (type === "IC") {
          setFormErrors(formIC, errors);
        } else if (type === "BW") {
          setFormErrors(formBW, errors);
        } else if (type === "ALIC") {
          setFormErrors(formALIC, errors);
        } else if (type === "ALBW") {
          setFormErrors(formALBW, errors);
        }
      } else {
        message.error("Something went wrong. Please try again later.");
      }
    }
  };
  
  

  const renderForm = (form, onFinish, label, loading) => (
  <Form form={form} layout="vertical" onFinish={onFinish}>
      {materials.length > 0 ? (
        <Row gutter={24} style={{ textAlign: 'center' }}>
          <Col span={4}>
            <Form.Item label="Stall No" style={{ paddingLeft: '60px',fontWeight: 'bold' }}/>
          </Col>
          {materials.map((material, index) => (
            <Col span={4} key={index}>
              <span  style={{fontWeight: 'bold' }}>{material.name}</span>
            </Col>
          ))}
        </Row>
      ) : null}

      {materials.length > 0 &&
        [...Array(maxStall)].map((_, stallIndex) => (
          <Row gutter={24} key={stallIndex} style={{ textAlign: 'center' }}>
            <Col span={4}>
              <span style={{ display: "block" }}>
                {stallIndex + 1}
              </span>
            </Col>
            {materials.map((material, index) => (
              <Col span={4} key={index}>
                <Form.Item
                  name={`${material.name}_${stallIndex}`}
                  rules={[
                    { required: true, message: `Please enter ${material.name} price for stall ${stallIndex + 1}.` },
                    {
                      validator: (_, value) => {
                        if (value && isNaN(value)) {
                          return Promise.reject(new Error(`${material.name} price must be a valid number for stall ${stallIndex + 1}.`));
                        }
                        if (value && value.includes(' ')) {
                          return Promise.reject(new Error(`${material.name} price cannot contain spaces for stall ${stallIndex + 1}.`));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    prefix={<span style={{ color: 'blue' }}>$</span>}
                    placeholder={`Enter ${material.name} price`}
                    type="text"
                  />
                </Form.Item>
              </Col>
            ))}
          </Row>
        ))}

      {materials.length > 0 ? (
        <Form.Item style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
          <Button type="primary" htmlType="submit" loading={buttonLoading}>
            {buttonLoading ? "Processing..." :  `Update ${label}`}
          </Button>
        </Form.Item>
      ) : null}
    </Form>
  );
  

  const tabItems = [
    {
      label: "IC",
      key: "1",
      children: renderForm(formIC, (values) => handleFinish(values, 'IC', 'formIC'), 'IC'),
    },
    {
      label: "BW",
      key: "2",
      children: renderForm(formBW, (values) => handleFinish(values, 'BW', 'formBW'), 'BW'),
    },
    {
      label: "ALIC",
      key: "3",
      children: renderForm(formALIC, (values) => handleFinish(values, 'ALIC', 'formALIC'), 'ALIC'),
    },
    {
      label: "ALBW",
      key: "4",
      children: renderForm(formALBW, (values) => handleFinish(values, 'ALBW', 'formALBW'), 'ALBW'),
    },
  ];

  return (
    <div className="container-fluid">
    <h1 className="h3 mb-4 text-gray-800">Quotation Builder</h1>
    <Spin spinning={data.loading}>
    <Card>
      <Tabs defaultActiveKey="1" type="card" items={tabItems} />
    </Card>
    </Spin>
  </div>
  );
}
export default Quotation;