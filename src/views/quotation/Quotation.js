// Full Quotation Component
import { Tabs, Card, Row, Col, Form, Input, Button, message, Spin, Breadcrumb } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import apiService from "../../services/apiService";
import { Link } from "react-router-dom";

function Quotation({title}) {
  const [formIC] = Form.useForm();
  const [formBW] = Form.useForm(); 
  const [formALIC] = Form.useForm();
  const [formALBW] = Form.useForm();
  const [formADA] = Form.useForm();  
  const [materials, setMaterials] = useState([]);
  const [maxStall, setMaxStall] = useState(1);
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
  
        const mapConfigToFormValues = (typeConfig, formValues) => {
          Object.keys(typeConfig).forEach((stallKey, stallIndex) => {
            const stallData = typeConfig[stallKey];
            stallData.forEach((material, materialIndex) => {
              const materialName = material.name || Object.keys(material).find(key => key !== 'id');
              const materialPrice = material.price || material[materialName];
  
              // Modify the key structure to match the Form.Item names
              formValues[`${materialName}[${stallIndex + 1}][${materialIndex}]`] = materialPrice;
            });
          });
        };
  
        // Call this function for each type
        if (config.IC) {
          mapConfigToFormValues(config.IC, formValuesIC);
          formIC.setFieldsValue(formValuesIC);
        }
        if (config.BW) {
          mapConfigToFormValues(config.BW, formValuesBW);
          formBW.setFieldsValue(formValuesBW);
        }
        if (config.ALIC) {
          mapConfigToFormValues(config.ALIC, formValuesALIC);
          formALIC.setFieldsValue(formValuesALIC);
        }
        if (config.ALBW) {
          mapConfigToFormValues(config.ALBW, formValuesALBW);
          formALBW.setFieldsValue(formValuesALBW);
        }
        if (config.ADA_price) {
          formADA.setFieldsValue({
            ADA_price: config.ADA_price // Populate the ADA form with the price
          });
        }
  
        setData((prevData) => ({
          ...prevData,
          id: response.data.id,
          config: config,  
          loading: false,
        }));
      }
    } catch (error) {
      setData((prev) => ({ ...prev, loading: false }));
      console.error("Error fetching records:", error);
      message.error(error.response?.statusText || 'Error fetching records');
    } finally {
       setData((prev) => ({ ...prev, loading: false }));
    }
  }, [formIC, formBW, formALIC, formALBW, formADA]);
  
  
  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);
  

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);



  const handleFinish = async (formValues, type) => {
    setData((prev) => ({ ...prev, loading: true }));
    setButtonLoading(true );
  
    const config = {
      [type]: {},
    };
  
    // Loop through each stall (from 1 to maxStall)
    for (let i = 0; i < maxStall; i++) {
      const stallKey = (i + 1).toString();
      config[type][stallKey] = materials.map((material, index) => {
        // Extract the price using the updated naming convention
        const price = formValues[`${material.name}[${stallKey}][${index}]`] || "";
        return {
          id: material.id,
          name: material.name,
          //src: material.src,
          price: price.toString(),
        };
      });
    }
  
    const request = {
      config,
      type,
    };
  
    try {
      const response = await apiService.post(`settings/updateQuotationBuilder/${data.id}`, request);
      if (response.status === 200) {
        message.success(response.data.message);
        setData({ ...data, loading: false, errors: [] });
        setButtonLoading(false);
      }
    } catch (error) {
      console.log('Error response:', error.response); // Debugging the error response
      setData((prev) => ({ ...prev, loading: false }));
      setButtonLoading(false);
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

  const handleADAFinish = async (formValues, type) => {
    setData((prev) => ({ ...prev, loading: true }));
    setButtonLoading(true);
    const request = {
      ADA_price: formValues.ADA_price.toString(),
    };
  
    try {
      const response = await apiService.post(`settings/updateQuotationBuilderADAprice/${data.id}`, request);
      if (response.status === 200) {
        message.success(response.data.message);
        setData({ ...data, loading: false, errors: [] });
        setButtonLoading(false);
      }
    } catch (error) {
      console.error("Error response:", error.response); // Debugging the error response
      setData((prev) => ({ ...prev, loading: false }));
      setButtonLoading(false);
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
  
  
  const handleTabChange = (key) => {
    console.log(key)
   // fetchRecords();
   // setData((prev) => ({ ...prev, errors: [] }));
  };
  
  
  
  
  const renderForm = (form, onFinish, label) => (
    <Spin spinning={data.loading}>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {materials.length > 0 ? (
          <Row gutter={24} style={{ textAlign: 'center' }}>
            <Col span={4}>
              <Form.Item label="Stall No" style={{ paddingLeft: '60px', fontWeight: 'bold' }}/>
            </Col>
            {materials.map((material, index) => (
              <Col span={4} key={index}>
                <span style={{ fontWeight: 'bold' }}>{material.name}</span>
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
                  {data.errors?.[`config.${label}.${stallIndex}.${index}.price`] ? "error" : ""}
                  <Form.Item
                    name={`${material.name}[${stallIndex+1}][${index}]`} // Updated this line
                    validateStatus={data.errors?.[`config.${label}.${stallIndex+1}.${index}.price`] ? "error" : ""}
                    help={data.errors?.[`config.${label}.${stallIndex+1}.${index}.price`]?.message}
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
                          if (value && parseFloat(value) <= 0) {
                            return Promise.reject(new Error(`${material.name} price must be greater than 0 for stall ${stallIndex + 1}.`));
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
              {buttonLoading ? "Processing..." : `Update ${label}`}
            </Button>
          </Form.Item>
        ) : null}
      </Form>
    </Spin>
  );

  const renderADAForm = (form, handleADAFinish, label) => (
    <Spin spinning={data.loading}>
      <Row justify="center">
      <Col xs={24} sm={20} md={18} lg={12}>
      <Form form={form} layout="vertical" onFinish={handleADAFinish} requiredMark={false}>
        <Form.Item
          label={
            <span>
              Price <span style={{ color: "red" }}>*</span>
            </span>
          }
          name="ADA_price"
          validateStatus={data.errors?.ADA_price ? "error" : ""}
          help={data.errors?.ADA_price?.message} // Display only the error message
          rules={[
            { required: true, message: 'Please enter ADA price.' },
            {
              validator: (_, value) => {
                if (value && isNaN(value)) {
                  return Promise.reject(new Error('Price must be a valid number.'));
                }
                if (value && value.includes(' ')) {
                  return Promise.reject(new Error('Price cannot contain spaces.'));
                }
                if (value && parseFloat(value) <= 0) {
                  return Promise.reject(new Error('Price must be greater than 0.'));
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input
            prefix={<span style={{ color: 'blue' }}>$</span>}
            placeholder="Enter ADA price"
          />
        </Form.Item>
  
        <Form.Item style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
          <Button type="primary" htmlType="submit" loading={buttonLoading}>
            {buttonLoading ? 'Processing...' : `Update ${label}`}
          </Button>
        </Form.Item>
      </Form>
      </Col>
      </Row>
      
    </Spin>
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
    {
      label: "ADA",
      key: "5",
      children: renderADAForm(formADA, (values) => handleADAFinish(values, 'ADA'), 'ADA'),
    },
  ];

  return (
    <div className="container-fluid">
        <Breadcrumb style={{ marginBottom: "16px" }}>
         <Breadcrumb.Item><Link to="/">Home</Link></Breadcrumb.Item>
        <Breadcrumb.Item>Quotations</Breadcrumb.Item>
      </Breadcrumb>
    <h1 className="h3 mb-4 text-gray-800">{title}</h1>
   
    <Card>
      <Tabs defaultActiveKey="1" type="card" items={tabItems} onChange={handleTabChange}/>
    </Card>
    
  </div>
  );
}
export default Quotation;
