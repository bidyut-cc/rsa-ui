import { Tabs, Card, Row, Col, Form, Input, Button, message } from "antd";
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

  const fetchMaterials = async () => {
    try {
      const response = await apiService.get(`masterSettings/view/?key=materials`);
      if (response.status === 200) {
        setMaterials(response.data.value);
      }
    } catch (error) {
      message.error(error.response?.statusText || 'Error fetching materials');
    }
  };


  const fetchMaxStall = async () => {
    try {
      const response = await apiService.get(`settings/view/?step=project`);
      if (response.status === 200) {
        setMaxStall(response.data?.config?.maximum_number_of_stalls);
      }
    } catch (error) {
      message.error(error.response?.statusText || 'Error fetching stalls');
    }
  };

  useEffect(() => {
    fetchMaterials();
    fetchMaxStall();
  }, []);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.get(`settings/view/?step=quatation_builder`);
      if (response.status === 200) {
        const config = response.data.config;

        // Prepare an object to hold the form values for IC
        const formValuesIC = {};
        const formValuesBW = {};
        const formValuesALIC = {};
        const formValuesALBW = {};

        // Loop through each stall in the config and set form values
        Object.keys(config).forEach((type) => {
          const typeConfig = config[type];
          if (typeConfig) {
            Object.keys(typeConfig).forEach((stallKey) => {
              const stallData = typeConfig[stallKey];
              Object.keys(stallData).forEach((materialKey) => {
                if (type === 'IC') {
                  formValuesIC[`${materialKey}_${stallKey - 1}`] = stallData[materialKey];
                } else if (type === 'BW') {
                  formValuesBW[`${materialKey}_${stallKey - 1}`] = stallData[materialKey];
                } else if (type === 'ALIC') {
                  formValuesALIC[`${materialKey}_${stallKey - 1}`] = stallData[materialKey];
                } else if (type === 'ALBW') {
                  formValuesALBW[`${materialKey}_${stallKey - 1}`] = stallData[materialKey];
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
      }
    } catch (error) {
      message.error(error.response?.statusText);
    } finally {
      setLoading(false);
    }
  }, [formIC, formBW]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleFinish = (formValues, type) => {
    const result = {
      [type]: {},
    };

    for (let i = 0; i < maxStall; i++) {
      const stallKey = (i + 1).toString();
      result[type][stallKey] = {};
      materials.forEach((material) => {
        result[type][stallKey][material.name] = formValues[`${material.name}_${i}`] || 0;
      });
    }

    console.log(`${type} Result:`, result);
  };

  // Render forms
  const renderForm = (form, onFinish, label) => (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Row gutter={24}>
        <Col span={4}>
          <Form.Item label="Stall No" />
        </Col>
        {materials.map((material, index) => (
          <Col span={4} key={index}>
            <span>{material.name}</span>
          </Col>
        ))}
      </Row>

      {[...Array(maxStall)].map((_, stallIndex) => (
        <Row gutter={24} key={stallIndex}>
          <Col span={4}>
            <span style={{ display: "block", textAlign: "center" }}>
              {stallIndex + 1}
            </span>
          </Col>
          {materials.map((material, index) => (
            <Col span={4} key={index}>
              <Form.Item
                name={`${material.name}_${stallIndex}`}
                rules={[{ required: true, message: `Please enter ${material.name} price` }]}
              >
                <Input prefix={<DollarOutlined />} placeholder={`Enter ${material.name} price`} type="text" />
              </Form.Item>
            </Col>
          ))}
        </Row>
      ))}

      <Form.Item style={{ display: "flex", justifyContent: "center" }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          Update {label}
        </Button>
      </Form.Item>
    </Form>
  );

  const tabItems = [
    {
      label: "IC",
      key: "1",
      children: renderForm(formIC, (values) => handleFinish(values, 'IC'), 'IC'),
    },
    {
      label: "BW",
      key: "2",
      children: renderForm(formBW, (values) => handleFinish(values, 'BW'), 'BW'),
    },
    {
      label: "ALIC",
      key: "3",
      children: renderForm(formALIC, (values) => handleFinish(values, 'ALIC'), 'ALIC'),
    },
    {
      label: "ALBW",
      key: "4",
      children: renderForm(formALBW, (values) => handleFinish(values, 'ALBW'), 'ALBW'),
    },
  ];

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4 text-gray-800">Quotation Builder</h1>
      <Card>
        <Tabs defaultActiveKey="1" type="card" items={tabItems} />
      </Card>
    </div>
  );
}

export default Quotation;
