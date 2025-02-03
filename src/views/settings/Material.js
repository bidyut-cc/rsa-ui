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
  Input
} from "antd";
import { Link } from "react-router-dom";
import apiService from "../../services/apiService";

function Material({ title }) {
  const { Option } = Select;
  const [form] = Form.useForm();
  const [data, setData] = useState({
    id: null,
    loading: false
  });
  const [buttonLoading, setButtonLoading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [defaultMaterial, setDefaultMaterial] = useState(null);
  const [descriptions, setDescriptions] = useState({}); // Store descriptions

  // Fetch materials
  const fetchMaterials = async () => {
    try {
        setData((prevState) => ({
            ...prevState,
            loading: true
          }));
      const response = await apiService.get(
        `masterSettings/materialView/?key=materials`
      );
      if (response.status === 200) {
        const materialList = response.data;
        console.log(materialList);
        setMaterials(materialList);
        setData((prevState) => ({
            ...prevState,
            id:materialList,
            loading: false
          }));
        // Initialize descriptions state
        const initialDescriptions = materialList.reduce((acc, material) => {
          acc[material.id] = material.description || ""; // Default to empty if no description
          return acc;
        }, {});
        setDescriptions(initialDescriptions);

        if (materialList.length > 0) {
          setDefaultMaterial(materialList[0].id);
          form.setFieldsValue({
            material_id: materialList[0].id,
            description: initialDescriptions[materialList[0].id]
          });
        }
      }
    } catch (error) {
        setData((prevState) => ({
            ...prevState,
            loading: false
          }));
      console.log(error);
      setMaterials([]);
      message.error(error.response?.statusText || "Error fetching materials");
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // Handle material selection change
  const handleMaterialChange = (id) => {
    setDefaultMaterial(id);
    form.setFieldsValue({
      material_id: id,
      description: descriptions[id] // Set the description field dynamically
    });
  };

  // Handle description change
  const handleDescriptionChange = (e) => {
    const { value } = e.target;
    setDescriptions((prev) => ({
      ...prev,
      [defaultMaterial]: value // Update only the selected material's description
    }));
  };

  const handleSubmit = async () => {
    setButtonLoading(true);
    try {
      const updatedMaterials = materials.map((material) => ({
        ...material,
        description: descriptions[material.id] || ""
      }));

      const response = await apiService.post(`masterSettings/updateMaterialDescription`, {
        key: "materials",
        value: updatedMaterials
      });

      if (response.status === 200) {
        message.success("Materials updated successfully!");
      }
    } catch (error) {
      message.error(error.response?.statusText || "Error updating materials");
    }
    setButtonLoading(false);
  };

  return (
    <div className="container-fluid">
      <Breadcrumb
        style={{ marginBottom: "16px" }}
        items={[
          { title: <Link to="/dashboard">Home</Link> },
          { title: "Material Descriptions" }
        ]}
      />

      <h1 className="h3 mb-4 text-gray-800">{title}</h1>
      <Spin spinning={data.loading}>
        <Card>
          <Row justify="center">
            <Col xs={24} sm={20} md={18} lg={12}>
              <Form form={form} layout="vertical" name="colorForm" onFinish={handleSubmit}>
                {/* Select Material */}
                <Form.Item
                  label={
                    <span>
                      Select Material <span style={{ color: "red" }}>*</span>
                    </span>
                  }
                  name="material_id"
                >
                  <Select
                    placeholder="Select Material"
                    value={defaultMaterial}
                    onChange={handleMaterialChange}
                  >
                    {materials.map((material) => (
                      <Option key={material.id} value={material.id}>
                        {material.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>

                {/* Description Field */}
                <Form.Item
                  label="Description"
                  name="description"
                >
                  <Input.TextArea
                    rows={3}
                    value={descriptions[defaultMaterial] || ""}
                    onChange={handleDescriptionChange}
                  />
                </Form.Item>

                <Form.Item style={{ display: "flex", justifyContent: "center" }}>
                  <Button type="primary" htmlType="submit" loading={buttonLoading}>
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

export default Material; 