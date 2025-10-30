import {
  Tabs,
  Table,
  Card,
  Breadcrumb,
  Row,
  Col,
  Input as AntInput,
  Space,
  Button,
  Tooltip,
  Modal,
  Descriptions,
  Form,
  Spin,
  message
  
} from "antd";
import { EyeOutlined,FileTextOutlined,EditOutlined } from "@ant-design/icons";
import moment from "moment";
import React, { useEffect, useState, useCallback } from "react";
import apiService from "../../services/apiService";
import { Link } from "react-router-dom";
import { debounce } from "lodash";

function Bids({ title }) {
  const [tabData, setTabData] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeMonth, setActiveMonth] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [buttonLoading, setButtonLoading] = useState(false);



  const months = Array.from({ length: 6 }, (_, i) =>
    moment().subtract(i, "months").format("YYYY-MM")
  );

  const formatLabel = (month) => moment(month, "YYYY-MM").format("MMMM YYYY");

  const fetchData = async (month, page = 1, pageSize = 10, search = "") => {
    setLoading(true);
    try {
      const response = await apiService.get(
        `bids/list?month=${month}&page=${page}&show=${pageSize}&search=${search}`
      );
      if (response.status === 200) {
        const results = response.data?.results?.results || {};
        setTabData((prev) => ({
          ...prev,
          [month]: {
            page,
            pageSize,
            search,
            data: results.data || [],
            total: results.count || 0,
          },
        }));
      }
    } catch (err) {
      console.error("Error fetching bids", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentMonth = months[0];
    setActiveMonth(currentMonth);
    fetchData(currentMonth, 1, 10, "");
  }, []);

  // Debounced search
  const handleSearch = useCallback(
    debounce((value) => {
      fetchData(activeMonth, 1, tabData[activeMonth]?.pageSize || 10, value);
    }, 500),
    [activeMonth, tabData]
  );

  const handleView = (record) => {
    setSelectedBid(record);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedBid(null);
  };

  const handleExport = async (month) => {
    try {
      // Get the search value for this month from tabData
    const monthData = tabData[month] || { search: "" };
    const search = monthData.search || "";
    // Format month for filename
    const formattedMonth = moment(month, "YYYY-MM").format("MMMM-YYYY");
      const response = await apiService.get(
        `bids/export?month=${month}&search=${search}&filename=Bids-${formattedMonth}`,
        { responseType: "arraybuffer" } // important for binary
      );
  
      const blob = new Blob([response.data], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute("download", `Bids-${formattedMonth}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (err) {
      console.error("Export failed:", err);
    }
  };
  
  
  const handleEdit = (record) => {
    setSelectedBid(record);
    form.setFieldsValue({
      name: record.name,
      projectSize: record.projectSize,
      tradeName: record.tradeName,
      client: record?.client?.company?.name,
      smartBidScore: record.smartBidScore,
      status: record.status || "Active",
    });
    setIsEditModalOpen(true);
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setSelectedBid(null);
    form.resetFields();
  };

  const handleUpdateBid = async () => {
    try {
      setButtonLoading(true);
      const values = await form.validateFields();
      const response = await apiService.put(`bids/update/${selectedBid._id}`, values);
      console.log(response.data);
      // Refresh table
      fetchData(
        activeMonth,
        tabData[activeMonth]?.page || 1,
        tabData[activeMonth]?.pageSize || 10,
        tabData[activeMonth]?.search || ""
      );
      handleCancelEdit();
      message.success(response.message);
    } catch (err) {
      message.error("Something went wrong. Please try again later.");
      console.error("Update failed:", err);
    } finally {
      setButtonLoading(false);
    }
  };

  
  
  
  
  
  
  
  
  
  
  

  const columns = [
    { title: "Sl No.", key: "index", render: (text, record, index) => index + 1 },
    { title: "Project Name", dataIndex: "name", key: "name" },
    { title: "Project Size", dataIndex: "projectSize", key: "projectSize" },
    { title: "Trade Name", dataIndex: "tradeName", key: "tradeName" },
    { title: "Client Name", dataIndex: "client", key: "client",render: (val) => `${val?.lead?.firstName} ${val?.lead.lastName}`, },
    { title: "Smart Bid Score", dataIndex: "smartBidScore", key: "smartBidScore",render: (val) => `${val}%`, },
    {
      title: "Dead Line",
      dataIndex: "deadline",
      key: "deadline",
      render: (val) =>(
        <span style={{ whiteSpace: "nowrap" }}>
              {
                    val
                    ? moment(val).format("MM-DD-YYYY")
                    : ""
              }
        </span>
      )
  
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val) =>(
        <span style={{ whiteSpace: "nowrap" }}>
              {
                    val
                    ? moment(val).format("MM-DD-YYYY")
                    : ""
              }
        </span>
      )
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View">
            <Button
              type="primary"
              shape="circle"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const tabItems = months.map((month) => {
    const monthData = tabData[month] || { page: 1, pageSize: 10, search: "", data: [], total: 0 };

    return {
      key: month,
      label: formatLabel(month),
      children: (
        <>
          <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
            <Col>
              <Space>
                <Button
                  type="primary"
                  icon={<FileTextOutlined />}
                  style={{
                    backgroundColor: "#28a745",
                    border: "none",
                    borderRadius: 6,
                    fontWeight: 500,
                    padding: "0 16px",
                    display: "flex",
                    alignItems: "center",
                  }}
                  onClick={() => handleExport(month)}
                >
                  Export CSV
                </Button>
              </Space>
            </Col>
            <Col>
              <AntInput
                placeholder="Search..."
                allowClear
                style={{ width: 220 }}
                defaultValue={monthData.search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </Col>
         </Row>

  <Table
    columns={columns}
    dataSource={monthData.data}
    loading={loading && activeMonth === month}
    rowKey="_id"
    pagination={{
      current: monthData.page,
      pageSize: monthData.pageSize,
      total: monthData.total,
      onChange: (page, pageSize) =>
        fetchData(month, page, pageSize, monthData.search),
      showSizeChanger: false,
      showTotal: (total, range) =>
        `Showing ${range[0]} to ${range[1]} of ${total} entries`,
    }}
  />
        </>
      ),
    };
  });

  return (
    <div className="container-fluid">
      <Breadcrumb
        style={{ marginBottom: "16px" }}
        items={[
          { title: <Link to="/dashboard">Home</Link> },
          { title: "Bids Console" },
        ]}
      />
      <h1 className="h3 mb-4 text-gray-800">{title}</h1>
      <Card>
        <Tabs
          activeKey={activeMonth}
          type="card"
          items={tabItems}
          onChange={(month) => {
            setActiveMonth(month);
            if (!tabData[month]) fetchData(month, 1, 10, "");
          }}
        />
      </Card>

      {/* View Modal */}
      <Modal
        title="View Bid Details"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width="50%"
      >
        {selectedBid && (
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="Project Name">{selectedBid?.name}</Descriptions.Item>
            <Descriptions.Item label="Project Size">{selectedBid?.projectSize || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Project Information">
              <div
                dangerouslySetInnerHTML={{
                  __html: selectedBid?.projectInformation || "N/A",
                }}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Location">
              {selectedBid?.location?.complete || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Client Name">{selectedBid?.client?.lead?.firstName} {selectedBid?.client?.lead?.lastName}</Descriptions.Item>
            <Descriptions.Item label="Client Email">{selectedBid?.client?.lead?.email}</Descriptions.Item>
            <Descriptions.Item label="Trade Name">{selectedBid?.tradeName}</Descriptions.Item>
            <Descriptions.Item label="Smart Bid Score">
              {selectedBid?.smartBidScore !== undefined && selectedBid?.smartBidScore !== null
                ? `${selectedBid.smartBidScore}%`
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Link URL">
                {selectedBid?.opportunities_id ? (
                  <a
                    href={`https://app.buildingconnected.com/opportunities/${selectedBid.opportunities_id}/info`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {`https://app.buildingconnected.com/opportunities/${selectedBid.opportunities_id}/info`}
                  </a>
                ) : (
                  "N/A"
                )}
              </Descriptions.Item>

            <Descriptions.Item label="Dead Line">{moment(selectedBid?.deadline).format("MM-DD-YYYY")}</Descriptions.Item>
            <Descriptions.Item label="Created At">
              {moment(selectedBid.createdAt).format("MM-DD-YYYY")}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Bid"
        open={isEditModalOpen}
        onCancel={handleCancelEdit}
        footer={null}
      >
        <Spin spinning={buttonLoading}>
          <Form form={form} layout="vertical">
            <Form.Item
              label="Project Name"
              name="name"
              rules={[{ required: true, message: "Project Name is required" }]}
            >
              <AntInput placeholder="Project Name" />
            </Form.Item>

            <Form.Item
              label="Project Size"
              name="projectSize"
              rules={[{ required: true, message: "Project Size is required" }]}
            >
              <AntInput placeholder="Project Size" />
            </Form.Item>

            <Form.Item
              label="Trade Name"
              name="tradeName"
              rules={[{ required: true, message: "Trade Name is required" }]}
            >
              <AntInput placeholder="Trade Name" />
            </Form.Item>

            <Form.Item
              label="Client"
              name="client"
              rules={[{ required: true, message: "Client is required" }]}
            >
              <AntInput placeholder="Client" />
            </Form.Item>

            <Form.Item
              label="Smart Bid Score"
              name="smartBidScore"
              rules={[{ required: true, message: "Smart Bid Score is required" }]}
            >
              <AntInput placeholder="Smart Bid Score %" />
            </Form.Item>

            <Form.Item style={{ display: "flex", justifyContent: "center" }}>
              <Button type="primary" onClick={handleUpdateBid} loading={buttonLoading}>
                {buttonLoading ? "Processing..." : "Update"}
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={handleCancelEdit}>
                Cancel
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    </div>
  );
}

export default Bids;
