import React, { useCallback, useEffect, useState } from "react";
import moment from "moment";
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
  Descriptions,
  Image,
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import apiService from "../../services/apiService";
import { debounce } from "lodash";



function Log({ title }) {
  const [dataSource, setDataSource] = useState({
    loading: false,
    data: [],
    search: "",
    page: 1,
    pageSize: 10,
  });

  const [logData, setLogData] = useState({
    log:{}
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    {
      title: "Sl No.",
      key: "index",
      render: (text, record, index) => index + 1,
    },
   
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      render: (message, record, index) => {
        if (record.modelName === "Setting") {
          if (record.message && record.message.includes("price")) {
            return (
              <span>
                {record.user.username} has <strong>{record.event}</strong> the <strong>{record.message}</strong>{" "}
                settings.
              </span>
            );
          }else{
            // Replace underscores with spaces and capitalize the first letter
            const formattedStep = record.currentData.step
            .replace(/_/g, " ") // Replace underscores with spaces
            .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letters

          return (
            <span>
              {record.user.username} has <strong>{record.event}</strong> the <strong>{formattedStep}</strong>{" "}
              settings.
            </span>
          );
          }
       
        } else if (record.modelName === "User") {
          if (record.event === "deleted") {
            return <span>{record.user.username} <strong>{record.event}</strong> <strong>{record.previousData.username}'s </strong>account.</span>;
          }else if (record.event === "updated"){
            if(record.message === "Profile" || record.message === "Password"){
              return <span>{record.user.username} has <strong>{record.event}</strong> his <strong>{record.message}.</strong></span>;
            }else{
               return <span>{record.user.username} <strong>{record.event}</strong> <strong>{record.previousData?.username}'s </strong>account.</span>;
            }
          }else if(record.event === "saved"){
            return <span>{record.user.username} <strong>created</strong> a new user : <strong>{record.currentData?.username}</strong></span>;
          }else{
            return <span>{record.user.username} has <strong>{record.message}</strong></span>;
          }
         
        } else {
          return <span>{record.user.username} <strong>{record.message}</strong></span>;
        }
      },
    },
    
    {
      title: "Created By",
      dataIndex: "Created By",
      render: (text, record, index) => record.user.username,
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text) => (text ? moment(text).format("YYYY-MM-DD HH:mm:ss") : "-"),
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
// Function to format the message based on the logic in columns render
const formatLogMessage = (record) => {
  if (record.modelName === "Setting") {
    if (record.message && record.message.includes("price")) {
      return `${record.user.username} has ${record.event} the ${record.message} settings.`;
    } else {
      const formattedStep = record.currentData.step
        .replace(/_/g, " ") // Replace underscores with spaces
        .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letters
      return `${record.user.username} has ${record.event} the ${formattedStep} settings.`;
    }
  } else if (record.modelName === "User") {
    if (record.event === "deleted") {
      return `${record.user.username} ${record.event} ${record.previousData.username}'s account.`;
    } else if (record.event === "updated") {
      if (record.message === "Profile" || record.message === "Password") {
        return `${record.user.username} has ${record.event} his ${record.message}.`;
      } else {
        return `${record.user.username} ${record.event} ${record.previousData?.username}'s account.`;
      }
    } else if (record.event === "saved") {
      return `${record.user.username} created a new user: ${record.currentData?.username}`;
    } else {
      return `${record.user.username} has ${record.message}`;
    }
  } else {
    return `${record.user.username} ${record.message}`;
  }
};
  const fetchRecords = useCallback(async () => {
    setDataSource((prev) => ({ ...prev, loading: true }));
    try {
      const response = await apiService.get(
        `changelogs/list?page=${dataSource.page}&show=${dataSource.pageSize}&search=${dataSource.search}`
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
    const formattedMessage = formatLogMessage(row);
    setLogData({
      log: {
        ...row,
        formattedMessage: formattedMessage,  // Set the formatted message
      }
    });
    setIsModalOpen(true);
  };


  const handleCancel = () => {
    setLogData({
      log:{}
    });
    setIsModalOpen(false);
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
      title="Log Details"
      open={isModalOpen}
      onCancel={handleCancel}
      footer={null}
      width="50%"
    >
      <Descriptions bordered column={1} size="middle">
        <Descriptions.Item label="Created By">
          {logData?.log?.user?.username || "Not Available"}
        </Descriptions.Item>
        <Descriptions.Item label="Created Date">
          { moment(logData?.log?.createdAt).format("YYYY-MM-DD HH:mm:ss") || "Not Available"}
        </Descriptions.Item>
        <Descriptions.Item label="Message">
      {logData?.log?.formattedMessage || "Not Available"}
    </Descriptions.Item>
      </Descriptions>

      {logData?.log?.previousData?.step === "project" && (
    <>
      {/* Previous Data Section */}
      <Descriptions
        title="Previous Data"
        bordered
        column={1}
        size="small"
        style={{ marginTop: "20px" }}
      >
        {logData?.log?.previousData?.config &&
          Object.keys(logData.log.previousData.config).map((key) => (
            <Descriptions.Item
              label={key
                .replace(/_/g, " ") // Replace underscores with spaces
                .replace(/\b\w/g, (char) => char.toUpperCase())} // Capitalize each word
              key={`previous-${key}`}
            >
              {logData.log.previousData.config[key] || "Not Available"}
            </Descriptions.Item>
          ))}
      </Descriptions>

      {/* Current Data Section */}
      <Descriptions
        title="Current Data"
        bordered
        column={1}
        size="small"
        style={{ marginTop: "20px" }}
      >
        {logData?.log?.currentData?.config &&
          Object.keys(logData.log.currentData.config).map((key) => (
            <Descriptions.Item
              label={key
                .replace(/_/g, " ") // Replace underscores with spaces
                .replace(/\b\w/g, (char) => char.toUpperCase())} // Capitalize each word
              key={`current-${key}`}
            >
              {logData.log.currentData.config[key] || "Not Available"}
            </Descriptions.Item>
          ))}
      </Descriptions>
    </>
  )}
  {logData?.log?.previousData?.step === "layout" && (
    <>
      {/* Previous Data Section */}
      <Descriptions
        title="Previous Data"
        bordered
        column={1}
        size="small"
        style={{ marginTop: "20px" }}
      >
        <Descriptions.Item label="Show Handicap Accessible Stall">
          {logData?.log?.previousData?.config?.show_handicap_accessible_stall || "Not Available"}
        </Descriptions.Item>
        <Descriptions.Item label="Layouts">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {logData?.log?.previousData?.config?.layouts?.map((layout) => (
              <div
                key={`previous-layout-${layout.id}`}
                style={{
                  border: "1px solid #ddd",
                  padding: "10px",
                  textAlign: "center",
                  width: "calc(25% - 10px)",  // Ensures 4 images per row
                  boxSizing: "border-box",
                }}
              >
                <Image
                  width={30}
                  src={layout.src}
                  preview={false}
                  alt={layout.name}
                  style={{ marginBottom: "8px" }}
                />
                <div>{layout.name}</div>
              </div>
            ))}
          </div>
        </Descriptions.Item>
      </Descriptions>

      {/* Current Data Section */}
      <Descriptions
        title="Current Data"
        bordered
        column={1}
        size="small"
        style={{ marginTop: "20px" }}
      >
        <Descriptions.Item label="Show Handicap Accessible Stall">
          {logData?.log?.currentData?.config?.show_handicap_accessible_stall || "Not Available"}
        </Descriptions.Item>
        <Descriptions.Item label="Layouts">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {logData?.log?.currentData?.config?.layouts?.map((layout) => (
              <div
                key={`current-layout-${layout.id}`}
                style={{
                  border: "1px solid #ddd",
                  padding: "10px",
                  textAlign: "center",
                  width: "calc(25% - 10px)",  // Ensures 4 images per row
                  boxSizing: "border-box",
                }}
              >
                <Image
                  width={30} // Adjust image to fit within the layout
                  src={layout.src}
                  preview={false}
                  alt={layout.name}
                  style={{ marginBottom: "8px" }}
                />
                <div>{layout.name}</div>
              </div>
            ))}
          </div>
        </Descriptions.Item>
      </Descriptions>
    </>
  )}
  {logData?.log?.previousData?.step === "measurement" && (
  <>
    {/* Previous Data Section */}
    <Descriptions
      title="Previous Data"
      bordered
      column={1}
      size="small"
      style={{ marginTop: "20px" }}
    >
      <Descriptions.Item label="ADA Stall Min Width">
        {logData?.log?.previousData?.config?.ada_stall_min_width || "Not Available"}
      </Descriptions.Item>
      <Descriptions.Item label="ADA Stall Max Width">
        {logData?.log?.previousData?.config?.ada_stall_max_width || "Not Available"}
      </Descriptions.Item>
      <Descriptions.Item label="Standard Stall Min Width">
        {logData?.log?.previousData?.config?.standard_stall_min_width || "Not Available"}
      </Descriptions.Item>
      <Descriptions.Item label="Standard Stall Max Width">
        {logData?.log?.previousData?.config?.standard_stall_max_width || "Not Available"}
      </Descriptions.Item>
      <Descriptions.Item label="ADA Stall Min Depth">
        {logData?.log?.previousData?.config?.ada_stall_min_depth || "Not Available"}
      </Descriptions.Item>
      <Descriptions.Item label="ADA Stall Max Depth">
        {logData?.log?.previousData?.config?.ada_stall_max_depth || "Not Available"}
      </Descriptions.Item>
      <Descriptions.Item label="Standard Stall Min Depth">
        {logData?.log?.previousData?.config?.standard_stall_min_depth || "Not Available"}
      </Descriptions.Item>
      <Descriptions.Item label="Standard Stall Max Depth">
        {logData?.log?.previousData?.config?.standard_stall_max_depth || "Not Available"}
      </Descriptions.Item>
      <Descriptions.Item label="ADA Stall Min Door Opening">
        {logData?.log?.previousData?.config?.ada_stall_min_door_opening || "Not Available"}
      </Descriptions.Item>
      <Descriptions.Item label="ADA Stall Max Door Opening">
        {logData?.log?.previousData?.config?.ada_stall_max_door_opening || "Not Available"}
      </Descriptions.Item>
      <Descriptions.Item label="Standard Stall Min Door Opening">
        {logData?.log?.previousData?.config?.standard_stall_min_door_opening || "Not Available"}
      </Descriptions.Item>
      <Descriptions.Item label="Standard Stall Max Door Opening">
        {logData?.log?.previousData?.config?.standard_stall_max_door_opening || "Not Available"}
      </Descriptions.Item>
      <Descriptions.Item label="Maximum Room No">
        {logData?.log?.previousData?.config?.maximum_room_no || "Not Available"}
      </Descriptions.Item>

      {/* Door Swing Options for Previous Data */}
      <Descriptions.Item label="Door Swing Types">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {logData?.log?.previousData?.config?.swings?.map((swing) => (
            <div
              key={`swing-prev-${swing.id}`}
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                textAlign: "center",
                width: "calc(25% - 10px)",  // Ensures 4 items per row
                boxSizing: "border-box",
              }}
            >
              <div>{swing.name}</div>
            </div>
          ))}
        </div>
      </Descriptions.Item>
    </Descriptions>

    {/* Current Data Section */}
    <Descriptions
      title="Current Data"
      bordered
      column={1}
      size="small"
      style={{ marginTop: "20px" }}
    >
      <Descriptions.Item label="ADA Stall Min Width">
        {logData?.log?.currentData?.config?.ada_stall_min_width || "Not Available"}
      </Descriptions.Item>
      <Descriptions.Item label="ADA Stall Max Width">
        {logData?.log?.currentData?.config?.ada_stall_max_width || "Not Available"}
      </Descriptions.Item>
      <Descriptions.Item label="Standard Stall Min Width">
        {logData?.log?.currentData?.config?.standard_stall_min_width || "Not Available"}
      </Descriptions.Item>
      <Descriptions.Item label="Standard Stall Max Width">
        {logData?.log?.currentData?.config?.standard_stall_max_width || "Not Available"}
      </Descriptions.Item>
      <Descriptions.Item label="ADA Stall Min Depth">
        {logData?.log?.currentData?.config?.ada_stall_min_depth || "Not Available"}
      </Descriptions.Item>
      <Descriptions.Item label="ADA Stall Max Depth">
        {logData?.log?.currentData?.config?.ada_stall_max_depth || "Not Available"}
      </Descriptions.Item>
      <Descriptions.Item label="Standard Stall Min Depth">
        {logData?.log?.currentData?.config?.standard_stall_min_depth || "Not Available"}
      </Descriptions.Item>
      <Descriptions.Item label="Standard Stall Max Depth">
        {logData?.log?.currentData?.config?.standard_stall_max_depth || "Not Available"}
      </Descriptions.Item>
      <Descriptions.Item label="ADA Stall Min Door Opening">
        {logData?.log?.currentData?.config?.ada_stall_min_door_opening || "Not Available"}
      </Descriptions.Item>
      <Descriptions.Item label="ADA Stall Max Door Opening">
        {logData?.log?.currentData?.config?.ada_stall_max_door_opening || "Not Available"}
      </Descriptions.Item>
      <Descriptions.Item label="Standard Stall Min Door Opening">
        {logData?.log?.currentData?.config?.standard_stall_min_door_opening || "Not Available"}
      </Descriptions.Item>
      <Descriptions.Item label="Standard Stall Max Door Opening">
        {logData?.log?.currentData?.config?.standard_stall_max_door_opening || "Not Available"}
      </Descriptions.Item>
      <Descriptions.Item label="Maximum Room No">
        {logData?.log?.currentData?.config?.maximum_room_no || "Not Available"}
      </Descriptions.Item>

      {/* Door Swing Options for Current Data */}
      <Descriptions.Item label="Door Swing Types">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {logData?.log?.currentData?.config?.swings?.map((swing) => (
            <div
              key={`swing-cur-${swing.id}`}
              style={{
                border: "1px solid #ddd",
                padding: "10px",
                textAlign: "center",
                width: "calc(25% - 10px)",  // Ensures 4 items per row
                boxSizing: "border-box",
              }}
            >
              <div>{swing.name}</div>
            </div>
          ))}
        </div>
      </Descriptions.Item>
    </Descriptions>
  </>
)}
{logData?.log?.previousData?.step === "color" && (
  <>
    {/* Previous Data Section */}
    <Descriptions
      title="Previous Data"
      bordered
      column={1}
      size="small"
      style={{ marginTop: "20px" }}
    >
      <Descriptions.Item label="Colors">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {logData?.log?.previousData?.config?.colors?.map((color, index) => (
            <div
              key={`color-prev-${index}`}
              style={{
                backgroundColor: color,
                width: "calc(12.5% - 10px)", // 8 colors in a row
                height: "50px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
              }}
            />
          ))}
        </div>
      </Descriptions.Item>
    </Descriptions>

    {/* Current Data Section */}
    <Descriptions
      title="Current Data"
      bordered
      column={1}
      size="small"
      style={{ marginTop: "20px" }}
    >
      <Descriptions.Item label="Colors">
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {logData?.log?.currentData?.config?.colors?.map((color, index) => (
            <div
              key={`color-cur-${index}`}
              style={{
                backgroundColor: color,
                width: "calc(12.5% - 10px)", // 8 colors in a row
                height: "50px",
                borderRadius: "5px",
                border: "1px solid #ccc",
                boxSizing: "border-box",
              }}
            />
          ))}
        </div>
      </Descriptions.Item>
    </Descriptions>
  </>
)}
{logData?.log?.message === "Profile" && (
 <>
     {/* Previous Data Section */}
     <Descriptions
      title="Previous Data"
      bordered
      column={1}
      size="small"
      style={{ marginTop: "20px" }}
    >
   <Descriptions.Item label="Username">
        {logData?.log?.previousData?.username}
      </Descriptions.Item>
      <Descriptions.Item label="First Name">
        {logData?.log?.previousData?.first_name}
      </Descriptions.Item>
      <Descriptions.Item label="Last Name">
        {logData?.log?.previousData?.last_name}
      </Descriptions.Item>
      <Descriptions.Item label="Email">
        {logData?.log?.previousData?.email}
      </Descriptions.Item>
      <Descriptions.Item label="Phone">
        {logData?.log?.previousData?.phone}
      </Descriptions.Item>
      <Descriptions.Item label="Status">
        {logData?.log?.previousData?.status}
      </Descriptions.Item>
      </Descriptions>
           {/* Previous Data Section */}
     <Descriptions
      title="Current Data"
      bordered
      column={1}
      size="small"
      style={{ marginTop: "20px" }}
    >
   <Descriptions.Item label="Username">
        {logData?.log?.currentData?.username}
      </Descriptions.Item>
      <Descriptions.Item label="First Name">
        {logData?.log?.currentData?.first_name}
      </Descriptions.Item>
      <Descriptions.Item label="Last Name">
        {logData?.log?.currentData?.last_name}
      </Descriptions.Item>
      <Descriptions.Item label="Email">
        {logData?.log?.currentData?.email}
      </Descriptions.Item>
      <Descriptions.Item label="Phone">
        {logData?.log?.currentData?.phone}
      </Descriptions.Item>
      <Descriptions.Item label="Status">
        {logData?.log?.currentData?.status}
      </Descriptions.Item>
      </Descriptions>
 </>
)}
{(logData?.log?.modelName === "User" && logData?.log?.message !== "Profile" && logData?.log?.message !== "Password") && (
  <>
    {/* Display Previous Data if the event is "updated" */}
    {logData?.log?.event === "updated" && (
      <Descriptions
        title="Previous Data"
        bordered
        column={1}
        size="small"
        style={{ marginTop: "20px" }}
      >
        <Descriptions.Item label="Username">
          {logData?.log?.previousData?.username || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="First Name">
          {logData?.log?.previousData?.first_name || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Last Name">
          {logData?.log?.previousData?.last_name || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          {logData?.log?.previousData?.email || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Phone">
          {logData?.log?.previousData?.phone || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          {logData?.log?.previousData?.status || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Roles">
          {logData?.log?.previousData?.roles?.map(
            (role) =>
              role.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())
          ).join(", ") || "N/A"}
        </Descriptions.Item>
      </Descriptions>
      
    )}
      {(logData?.log?.event === "saved" || logData?.log?.event === "updated") && (
      <Descriptions
        title="Current Data"
        bordered
        column={1}
        size="small"
        style={{ marginTop: "20px" }}
      >
        <Descriptions.Item label="Username">
          {logData?.log?.currentData?.username || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="First Name">
          {logData?.log?.currentData?.first_name || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Last Name">
          {logData?.log?.currentData?.last_name || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Email">
          {logData?.log?.currentData?.email || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Phone">
          {logData?.log?.currentData?.phone || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Status">
          {logData?.log?.currentData?.status || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Roles">
          {logData?.log?.currentData?.roles?.map(
            (role) =>
              role.replace("_", " ").replace(/\b\w/g, (char) => char.toUpperCase())
          ).join(", ") || "N/A"}
        </Descriptions.Item>
      </Descriptions>
    )}
  </>
)}

{logData?.log?.modelName === "Setting" && (
  <>
    {/* Display Previous Data if the event is "updated" */}
    {logData?.log?.message === "ADA price" && (
       <>
      <Descriptions
        title="Previous Data"
        bordered
        column={1}
        size="small"
        style={{ marginTop: "20px" }}
      >
        <Descriptions.Item label="ADA price">
          {logData?.log?.previousData?.config?.ADA_price || "N/A"}
        </Descriptions.Item>
      </Descriptions>
    <Descriptions
    title="Current Data"
    bordered
    column={1}
    size="small"
    style={{ marginTop: "20px" }}
  >
    <Descriptions.Item label="ADA price">
      {logData?.log?.currentData?.config?.ADA_price || "N/A"}
    </Descriptions.Item>
  </Descriptions>
  </> 
    )}
  </>
)}

{logData?.log?.modelName === "Setting" && (
  <>
{['IC price', 'BW price' ,'ALIC price' ,'ALBW price'].includes(logData?.log?.message) && (
  <>
    <Descriptions
      title="Previous Data"
      bordered
      column={1}
      size="small"
      style={{ marginTop: "20px" }}
    >
      {Object.keys(logData?.log?.previousData?.config[logData?.log?.message.split(' ')[0]] || {}).map((key) => (
        <React.Fragment key={key}>
          <Descriptions.Item label={`${logData?.log?.message.split(' ')[0]} ${key}`}>
            <ul>
              {logData?.log?.previousData?.config[logData?.log?.message.split(' ')[0]][key].map((item) => (
                <li key={item.id}>
                  {item.name}: ${item.price}
                </li>
              ))}
            </ul>
          </Descriptions.Item>
        </React.Fragment>
      ))}
    </Descriptions>

    <Descriptions
      title="Current Data"
      bordered
      column={1}
      size="small"
      style={{ marginTop: "20px" }}
    >
      {Object.keys(logData?.log?.currentData?.config[logData?.log?.message.split(' ')[0]] || {}).map((key) => (
        <React.Fragment key={key}>
          <Descriptions.Item label={`${logData?.log?.message.split(' ')[0]} ${key}`}>
            <ul>
              {logData?.log?.currentData?.config[logData?.log?.message.split(' ')[0]][key].map((item) => (
                <li key={item.id}>
                  {item.name}: ${item.price}
                </li>
              ))}
            </ul>
          </Descriptions.Item>
        </React.Fragment>
      ))}
    </Descriptions>
  </>
)}


  </>
)}


 
    </Modal>

    </div>
  );
}

export default Log;
