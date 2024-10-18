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
  Descriptions
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import apiService from "../../services/apiService";
import { debounce } from "lodash";
import moment from 'moment';

function Order() {
  const [dataSource, setDataSource] = useState({
    loading: false,
    data: [],
    search: "",
    page: 1,
    pageSize: 10,
  });

  const [orderData, setOrderData] = useState({
    id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    color: "",
    amount: "",
    transaction_id: "",
    order_id: "",
    cart_id: "",
    material_id: "",
    quotation_id: "",
    payment_status: "",
    createdAt: "",
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
        title: "Order Total",
        dataIndex: "amount",
        key: "amount",
        render: (amount) => `$${amount}`,
    },
    {
        title: "Payment Status",
        dataIndex: "payment_status",
        key: "payment_status",
    },
    {
      title: "Order Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => moment(date).format('MM-DD-YYYY HH:mm:ss'),
  },
    {
      title: "Action",
      render: (_, record) => (
        <Space size="middle">
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
        `orders/list?page=${dataSource.page}&show=${dataSource.pageSize}&search=${dataSource.search}`
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
    setOrderData({
      id: row._id,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      phone_number: row.phone_number,
      color: row.color,
      amount: row.amount,
      transaction_id: row.transaction_id,
      order_id: row.order_id,
      cart_id: row.cart_id,
      material_id: row.material_id,
      quotation_id: row.quotation_id,
      payment_status: row.payment_status,
      createdAt:row.createdAt,
      errors: [],
      loading: false,
    });
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setOrderData({
      id: "",
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      color: "",
      amount: "",
      transaction_id: "",
      order_id: "",
      cart_id: "",
      material_id: "",
      quotation_id: "",
      payment_status: "",
      createdAt: "",
      errors: [],
      loading: false,
    });
    setIsModalOpen(false);
  };
  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4 text-gray-800">Orders</h1>
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
        title="View Order Details"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width="50%" // Adjust modal width if needed
      >
      <Descriptions bordered column={1} size="middle">
        <Descriptions.Item label="Name">{orderData.first_name} {orderData.last_name}</Descriptions.Item>
        <Descriptions.Item label="Email">{orderData.email}</Descriptions.Item>
        <Descriptions.Item label="Phone Number">{orderData.phone_number}</Descriptions.Item>
        <Descriptions.Item label="Color">{orderData.color}</Descriptions.Item>
        <Descriptions.Item label="Amount">${orderData.amount}</Descriptions.Item>
        <Descriptions.Item label="Transaction ID">{orderData.transaction_id}</Descriptions.Item>
        <Descriptions.Item label="Order ID">{orderData.order_id}</Descriptions.Item>
        <Descriptions.Item label="Cart ID">{orderData.cart_id}</Descriptions.Item>
        <Descriptions.Item label="Quotation ID">{orderData.quotation_id}</Descriptions.Item>
        <Descriptions.Item label="Payment Status">{orderData.payment_status}</Descriptions.Item>
        <Descriptions.Item label="Payment Date">{moment(orderData.createdAt).format('MM-DD-YYYY HH:mm:ss')}</Descriptions.Item>
      </Descriptions>
      </Modal>
    </div>
  );
}

export default Order;
