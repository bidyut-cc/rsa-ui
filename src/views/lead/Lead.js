import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Col,
  Row,
  Space,
  Table,
  Input as AntInput,
  Modal,
  message,
  Tooltip,
  Card,
} from "antd";
import { EyeOutlined, FilePdfOutlined } from "@ant-design/icons";
import apiService from "../../services/apiService";
import { debounce } from "lodash";

function Lead() {
  const [dataSource, setDataSource] = useState({
    loading: false,
    data: [],
    search: "",
    page: 1,
    pageSize: 10,
  });

  const [quotationData, setQuotationData] = useState({
    id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    submittedData: "",
    roomData: "",
    materials: [], // Initialize as an empty array
    errors: [],
    loading: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    {
      title: "Sl No.",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "First Name",
      dataIndex: "first_name",
      key: "first_name",
    },
    {
      title: "Last Name",
      dataIndex: "last_name",
      key: "last_name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone_number",
      key: "phone_number",
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" shape="circle" danger  onClick={() => handlePDF(record)}>
            <Tooltip title="View PDF">
              <FilePdfOutlined />
            </Tooltip>
          </Button>
          <Button
            type="primary"
            shape="circle"
            onClick={() => handleView(record)}
          >
            <Tooltip title="View">
              <EyeOutlined />
            </Tooltip>
          </Button>
        </Space>
      ),
    },
  ];

  const fetchRecords = useCallback(async () => {
    setDataSource((prev) => ({ ...prev, loading: true }));
    try {
      const response = await apiService.get(
        `quotations/list?page=${dataSource.page}&show=${dataSource.pageSize}&search=${dataSource.search}`
      );
      if (response.status === 200) {
        setDataSource((prev) => ({
          ...prev,
          loading: false,
          data: response.data.results,
        }));
      }
    } catch (error) {
      message.error(error.response.statusText);
      setDataSource((prev) => ({ ...prev, loading: false }));
    }
  }, [dataSource.page, dataSource.search, dataSource.pageSize]);

  const handlePaginate = (page) => {
    setDataSource((prev) => ({ ...prev, page }));
  };

  const handleSearch = debounce((value) => {
    setDataSource((prev) => ({
      ...prev,
      search: value,
      page: 1, // Reset to page 1
    }));
  }, 1000);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleView = (row) => {
    setQuotationData({
      id: row._id,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      phone_number: row.phone_number,
      submittedData: row.submittedData,
      roomData: row.roomData,
      materials: row.materials || [], // Default to empty array
      errors: [],
      loading: false,
    });
    setIsModalOpen(true);
  };

  const handlePDF = (row) => {
alert('Work in progress');
  };

  const handleCancel = () => {
    setQuotationData({
      id: "",
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      submittedData: "",
      roomData: "",
      materials: [],
      errors: [],
      loading: false,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4 text-gray-800">Leads</h1>
      <Card>
        <Row justify="end" style={{ marginBottom: 16 }}>
          <Col style={{ marginLeft: 8 }}>
            <AntInput
              placeholder="Search"
              allowClear
              onChange={(e) => handleSearch(e.target.value)}
            />
          </Col>
        </Row>
        <Table
          loading={dataSource.loading}
          rowKey="id"
          dataSource={dataSource.data.results?.data}
          columns={columns}
          pagination={{
            current: dataSource.page,
            pageSize: dataSource.pageSize,
            total: dataSource.data.results_count,
            onChange: (page) => handlePaginate(page),
            showTotal: (total, range) =>
              `Showing ${range[0]} to ${range[1]} of ${total} entries`,
          }}
        />
      </Card>
      <Modal
        title="View Quotation Details"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width="60%" // Adjust modal width if needed
      >
        {/* User Details */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <strong>First Name:</strong> {quotationData.first_name}
          </Col>
          <Col span={12}>
            <strong>Last Name:</strong> {quotationData.last_name}
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <strong>Email:</strong> {quotationData.email}
          </Col>
          <Col span={12}>
            <strong>Phone Number:</strong> {quotationData.phone_number}
          </Col>
        </Row>

        {/* Materials Details */}
        <h3 style={{ marginTop: "20px" }}>Materials</h3>
        {quotationData.materials.length > 0 ? (
          quotationData.materials.map((material) => (
            <div key={material.id} style={{ marginBottom: "20px" }}>
              <Row gutter={[16, 16]} align="middle">
                <Col span={6}>
                  <img
                    src={material.src}
                    alt={material.name}
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "contain",
                    }}
                  />
                </Col>
                <Col span={18}>
                  <Row gutter={[8, 8]}>
                    <Col span={12}>
                      <strong>Material:</strong> {material.name}
                    </Col>
                    <Col span={12}>
                      <strong>Total Price:</strong> ${material.price}
                    </Col>
                    
                  </Row>

                  {/* Room Price Details */}
                  <Row gutter={[8, 8]} style={{ marginTop: "10px" }}>
                    <Col span={24}>
                      <strong>Room Price Details:</strong>
                    </Col>
                    {material.price_details.map((priceDetail) => (
                      <Row key={priceDetail.room_id} gutter={[8, 8]}>
                        <Col span={14}><strong>Room {priceDetail.room_id}:</strong></Col>
                        <Col span={14}>${priceDetail.price}</Col>
                      </Row>
                    ))}
                  </Row>
                </Col>
              </Row>
            </div>
          ))
        ) : (
          <p>No materials available</p>
        )}
      </Modal>
    </div>
  );
}

export default Lead;
