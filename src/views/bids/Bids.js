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
  message,
  Select
} from "antd";
import { EyeOutlined, FileTextOutlined } from "@ant-design/icons";
import moment from "moment";
import React, { useEffect, useState, useCallback } from "react";
import apiService from "../../services/apiService";
import { Link } from "react-router-dom";
import { debounce } from "lodash";


const { Option } = Select;

function Bids({ title }) {
  const [tabData, setTabData] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeMonth, setActiveMonth] = useState("");
  const [selectedBid, setSelectedBid] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Year dropdown
  const currentYear = moment().year();
  const currentMonth = moment();
  const startYear = 2024;
  const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => startYear + i);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Generate months based on selectedYear
  const getMonths = (year) => {
    let monthsArray = [];
    const isCurrentYear = year === currentYear;
    const totalMonths = isCurrentYear ? currentMonth.month() : 11; // 0-indexed

    for (let m = totalMonths; m >= 0; m--) {
      monthsArray.push(moment({ year, month: m }).format("YYYY-MM"));
    }

    if (!isCurrentYear) {
      monthsArray = [];
      for (let m = 11; m >= 0; m--) {
        monthsArray.push(moment({ year, month: m }).format("YYYY-MM"));
      }
    }

    return monthsArray;
  };

  const [months, setMonths] = useState(getMonths(currentYear));

  const formatLabel = (month) => moment(month, "YYYY-MM").format("MMMM");

  // Fetch data from API
  const fetchData = async (
    month,
    page = 1,
    pageSize = 10,
    search = "",
    sortField,
    sortOrder
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        month,
        page,
        show: pageSize,
        search,
      });

      if (sortField) params.append("sort", sortField);
      if (sortOrder) params.append("sort_order", sortOrder);

      const response = await apiService.get(`bids/list?${params.toString()}`);
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
            sortField,
            sortOrder,
          },
        }));
      }
    } catch (err) {
      console.error("Error fetching bids", err);
    } finally {
      setLoading(false);
    }
  };

  // On component mount, load first month
  useEffect(() => {
    const firstMonth = months[0];
    setActiveMonth(firstMonth);
    fetchData(firstMonth, 1, 10, "");
  }, [months]);

  // Debounced search
  const handleSearch = useCallback(
    debounce((value) => {
      const monthData = tabData[activeMonth] || {};
      fetchData(
        activeMonth,
        1,
        monthData.pageSize || 10,
        value,
        monthData.sortField,
        monthData.sortOrder
      );
    }, 500),
    [activeMonth, tabData]
  );

  // Year change
  const handleYearChange = (year) => {
    setSelectedYear(year);
    const newMonths = getMonths(year);
    setMonths(newMonths);
    setActiveMonth(newMonths[0]);
    fetchData(newMonths[0], 1, 10, "");
  };

  // View bid modal
  const handleView = (record) => {
    setSelectedBid(record);
    setIsModalOpen(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedBid(null);
  };

  // Export CSV
  const handleExport = async (month) => {
    try {
      const monthData = tabData[month] || { search: "", sortField: undefined, sortOrder: undefined };
      const search = monthData.search || "";
      const sortField = monthData.sortField;
      const sortOrder = monthData.sortOrder;
      const formattedMonth = moment(month, "YYYY-MM").format("MMMM-YYYY");

      const params = new URLSearchParams({
        month,
        search,
        filename: `Bids-${formattedMonth}`,
      });
      if (sortField) params.append("sort", sortField);
      if (sortOrder) params.append("sort_order", sortOrder);

      const response = await apiService.get(`bids/export?${params.toString()}`, {
        responseType: "arraybuffer",
      });

      const blob = new Blob([response.data], { type: "text/csv" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute("download", `Bids-${formattedMonth}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export failed:", err);
      message.error("Export failed");
    }
  };

  const columns = [
    { title: "Sl No.", key: "index", render: (text, record, index) => index + 1 },
    { title: "Project Name", dataIndex: "name", key: "name" },
    { title: "Project Size", dataIndex: "projectSize", key: "projectSize" },
    { title: "Trade Name", dataIndex: "tradeName", key: "tradeName" },
    { title: "Client Name", dataIndex: "client", key: "client", render: (val) => `${val?.lead?.firstName || ""} ${val?.lead?.lastName || ""}` },
    {
      title: "Smart Bid Score",
      dataIndex: "smartBidScore",
      key: "smartBidScore",
      render: (val) => `${val ?? 0}%`,
      sorter: true,
     // showSorterTooltip:false
    },
    {
      title: "Dead Line",
      dataIndex: "deadline",
      key: "deadline",
      render: (val) => val ? moment(val).format("MM-DD-YYYY") : ""
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (val) => val ? moment(val).format("MM-DD-YYYY") : ""
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View">
            <Button type="primary" shape="circle" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          </Tooltip>
        </Space>
      )
    }
  ];

  // Tabs
  const tabItems = months.map((month) => {
    const monthData = tabData[month] || {
      page: 1,
      pageSize: 10,
      search: "",
      data: [],
      total: 0,
      sortField: undefined,
      sortOrder: undefined
    };

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
                  style={{ backgroundColor: "#28a745", border: "none", borderRadius: 6, fontWeight: 500, padding: "0 16px" }}
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
                fetchData(month, page, pageSize, monthData.search, monthData.sortField, monthData.sortOrder),
              showSizeChanger: false,
              showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`
            }}
            onChange={(pagination, filters, sorter) => {
              let sortField = undefined;
              let sortOrder = undefined;

              if (sorter && sorter.field && sorter.order) {
                sortField = sorter.field;
                sortOrder = sorter.order === "ascend" ? "asc" : "desc";
              }

              fetchData(month, monthData.page, monthData.pageSize, monthData.search, sortField, sortOrder);
            }}
          />
        </>
      )
    };
  });

  return (
    <div className="container-fluid">
      <Breadcrumb
        style={{ marginBottom: "16px" }}
        items={[{ title: <Link to="/dashboard">Home</Link> }, { title: "Bids Console" }]}
      />
      <h1 className="h3 mb-4 text-gray-800">{title}</h1>

      <Card>
        <Row justify="end" style={{ marginBottom: 16 }}>
          <Col>
            <Select value={selectedYear} onChange={handleYearChange} style={{ width: 120 }}>
              {years.map((year) => (
                <Option key={year} value={year}>{year}</Option>
              ))}
            </Select>
          </Col>
        </Row>

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
      <Modal title="View Bid Details" open={isModalOpen} onCancel={handleCancel} footer={null} width="50%">
        {selectedBid && (
          <Descriptions bordered column={1} size="middle">
            <Descriptions.Item label="Project Name">{selectedBid?.name}</Descriptions.Item>
            <Descriptions.Item label="Project Size">{selectedBid?.projectSize || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Project Information">
              <div dangerouslySetInnerHTML={{ __html: selectedBid?.projectInformation || "N/A" }} />
            </Descriptions.Item>
            <Descriptions.Item label="Location">{selectedBid?.location?.complete || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Client Name">{selectedBid?.client?.lead?.firstName} {selectedBid?.client?.lead?.lastName}</Descriptions.Item>
            <Descriptions.Item label="Client Email">{selectedBid?.client?.lead?.email}</Descriptions.Item>
            <Descriptions.Item label="Trade Name">{selectedBid?.tradeName}</Descriptions.Item>
            <Descriptions.Item label="Smart Bid Score">{selectedBid?.smartBidScore !== undefined ? `${selectedBid.smartBidScore}%` : "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Link URL">
              {selectedBid?.opportunities_id ? (
                <a href={`https://app.buildingconnected.com/opportunities/${selectedBid.opportunities_id}/info`} target="_blank" rel="noopener noreferrer">
                  {`https://app.buildingconnected.com/opportunities/${selectedBid.opportunities_id}/info`}
                </a>
              ) : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Dead Line">{moment(selectedBid?.deadline).format("MM-DD-YYYY")}</Descriptions.Item>
            <Descriptions.Item label="Created At">{moment(selectedBid.createdAt).format("MM-DD-YYYY")}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}

export default Bids;
