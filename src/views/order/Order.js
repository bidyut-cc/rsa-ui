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
import { EyeOutlined } from "@ant-design/icons";
import apiService from "../../services/apiService";
import { debounce } from "lodash";

function Order() {
  const [dataSource, setDataSource] = useState({
    loading: false,
    data: [],
    search: "",
    page: 1,
    pageSize: 10,
  });



  const columns = [
    {
      title: "Sl No.",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
        title: "Order Id",
        dataIndex: "order_id",
        key: "order_id",
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
    },
    {
        title: "Payment Status",
        dataIndex: "payment_status",
        key: "payment_status",
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            shape="circle"
           // onClick={() => handleView(record)}
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
     
    </div>
  );
}

export default Order;
