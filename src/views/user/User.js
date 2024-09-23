import React, { useCallback,useEffect, useState } from "react";
import {
  Button,
  Col,
  Row,
  Space,
  Table,
  Input as AntInput,
  Modal,
  Form,
  message,
  Select,
  Spin,
  Switch
} from "antd";
import {
  PlusCircleOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import apiService from "../../services/apiService";
import { debounce } from "lodash"; 
const { Option } = Select;

function User() {
  const [dataSource, setDataSource] = useState({
    loading: false,
    data: [],
    search: "",
    page: 1,
    pageSize: 1,
  });

  const [userData, setUserData] = useState({
    id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    roles: "",
    status: "Inactive",
    errors: [],
    loading: false,
  });
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false); // Separate state for button-specific loading

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
            <EditOutlined />
          </Button>
          <Button
            type="primary"
            shape="circle"
            danger
            onClick={() => handleDelete(record.id)}
          >
            <DeleteOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  const fetchRecords = useCallback(async () => {
    setDataSource((prev) => ({ ...prev, loading: true }));
    try {
      const response = await apiService.get(
        `users/list?page=${dataSource.page}&show=${dataSource.pageSize}&search=${dataSource.search}`
      );
      if(response.status === 200){
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
  },[dataSource.page, dataSource.search,dataSource.pageSize]);

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

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleInput = (e) => {
    e.persist();
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  // Handle select changes
  const handleSelectChange = (value, name) => {
    setUserData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const data = {
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      phone: userData.phone,
      roles: userData.roles,
      status: userData.status,
    };
    try {
      setUserData((prev) => ({ ...prev, loading: true }));
      setButtonLoading(true); // Set button loading to true when the update starts
      const response = await apiService.post("users/save", data);
      if (response.status === 200) {
        message.success(response.data.message);
        handleReset();
        fetchRecords();
        setButtonLoading(false); // Set button loading to false after success
      }
    } catch (error) {
      setUserData((prev) => ({ ...prev, loading: false }));
      setButtonLoading(false); // Set button loading to false on error
      if (error.response) {
        if (error.response.status === 422) {
          setUserData({ ...userData, errors: error.response.data.errors });
        }else if (error.response.status === 500) {
          setUserData({ ...userData, errors:[] });
          message.error(error.response.data.message);
        } else {
          message.error('Something went wrong. Please try again later.');
        }
      }else{
         message.error('Some Problem Occured! Please try again later.');
      }
      
    }
  };

  const handleReset = () => {
    form.resetFields(); // Reset form fields
    setUserData((prev) => ({
      ...prev,
      id: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      roles: "",
      status: "",
      errors: [],
      loading: false
    }));
  };

  const handleCancel = () => {
    form.resetFields();
    setUserData((prev) => ({
      ...prev,
      id: "",
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      roles: "",
      status: "",
      errors: [],
      loading: false
    }));
    setIsModalOpen(false);
  };

  const handleEdit = (row) => {
    form.setFieldsValue({
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      phone: row.phone,
      roles: row.roles[0], // Ensure this matches a value in your Select options
      status: row.status, // Ensure this matches a value in your Select options
    });
    setUserData((prev) => ({
      ...prev,
      id: row._id,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      phone: row.phone,
      roles: row.roles[0],
      status: row.status,
      errors: [],
      loading: false
    }));
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const data = {
      first_name: userData.first_name,
      last_name: userData.last_name,
      email: userData.email,
      phone: userData.phone,
      roles: userData.roles,
      status: userData.status,
    };
    setUserData((prev) => ({ ...prev, loading: true }));
    setButtonLoading(true); // Set button loading to true when the update starts
    try {
      const response = await apiService.post(
        `users/update/${userData.id}`,
        data
      );
      if (response.status === 200) {
        message.success(response.data.message);
        setIsModalOpen(false);
        handleReset();
        fetchRecords();
        setButtonLoading(false); // Set button loading to false after success
      }
    } catch (error) {
        setUserData((prev) => ({ ...prev, loading: false }));
        setButtonLoading(false); // Set button loading to false on error
        if (error.response) {
        if (error.response.status === 422) {
          setUserData({ ...userData, errors: error.response.data.errors });
        }else if (error.response.status === 500) {
          setUserData({ ...userData, errors:[] });
          message.error(error.response.data.message);
        } else {
          message.error('Something went wrong. Please try again later.');
        }
      }else{
         message.error('Some Problem Occured! Please try again later.');
      }
    }
  };

  const handleDelete = async (ids) => {
    Modal.confirm({
      title: "Are you sure you want to delete these records?",
      okType: "danger",
      onOk: async () => {
        // Make an API call to delete multiple records
        try {
          const response = await apiService.post("users/delete", {
            ids: [ids],
          });
          if (response.status === 200) {
            fetchRecords(); // Refresh records after deletion
            message.success(response.data.message);
          }
        } catch (error) {
          if (error.response) {
            if (error.response.status === 422) {
              setUserData({ ...userData, errors: error.response.data.errors });
            }else if (error.response.status === 500) {
              setUserData({ ...userData, errors:[] });
              message.error(error.response.data.message);
            } else {
              message.error('Something went wrong. Please try again later.');
            }
          }else{
             message.error('Some Problem Occured! Please try again later.');
          }
        }
      },
    });
  };

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4 text-gray-800">Users</h1>
      <section className="content">
        <div className="container-fluid">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <Row justify="end" style={{ marginBottom: 16 }}>
                  <Col>
                    <Button
                      type="primary"
                      shape="circle"
                      style={{ backgroundColor: "green", borderColor: "green" }}
                      onClick={showModal}
                    >
                      <PlusCircleOutlined />
                    </Button>
                  </Col>
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
              </div>
            </div>
          </div>
        </div>
      </section>
      <Modal
        title={userData?.id ? "Edit User" : "Add User"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
         <Spin spinning={userData.loading}>
          <Form form={form} layout="vertical">
            <Form.Item
              label={
                <span>
                  First Name <span style={{ color: "red" }}>*</span>
                </span>
              }
              name="first_name"
              validateStatus={userData.errors?.first_name ? "error" : ""}
              help={userData.errors?.first_name?.message} // Display only the error message
            >
              <AntInput
                placeholder="First Name"
                name="first_name"
                value={userData?.first_name}
                onChange={handleInput}
              />
            </Form.Item>
            <Form.Item
              label={
                <span>
                  Last Name <span style={{ color: "red" }}>*</span>
                </span>
              }
              name="last_name"
              validateStatus={userData.errors?.last_name ? "error" : ""}
              help={userData.errors?.last_name?.message} // Display only the error message
            >
              <AntInput
                placeholder="Last Name"
                name="last_name"
                value={userData?.last_name}
                onChange={handleInput}
              />
            </Form.Item>
            <Form.Item
              label={
                <span>
                  Email <span style={{ color: "red" }}>*</span>
                </span>
              }
              name="email"
              validateStatus={userData.errors?.email ? "error" : ""}
              help={userData.errors?.email?.message} // Display only the error message
            >
              <AntInput
                placeholder="Email"
                name="email"
                value={userData?.email}
                onChange={handleInput}
              />
            </Form.Item>
            <Form.Item
              label={
                <span>
                  Phone <span style={{ color: "red" }}>*</span>
                </span>
              }
              name="phone"
              validateStatus={userData.errors?.phone ? "error" : ""}
              help={userData.errors?.phone?.message} // Display only the error message
            >
              <AntInput
                placeholder="Phone"
                name="phone"
                value={userData?.phone}
                onChange={handleInput}
              />
            </Form.Item>
            <Form.Item
              label={
                <span>
                  Role <span style={{ color: "red" }}>*</span>
                </span>
              }
              name="roles"
              validateStatus={userData.errors?.roles ? "error" : ""}
              help={userData.errors?.roles?.message} // Display only the error message
            >
              <Select
                placeholder="Select Roles"
                onChange={(value) => handleSelectChange(value, "roles")} // Handle select change
                value={userData.roles}
              >
                <Option value="user">User</Option>
                <Option value="developer">Developer</Option>
                <Option value="super_admin">Super Admin</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label={
                <span>
                  Status <span style={{ color: "red" }}>*</span>
                </span>
              }
              name="status"
              validateStatus={userData.errors?.status ? "error" : ""}
              help={userData.errors?.status?.message} // Display only the error message
            >
              {/* <Select
                placeholder="Select Status"
                onChange={(value) => handleSelectChange(value, "status")} // Handle select change
                value={userData.status}
              >
                <Option value="Active">Active</Option>
                <Option value="Inactive">Inactive</Option>
              </Select> */}
              <Switch
                checked={userData.status === "Active"} // Set the switch state based on 'Active' or 'Inactive'
                onChange={(checked) =>
                  handleSelectChange(checked ? "Active" : "Inactive", "status")
                } // Handle switch change
               />
            </Form.Item>
            {/* Submit and Reset buttons */}
            <Form.Item
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              {userData?.id ? (
                <Button
                  type="primary"
                  onClick={handleUpdate}
                  style={{ marginRight: 8 }}
                  loading={buttonLoading}  // Show loading spinner when loading is true
                >
                  {buttonLoading ? "Processing..." : "Update"}
                </Button>
              ) : (
                <>
                  <Button
                    type="primary"
                    onClick={handleAdd}
                    style={{ marginRight: 8 }}
                    loading={buttonLoading}  // Show loading spinner when loading is true
                  >
                    {buttonLoading ? "Processing..." : "Save"}
                  </Button>
                  <Button onClick={handleReset}>Reset</Button>
                </>
              )}
            </Form.Item>
          </Form>
         </Spin>
       
      </Modal>
    </div>
  );
}

export default User;
