import React, { useCallback, useEffect, useState } from "react";
import {
  Form,
  Button,
  Card,
  Row,
  Col,
  message,
  Upload,
  Breadcrumb
} from "antd";
import { Link } from "react-router-dom";
import { UploadOutlined, DownloadOutlined } from "@ant-design/icons";
import apiService from "../../services/apiService";

function Quote({ title }) {
  const [form] = Form.useForm();
  const [data, setData] = useState({
    id: "",
    errors: [],
    loading: false,
    file: null,
    filePath: "", // Store file path for download
  });

  const [buttonLoading, setButtonLoading] = useState(false);
  const [fileList, setFileList] = useState([]); // Track uploaded file list

  const fetchRecords = useCallback(async () => {
    setData((prev) => ({ ...prev, loading: true }));
    try {
      const response = await apiService.get(`settings/view/?step=material_installation_quote`);
      if (response.status === 200) {
        setData((prevData) => ({
          ...prevData,
          id: response.data.id,
          filePath: response.data.config?.file?.filename || "", // Store the existing file path
          loading: false,
        }));
      }
    } catch (error) {
      message.error(error.response?.statusText || "Error fetching data");
      setData((prevData) => ({ ...prevData, loading: false, errors: [] }));
    }
  }, [form]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const updateData = async () => {
    if (!data.file) {
      message.error("Please upload a PDF file!");
      return;
    }

    const formData = new FormData();
    formData.append("file", data.file);

    setData((prev) => ({ ...prev, loading: true }));
    setButtonLoading(true);

    try {
      const response = await apiService.post(
        `settings/updateMaterialInstallationQuote/${data.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (response.status === 200) {
        message.success(response.data.message);
        console.log(response.data.object);
        setData((prev) => ({
          ...prev,
          loading: false,
          file: null,
          filePath: response.data.object.config?.file?.filename, // Update filePath after upload
        }));
        setFileList([]); // Reset file list
        form.resetFields(); // Reset form
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Something went wrong!");
      setData((prev) => ({ ...prev, loading: false }));
    } finally {
      setButtonLoading(false);
    }
  };

  const handleDownload = () => {
    if (data.filePath) {
      window.open(`${process.env.REACT_APP_API_URL}/uploads/pdf/${data.filePath}`, "_blank");
    } else {
      message.error("No file to download");
    }
  };

  return (
    <div className="container-fluid">
      <Breadcrumb
        style={{ marginBottom: "16px" }}
        items={[
          { title: <Link to="/dashboard">Home</Link> },
          { title: "Material Installation Quote Setting" },
        ]}
      />
      <h1 className="h3 mb-4 text-gray-800">{title}</h1>
      <Card>
        <Row justify="center">
          <Col xs={24} sm={20} md={18} lg={12}>
            <Form form={form} layout="vertical" onFinish={updateData}>
              {/* File Upload (PDF) */}
              <Form.Item
  label="Upload PDF"
  name="file"
  rules={[
    {
      required: true,
      message: "Please upload a PDF file!",
    },
  ]}
>
  <div style={{ position: "relative" }}>
    {/* Download Button */}
    {data.filePath && (
      <Button
        icon={<DownloadOutlined />}
        onClick={handleDownload}
        style={{ position: "absolute", top: 0, right: 0 }}
      >
        Download PDF
      </Button>
    )}

    <Upload
      accept="application/pdf"
      maxCount={1}
      fileList={fileList}
      beforeUpload={(file) => {
        const isPDF = file.type === "application/pdf";
        if (!isPDF) {
          message.error("Only PDF files are allowed!");
          return Upload.LIST_IGNORE;
        }
        setData((prev) => ({ ...prev, file }));
        setFileList([file]); // Update fileList state
        return false; // Prevent automatic upload
      }}
      onRemove={() => {
        setData((prev) => ({ ...prev, file: null }));
        setFileList([]);
      }}
    >
      <Button icon={<UploadOutlined />}>Select PDF</Button>
    </Upload>
  </div>
</Form.Item>


              {/* Submit Button */}
              <Form.Item style={{ display: "flex", justifyContent: "center" }}>
                <Button type="primary" htmlType="submit" loading={buttonLoading}>
                  {buttonLoading ? "Processing..." : "Update"}
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default Quote;
