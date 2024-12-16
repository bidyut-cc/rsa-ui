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

function Order({ title }) {
  const [materials, setMaterials] = useState([]);
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
    order_id: "",
    cart_id: "",
    material_id: "",
    quotation_id: "",
    payment_status: "",
    order_status: "",
    createdAt: "",
    paymentDate: "",
    billing_address:{},
    materialName: "",
    materialImage: null,
    errors: [],
    loading: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
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
      render: (status) => {
        if (status) {
          // Capitalize the first letter of each word
          return status
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
        return status; // Return status as is if it's empty or null
      },
    },
    {
      title: "Order Status",
      dataIndex: "order_status",
      key: "order_status",
      render: (status) => {
        if (status) {
          // Capitalize the first letter of each word
          return status
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
        return status; // Return status as is if it's empty or null
      },
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

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleView = (row) => {
    const material = materials.find((mat) => mat.id === Number(row.material_id));
    setOrderData({
      id: row._id,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      phone_number: row.phone_number,
      color: row?.colors[0]?.color,
      amount: row.amount,
      order_id: row.order_id,
      cart_id: row.cart_id,
      material_id: row.material_id,
      quotation_id: row.quotation_id,
      payment_status: row.payment_status,
      order_status: row.order_status,
      createdAt:row.createdAt,
      paymentDate:row.paymentDate,
      billing_address:row.billing_address,
      materialName: material?.name || "Unknown Material",
      materialImage: material?.src || null,
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
      order_id: "",
      cart_id: "",
      material_id: "",
      quotation_id: "",
      payment_status: "",
      order_status:"",
      createdAt: "",
      paymentDate:"",
      billing_address:{},
      materialName: "",
      materialImage: null,
      errors: [],
      loading: false,
    });
    setIsModalOpen(false);
  };
  const capitalizeWords = (text) => {
    if (!text) return text; // Handle null or undefined
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4 text-gray-800">{title}</h1>
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
            showSizeChanger: false, 
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
        <Descriptions.Item label="Color">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {orderData.color ? (
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: orderData.color,
                  border: "1px solid #000",
                  borderRadius: "4px",
                }}
              ></div>
            ) : (
              <span>N/A</span> // Fallback if color is not available
            )}
          </div>
        </Descriptions.Item>
        <Descriptions.Item label="Material">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {orderData.materialImage ? (
            <img
              src={orderData.materialImage}
              alt={orderData.materialName}
              style={{ width: "40px", height: "40px", borderRadius: "4px" }}
            />
          ) : (
            <span>No Image Available</span>
          )}
          <span>{orderData.materialName}</span>
        </div>
      </Descriptions.Item>
        <Descriptions.Item label="Amount">${orderData.amount}</Descriptions.Item>
        <Descriptions.Item label="Order ID">{orderData.order_id}</Descriptions.Item>
        {/* <Descriptions.Item label="Cart ID">{orderData.cart_id}</Descriptions.Item>
        <Descriptions.Item label="Quotation ID">{orderData.quotation_id}</Descriptions.Item> */}
        <Descriptions.Item label="Payment Status">{capitalizeWords(orderData.payment_status)}</Descriptions.Item>
        <Descriptions.Item label="Payment Status">{capitalizeWords(orderData.order_status)}</Descriptions.Item>
        <Descriptions.Item label="Payment Date">{moment(orderData.paymentDate).format('MM-DD-YYYY HH:mm:ss')}</Descriptions.Item>
        <Descriptions.Item label="Billing Details">
        <div>
          <p><b>Name:</b> {orderData.billing_address?.first_name} {orderData.billing_address?.last_name}</p>
          <p><b>Company:</b> {orderData.billing_address?.company || "N/A"}</p>
          <p><b>Street:</b> {orderData.billing_address?.street_1}</p>
          <p><b>City:</b> {orderData.billing_address?.city}</p>
          <p><b>State:</b> {orderData.billing_address?.state}</p>
          <p><b>Zip:</b> {orderData.billing_address?.zip}</p>
          <p><b>Country:</b> {orderData.billing_address?.country}</p>
        </div>
      </Descriptions.Item>
      </Descriptions>
      </Modal>
    </div>
  );
}

export default Order;
