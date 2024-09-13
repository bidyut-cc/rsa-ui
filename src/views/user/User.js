import React, { useEffect, useState } from "react";
import { Button, Col, Row, Space, Table, Input } from "antd";
import apiService from "../../services/apiService";
import { debounce } from "lodash";

function User() {
  const [dataSource, setDataSource] = useState({
    loading: false,
    data: [],
    search: "",
    page: 1,
    pageSize: 1,
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
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            shape="circle"
            onClick={() => handleEdit(record)}
          >
            <i className="fa fa-edit" aria-hidden="true" />
          </Button>
          <Button danger shape="circle" onClick={() => handleDelete(record.id)}>
            <i className="fa fa-trash" aria-hidden="true" />
          </Button>
        </Space>
      ),
    },
  ];

  const fetchRecords = async () => {
    setDataSource((prev) => ({ ...prev, loading: true }));
    try {
      const response = await apiService.get(
        `users/list?page=${dataSource.page}&show=${dataSource.pageSize}&search=${dataSource.search}`
      );
      setDataSource((prev) => ({
        ...prev,
        loading: false,
        data: response.results,
      }));
    } catch (error) {
      setDataSource((prev) => ({ ...prev, loading: false }));
      console.error("Error fetching profile data:", error);
    }
  };

  const handleDelete = (id) => {
    console.log(id);
  };

  const handleEdit = (row) => {
    console.log(row);
  };

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
  }, [dataSource.page, dataSource.search]);

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4 text-gray-800">Users</h1>
      <section className="content">
        <div className="container-fluid">
          <div className="col-12 ">
            <div className="card">
              <div className="card-body">
                <Row justify="end" style={{ marginBottom: 16 }}>
                  <Col>
                    <Input
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
                    current: dataSource.page, // Explicitly set current page
                    pageSize: dataSource.pageSize,
                    total: dataSource.data.results_count,
                    onChange: (page) => handlePaginate(page),
                    showTotal: (total, range) =>
                      `Showing ${range[0]} to ${range[1]} of ${total} entries`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default User;
