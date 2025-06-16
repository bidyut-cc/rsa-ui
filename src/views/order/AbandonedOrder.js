import React, { useCallback, useEffect, useState } from "react";
import {
  Col,
  Row,
  Table,
  Input as AntInput,
  message,
  Card,
  Breadcrumb
} from "antd";
import apiService from "../../services/apiService";
import { debounce } from "lodash";
import moment from 'moment';
import { Link } from "react-router-dom";

function AbandonedOrder({ title }) {
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
      title: "First Name",
      dataIndex: "first_name",
      key: "first_name",
      render: (text, record) => `${record.orders_data[0].first_name}`,
    },
    {
      title: "Last Name",
      dataIndex: "last_name",
      key: "last_name",
      render: (text, record) => `${record.orders_data[0].last_name}`,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (text, record) => `${record.orders_data[0].email}`,
    },
    {
      title: "Phone",
      dataIndex: "phone_number",
      key: "phone_number",
      render: (text, record) => {
        const phone = record.orders_data?.[0]?.phone_number;
        if (!phone) return "N/A";
    
        const cleaned = ("" + phone).replace(/\D/g, "");
        if (cleaned.length === 10) {
          return (
            <span style={{ whiteSpace: "nowrap" }}>
              {cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")}
            </span>
          );
        }
        return <span style={{ whiteSpace: "nowrap" }}>{phone}</span>;
      },
    },
    {
        title: "Quote Amount",
        dataIndex: "cart_amount",
        key: "cart_amount",
        render: (amount) => `$${Number(amount).toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
    },
    {
      title: "Order Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => moment(date).format('MM-DD-YYYY hh:mm:ss A'),
  },

  ];

  const fetchRecords = useCallback(async () => {
    setDataSource((prev) => ({ ...prev, loading: true }));
    try {
      const response = await apiService.get(
        `orders/abandonedOrders?page=${dataSource.page}&show=${dataSource.pageSize}&search=${dataSource.search}`
      );
      if (response.status === 200) {
        console.log(response.data.results);
        setDataSource((prev) => ({
          ...prev,
          loading: false,
          data: response.data.results,
        }));
      }
    } catch (error) {
      message.error(error?.response?.statusText);
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




  

  
  const capitalizeWords = (text) => {
    if (!text) return text; // Handle null or undefined
    return text
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  const formatPhoneNumber = (phone) => {
    if (!phone) return "N/A";
  
    // Remove non-numeric characters
    const cleaned = ("" + phone).replace(/\D/g, "");
  
    // Format as (123) 456-7890
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
  
    return phone; // Return original if format is unknown
  };
  
  return (
    <div className="container-fluid">
      <Breadcrumb
      style={{ marginBottom: "16px" }}
      items={[
        {
          title: <Link to="/dashboard">Home</Link>,
        },
        {
          title: "Abandoned Orders",
        },
      ]}
    />
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
     
    </div>
  );
}

export default AbandonedOrder;
