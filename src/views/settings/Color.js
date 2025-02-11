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
  Upload
} from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import apiService from "../../services/apiService";

function Color({ title }) {
  const { Option } = Select;
  const [form] = Form.useForm();
  const [data, setData] = useState({
    id: null,
    loading: false,
    colors: [],
    textures: []
  });
  const [buttonLoading, setButtonLoading] = useState(false); 
  const [materials, setMaterials] = useState([]);
  const [defaultMaterial, setDefaultMaterial] = useState(null);

  const [fileLists, setFileLists] = useState({}); // Store fileList per row

  // Fetch materials
  const fetchMaterials = async () => {
    setData((prevState) => ({
      ...prevState,
      loading: true
    }));
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
          fetchData(materialList[0].id);
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

  const fetchData = async (id) => {
    setDefaultMaterial(id);
    form.setFieldsValue({ material_id: id });
    setData((prevState) => ({
      ...prevState,
      loading: true
    }));
    try {
      const response = await apiService.get(`colors/view/${id}`);
      if (response.status === 200) {
        setData((prevState) => ({
          ...prevState,
          loading: false
        }));
        const { id, colors = [], textures = [] } = response.data.results.result;
        setData((prevState) => ({
          ...prevState,
          id: id,
          colors: colors,
          textures: textures
        }));
  
        // Map textures to fileLists with images and delete functionality
        const updatedFileLists = textures.reduce((acc, texture, index) => {
          if (texture.images.length > 0) {
            const imagePath = texture.images[0].filename;
            acc[index] = [{
              uid: imagePath,
              name: imagePath,
              mimetype:texture.images[0].mimetype,
              status: 'done',
              url: `${process.env.REACT_APP_API_URL}/uploads/textures/${imagePath}`, // Replace with actual path to your images
              // Add delete handler
             // onRemove: () => handleRemoveImage(index, imagePath)
            }];
          } else {
            acc[index] = [];
          }
          return acc;
        }, {});
        setFileLists(updatedFileLists);
        
        form.setFieldsValue({ colors, textures });
      }
    } catch (error) {
      setData((prevState) => ({
        ...prevState,
        loading: false
      }));
      message.error(error.response?.statusText || "Error fetching data");
    }
  };

  // const handleSubmit = async (values) => {
  //   try {
  //     console.log("Submitting:", values);
  //     const response = await apiService.post(`colors/update/${data.id}`, values);

  //     if (response.status === 200) {
  //       message.success("Colors and textures updated successfully!");
  //     } else {
  //       message.error(response.data.message || "Failed to update.");
  //     }
  //   } catch (error) {
  //     message.error(error.response?.data?.message || "Error submitting form.");
  //   }
  // };

  const handleSubmit = async (values) => {
    setButtonLoading(true);
    try {
      const formData = new FormData();
      formData.append("material_id", values.material_id);
  
      // Append colors
      values.colors.forEach((color, index) => {
        formData.append(`colors[${index}][color]`, color.color);
        formData.append(`colors[${index}][name]`, color.name);
      });
  
      // Append textures and images
      values.textures.forEach((texture, index) => {
        formData.append(`textures[${index}][name]`, texture.name);
        
        // Append image file if uploaded
        const fileList = fileLists[index]; // Assuming `fileLists` is state storing images for each texture
        if (fileList && fileList.length > 0) {
          fileList.forEach((file, fileIndex) => {
           // formData.append(`textures[${index}][images][${fileIndex}]`, file.originFileObj); // Use images array for multiple files per texture
         if (file.originFileObj) {
            // If new file is uploaded
            formData.append(`textures[${index}][images][${fileIndex}]`, file.originFileObj);
          } else {
            // If no new file, send existing image object
            formData.append(`textures[${index}][images][${fileIndex}][filename]`, file.name);
            formData.append(`textures[${index}][images][${fileIndex}][mimetype]`, file.mimetype); // Adjust MIME type if necessary
          }
          });
        }
      });
  
      // Send to backend
      const response = await apiService.post(`colors/update/${data.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      if (response.status === 200) {
        setButtonLoading(false);
        message.success("Colors and textures updated successfully!");
      } else {
        setButtonLoading(false);
        message.error(response.data.message || "Failed to update.");
      }
    } catch (error) {
      setButtonLoading(false);
      message.error(error.response?.data?.message || "Error submitting form.");
    }
  };
  
  
  return (
    <div className="container-fluid">
      <Breadcrumb
        style={{ marginBottom: "16px" }}
        items={[
          { title: <Link to="/dashboard">Home</Link> },
          { title: "Colors & Textures" }
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
                  // rules={[
                  //   {
                  //     required: true,
                  //     message: "Please select a material!"
                  //   }
                  // ]}
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
                <Form.Item label="Colors">
                  <Form.List name="colors">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map(({ key, name, fieldKey, ...restField }) => (
                          <Row key={key} gutter={16} align="middle" style={{ marginBottom: 8 }}>
                            <Col flex="80px">
                              <Form.Item
                                {...restField}
                                name={[name, "color"]}
                                fieldKey={[fieldKey, "color"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "Please select a color!"
                                  }
                                ]}
                              >
                                <Input type="color" style={{ width: "100%", padding: 0, height: "32px" }} />
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
                                    message: "Please enter a name!"
                                  }
                                ]}
                              >
                                <Input placeholder="Enter name" style={{ width: "100%" }} />
                              </Form.Item>
                            </Col>
                            <Col style={{paddingBottom:"20px"}}>
                              <MinusCircleOutlined style={{ color: "red" }} onClick={() => remove(name)} />
                            </Col>
                          </Row>
                        ))}
                        <Form.Item>
                          <Button type="dashed" onClick={() => add({ color: "#ffffff", name: "" })} icon={<PlusOutlined />} block>
                            Add Color
                          </Button>
                        </Form.Item>
                      </>
                    )}
                  </Form.List>
                </Form.Item>

                {/* Textures (Upload & Name) */}
                <Form.Item label="Textures">
                <Form.List name="textures">
  {(fields, { add, remove }) => (
    <>
      {fields.map((field) => (
        <Row key={field.key} gutter={16} align="middle" style={{ marginBottom: 8 }}>
          <Col flex="120px">
          <Form.Item
                name={[field.name, "image"]}
                fieldKey={[field.fieldKey, "image"]}
                rules={[
                  {
                    validator: (_, value) => {
                      if (fileLists[field.key] && fileLists[field.key].length > 0) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Image is required!"));
                    },
                  },
                ]}
              >
              <Upload
                listType="picture-card"
                beforeUpload={() => false}
                accept="image/*"
                maxCount={1}
                fileList={fileLists[field.key] || []} // Bind to unique field key
                onChange={(info) => {
                  const newFileList = info.fileList.slice(-1); // Keep only last uploaded file
                  setFileLists((prev) => ({ ...prev, [field.key]: newFileList }));
                }}
                showUploadList={{ showPreviewIcon: false }} // Hide preview icon
              >
                {!fileLists[field.key] || fileLists[field.key].length === 0 ? (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                ) : null}
              </Upload>
            </Form.Item>
          </Col>
          <Col flex="auto">
            <Form.Item
              name={[field.name, "name"]}
              fieldKey={[field.fieldKey, "name"]}
              rules={[{ required: true, message: "Please enter a name!" }]}
            >
              <Input placeholder="Enter texture name" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col style={{paddingBottom:"20px"}}>
            <MinusCircleOutlined
              style={{ color: "red" }}
              onClick={() => {
                remove(field.name);
                setFileLists((prev) => {
                  const newFileLists = { ...prev };
                  delete newFileLists[field.key]; // Remove fileList entry for deleted row
                  return newFileLists;
                });
              }}
            />
          </Col>
        </Row>
      ))}
      <Form.Item>
        <Button type="dashed" onClick={() => add({ image: null, name: "" })} icon={<PlusOutlined />} block>
          Add Texture
        </Button>
      </Form.Item>
    </>
  )}
</Form.List>
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

export default Color;
