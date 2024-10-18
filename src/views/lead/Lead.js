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
  Descriptions,
  Collapse,
  Image
} from "antd";
import { EyeOutlined, FilePdfOutlined } from "@ant-design/icons";
import apiService from "../../services/apiService";
import { debounce } from "lodash";
import axios from "axios";
const { Panel } = Collapse;
function Lead() {
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
      title: "Action",
      render: (_, record) => (
        <Space size="middle">
          {/* <Button type="primary" shape="circle" danger onClick={() => handleGeneratePDF(record)}>
            <Tooltip title="View PDF">
              <FilePdfOutlined />
            </Tooltip>
          </Button> */}
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
        `quotations/list?page=${dataSource.page}&show=${dataSource.pageSize}&search=${dataSource.search}`
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
      <h1 className="h3 mb-4 text-gray-800">Leads</h1>
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
        title="View Quotation Details"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width="50%" // Adjust modal width if needed
      >
        {/* User Details */}
     
       <Descriptions bordered column={1} size="middle">
        <Descriptions.Item label="Name">{quotationData.first_name} {quotationData.last_name}</Descriptions.Item>
        <Descriptions.Item label="Email">{quotationData.email}</Descriptions.Item>
        <Descriptions.Item label="Phone Number">{quotationData.phone_number}</Descriptions.Item>
      </Descriptions>
     

        {/* Materials Details */}
        <h6 style={{ marginTop: "20px", fontWeight: "bold" }} >Materials</h6>
        {quotationData.materials.length > 0 ? (
          quotationData.materials.map((material) => (
            <Card key={material.id} title={material.name} style={{
              marginBottom: "20px",
              backgroundColor: "#f0f2f5", // Example background color
            }}>
            {/* Material Image and Price Details */}
            <Descriptions bordered size="middle" column={1} style={{ marginBottom: "20px" }}>
              <Descriptions.Item label="Material Image">
                <img
                  alt={material.name}
                  src={material.src}
                  style={{
                    width: "100px",
                    objectFit: "contain",
                  }}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Total Price">
                ${material.price}
              </Descriptions.Item>
            </Descriptions>

                {/* Room Price Details */}
            <h6 style={{ marginTop: "20px", fontWeight: "bold" }}>Room Price Details:</h6>
            <Descriptions bordered size="middle" column={1} style={{ marginBottom: "20px" }}>
              {material.price_details.map((priceDetail) => (
                <Descriptions.Item key={priceDetail.room_id} label={`Room ${priceDetail.room_id}`}>
                  ${priceDetail.price}
                </Descriptions.Item>
              ))}
            </Descriptions>
      
            {/* Material Type Details */}
            <h6 style={{ marginTop: "20px", fontWeight: "bold" }}> Room  Details:</h6>
            {/* <Descriptions bordered size="middle" column={1}>
              {quotationData.roomData.map((room_data) => (
                <Descriptions.Item key={room_data.roomId} label={`Room ${room_data.roomId}`}>
                  {room_data.full_type_name}
                </Descriptions.Item>
              ))}
            </Descriptions> */}
          <Collapse accordion>
      {quotationData.submittedData.rooms.map((room,index) => (
       <Panel header={`Room ${index + 1}`} key={room.id}>
        {/* Room Title and Images */}
        <Descriptions bordered size="middle" column={1}>
          <Descriptions.Item label="Room Title">{room.title}</Descriptions.Item>
          <Descriptions.Item label="3D Image">
            <Image width={100} src={room.image_3D} alt="3D View" />
          </Descriptions.Item>
          <Descriptions.Item label="2D Image">
            <Image width={100} src={room.image_2D} alt="2D View" />
          </Descriptions.Item>
         
        </Descriptions>

        {/* Stall Details */}
        <h6 style={{ marginTop: "20px", fontWeight: "bold" }}> Stall Details:</h6>
        <Descriptions bordered size="middle" column={1}>
      <Descriptions.Item label="Number of Stall">
        {room.stall.noOfStalls}
      </Descriptions.Item>
    </Descriptions>
        {room.stall.stallConfig.map((stall, index) => (
          <Descriptions bordered size="middle" column={1} key={index}>
            <Descriptions.Item label={`Stall ${index + 1}`}>
              <strong>Width:</strong> {stall.stallWidth}" <br />
              <strong>Door Opening:</strong> {stall.doorOpening}" <br />
              <strong>Door Swing:</strong> {stall.doorSwing}
            </Descriptions.Item>
          </Descriptions>
        ))}

      {/* Layout Details for the Room */}
      <Descriptions bordered size="middle" column={1}>
        <Descriptions.Item label="Layout Direction">
          {room.stall.layout?.layoutDirection}
        </Descriptions.Item>
      </Descriptions>
      {room.hasUrinalScreens && (
  <>
   <h6 style={{ marginTop: "20px", fontWeight: "bold" }}>Urinal Screen Details:</h6>
        {/* Urinal Images in Descriptions */}
        <Descriptions bordered size="middle" column={1}>
      <Descriptions.Item label="3D Image">
        <Image width={100} src={room.urinalScreen.urinal_3D} alt="3D View" />
      </Descriptions.Item>
      <Descriptions.Item label="2D Image">
        <Image width={100} src={room.urinalScreen.urinal_2D} alt="2D View" />
      </Descriptions.Item>
    </Descriptions>
    <Descriptions bordered size="middle" column={1}>
      <Descriptions.Item label="Number of Urinal Screens">
        {room.urinalScreen.noOfUrinalScreens}
      </Descriptions.Item>
    </Descriptions>

    {room.urinalScreen.urinalScreenConfig.map((screen, index) => (
      <Descriptions bordered size="middle" column={1} key={index}>
        <Descriptions.Item label={`Urinal Screen ${index + 1}`}>
          <strong>Screen Depth:</strong> {screen.screenDepth}"
        </Descriptions.Item>
      </Descriptions>
    ))}
  </>
)}
      </Panel>
      ))}
    </Collapse>
        
          </Card>
          ))
        ) : (
          <p>No materials available</p>
        )}
      </Modal>
    </div>
  );
}

export default Lead;
