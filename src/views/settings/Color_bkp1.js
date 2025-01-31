import React, { useEffect, useState } from "react";
import {
  Form,
  Button,
  Card,
  Row,
  Col,
  Select,
  Spin,
  message,
  Breadcrumb,
  Input,
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import apiService from "../../services/apiService";

function Color({ title }) {
  const { Option } = Select;
  const [form] = Form.useForm();
  const [data, setData] = useState({
    id:null,
    loading: false,
    colors: [],
    textures :[]
  });

  const [materials, setMaterials] = useState([]);
  const [defaultMaterial, setDefaultMaterial] = useState(null);

  // Fetch materials
  const fetchMaterials = async () => {
    try {
      const response = await apiService.get(
        `masterSettings/materialView/?key=materials`
      );
      if (response.status === 200) {
        const materialList = response.data;
        setMaterials(materialList);

        if (materialList.length > 0) {
          setDefaultMaterial(materialList[0].id);
          form.setFieldsValue({ material_id: materialList[0].id });
          fetchData(materialList[0].id)
        }
      }
    } catch (error) {
      console.log(error);
      setMaterials([]);
      message.error(error.response?.statusText || "Error fetching materials");
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchData = async (id) =>{
  setDefaultMaterial(id);
 form.setFieldsValue({ material_id: id });
 setData((prevState) => ({
  ...prevState,
  loading:true
}));
 try {
  const response = await apiService.get(
    `colors/view/${id}`
  );
  if (response.status === 200) {
    setData((prevState) => ({
      ...prevState,
      loading:false
    }));
    const { id , colors=[], textures=[] } = response.data.results.result;
      setData((prevState) => ({
        ...prevState,
        id:id,
        colors: colors,
        textures : textures
      }));
      // Update form fields with colors data
      form.setFieldsValue({ colors, textures });
      
  }
} catch (error) {
  setData((prevState) => ({
    ...prevState,
    loading:false
  }));
  message.error(error.response?.statusText || "Error fetching data");
}
  }

  const handleSubmit = async (values) => {
    try {
      console.log("Submitting:", values); // Debugging
      const response = await apiService.post(`colors/update/${data.id}`, values); // Change API endpoint if needed
      
      if (response.status === 200) {
        message.success("Colors updated successfully!");
      } else {
        message.error(response.data.message || "Failed to update colors.");
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Error submitting form.");
    }
  };
  

  return (
    <div className="container-fluid">
      <Breadcrumb
        style={{ marginBottom: "16px" }}
        items={[
          { title: <Link to="/dashboard">Home</Link> },
          { title: "Colors" },
        ]}
      />

      <h1 className="h3 mb-4 text-gray-800">{title}{defaultMaterial}</h1>
      <Spin spinning={data.loading}>
        <Card>
          <Row justify="center">
            <Col xs={24} sm={20} md={18} lg={12}>
                <Form form={form} layout="vertical" name="colorForm"  onFinish={handleSubmit}>
                  {/* Select Material */}
                  <Form.Item
                    label={
                      <span>
                        Select Material <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    name="material_id"
                    rules={[
                      {
                        required: true,
                        message: "Please select a material!",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Select Material"
                      value={defaultMaterial}
                      onChange={(value) => fetchData(value)}
                    >
                      {materials.map((material) => (
                        <Option key={material.id} value={material.id}>
                          {material.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>

                  {/* Color and Name Fields */}
                  <Form.Item
  label={
    <span>
      Colors <span style={{ color: "red" }}>*</span>
    </span>
  }
>
  <Form.List name="colors">
    {(fields, { add, remove }) => (
      <>
        {fields.map(({ key, name, fieldKey, ...restField }) => (
          <Row
            key={key}
            gutter={16}
            align="middle"
            style={{ marginBottom: 8 }}
          >
            <Col flex="80px">
              <Form.Item
                {...restField}
                name={[name, "color"]}
                fieldKey={[fieldKey, "color"]}
                rules={[
                  {
                    required: true,
                    message: "Please select a color!",
                  },
                ]}
              >
                <Input
                  type="color"
                  style={{
                    width: "100%",
                    padding: 0,
                    height: "32px",
                  }}
                />
              </Form.Item>
            </Col>
            <Col flex="auto">
              <Form.Item
                {...restField}
                name={[name, "name"]}
                fieldKey={[fieldKey, "name"]}
                rules={[
                  {
                    required: true,
                    message: "Please enter a name!",
                  },
                ]}
              >
                <Input
                  placeholder="Enter name"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col style={{ paddingBottom: "20px" }}>
              <MinusCircleOutlined
                style={{ color: "red" }}
                onClick={() => remove(name)}
              />
            </Col>
          </Row>
        ))}
        <Form.Item>
          <Button
            type="dashed"
            onClick={() =>
              add({
                color: "#ffffff",
                name: "", // Default name
              })
            }
            icon={<PlusOutlined />}
            block
          >
            Add Color
          </Button>
        </Form.Item>
      </>
    )}
  </Form.List>
</Form.Item>


                  <Form.Item>
                    <Button type="primary" htmlType="submit">
                      Update
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

export default Color;
