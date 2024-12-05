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
  Collapse,
  Image,
  Typography
} from "antd";
import { EyeOutlined, CopyOutlined } from "@ant-design/icons";
import apiService from "../../services/apiService";
import { debounce } from "lodash";
import axios from "axios";
const { Link } = Typography;
const { Panel } = Collapse;


function Log({ title }) {
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
    // {
    //   title: "Action",
    //   render: (_, record) => (
    //     <Space size="middle">
    //       {/* <Button type="primary" shape="circle" danger onClick={() => handleGeneratePDF(record)}>
    //         <Tooltip title="View PDF">
    //           <FilePdfOutlined />
    //         </Tooltip>
    //       </Button> */}
    //       <Button
    //         type="primary"
    //         shape="circle"
    //         onClick={() => handleView(record)}
    //       >
    //         <Tooltip title="View">
    //           <EyeOutlined />
    //         </Tooltip>
    //       </Button>
    //     </Space>
    //   ),
    // },
  ];

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

  const handleGeneratePDF = async (leadData) => {
  try {
    setDataSource((prev) => ({ ...prev, loading: true }));
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}quotations/generateQuotationPDF`, 
      leadData, // Directly passing the data object, no need to wrap in another object
      {
        headers: {
          token: `${localStorage.getItem('token')}`, // Pass the token as a Bearer token
        }
      }
    );
    if (response.status === 200) {
      const htmlContent = response.data.htmlContent; // Assuming response contains HTML content

      // Create an iframe (hidden) to load the HTML content and print
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none'; // Hide the iframe
      document.body.appendChild(iframe);
  
      // Get the iframe document and write the HTML content into it
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(htmlContent); // Write the HTML content
      iframeDoc.close();
  
      // Wait for iframe content to load and trigger the print
      iframe.onload = () => {
        iframe.contentWindow.focus(); // Focus on the iframe window
        iframe.contentWindow.print(); // Trigger print dialog
        setDataSource((prev) => ({ ...prev, loading: false }));
      };
    }


  } catch (error) {
    setDataSource((prev) => ({ ...prev, loading: false }));
    message.error(error.response.data.message);
  }
    
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
        width="50%" // Adjust modal width if needed
      >

      </Modal>
    </div>
  );
}

export default Log;
