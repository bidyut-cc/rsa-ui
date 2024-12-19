import React, { useCallback, useEffect, useState } from "react";
import moment from "moment";
import "./Lead.css"; // Include your CSS file
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
  Breadcrumb
} from "antd";
import { Link  } from "react-router-dom";
import { EyeOutlined, CopyOutlined } from "@ant-design/icons";
import apiService from "../../services/apiService";
import { debounce } from "lodash";

const { Panel } = Collapse;

function Lead({ title }) {
  const [dataSource, setDataSource] = useState({
    loading: false,
    data: [],
    search: "",
    page: 1,
    pageSize: 10,
  });

  const [quotationData, setQuotationData] = useState({
    id: "",
    quotation_no:"",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    submittedData: "",
    roomData: "",
    is_converted_to_deal:"",
    createdAt:"",
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
      title: "Quotation No",
      dataIndex: "quotation_no",
      key: "quotation_no",
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
      title: "Converted to Deal",
      dataIndex: "is_converted_to_deal",
      key: "is_converted_to_deal",
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
      quotation_no: row.quotation_no,
      first_name: row.first_name,
      last_name: row.last_name,
      email: row.email,
      phone_number: row.phone_number,
      submittedData: row.submittedData,
      roomData: row.roomData,
      materials: row.materials || [], // Default to empty array
      is_converted_to_deal:row.is_converted_to_deal,
      createdAt:row.createdAt,
      errors: [],
      loading: false,
    });
    setIsModalOpen(true);
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

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        message.success('Link copied to clipboard!');
      })
      .catch((err) => {
        message.error('Failed to copy link');
        console.error('Copy error:', err);
      });
  };

  return (
    <div className="container-fluid">
      <Breadcrumb
      style={{ marginBottom: "16px" }}
      items={[
        {
          title: <Link to="/">Home</Link>,
        },
        {
          title: "Leads",
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
      <Modal
        title="Quotation Details"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width="50%" // Adjust modal width if needed
      >
        {/* User Details */}
     
       <Descriptions bordered column={1} size="middle">
       <Descriptions.Item label="Quotation Number">{quotationData.quotation_no}</Descriptions.Item>
        <Descriptions.Item label="Name">{quotationData.first_name} {quotationData.last_name}</Descriptions.Item>
        <Descriptions.Item label="Email">{quotationData.email}</Descriptions.Item>
        <Descriptions.Item label="Phone Number">{quotationData.phone_number}</Descriptions.Item>
        <Descriptions.Item label="Converted to Deal">{quotationData.is_converted_to_deal}</Descriptions.Item>
        <Descriptions.Item label="Created Date">{moment(quotationData.createdAt).format('MM-DD-YYYY HH:mm:ss')}</Descriptions.Item>
        <Descriptions.Item label="Abandoned Cart Link">
        <span>
                <Link href={`${process.env.REACT_APP_QUOTATION_PDF_LINK_URL}?id=${quotationData.id}&abandoned=1`} target="_blank">
                Click to copy abandoned cart link
                </Link>
                <Button
                  type="link"
                  icon={<CopyOutlined />}
                  style={{ marginLeft: '10px' }}
                  onClick={() => handleCopy(`${process.env.REACT_APP_QUOTATION_PDF_LINK_URL}?id=${quotationData.id}&abandoned=1`)}
                />
              </span>
        </Descriptions.Item>
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
            <Descriptions bordered size="middle" column={1} style={{ marginBottom: '20px' }}>
              <Descriptions.Item label="Material Image">
                <Image width={100} src={material.src} alt="2D View" preview={{
            className: "custom-preview", // Add a class for the preview modal
          }}/>
              </Descriptions.Item>
              <Descriptions.Item label="Total Price">
                ${material.price}
              </Descriptions.Item>
              <Descriptions.Item label="Checkout URL">
              <span>
                <Link href={`${process.env.REACT_APP_QUOTATION_PAYMENT_URL}?id=${quotationData.id}&material_id=${material.id}&color=3d58a4`} target="_blank">
                Click to copy payment link
                </Link>
                <Button
                  type="link"
                  icon={<CopyOutlined />}
                  style={{ marginLeft: '10px' }}
                  onClick={() => handleCopy(`${process.env.REACT_APP_QUOTATION_PAYMENT_URL}?id=${quotationData.id}&material_id=${material.id}&color=3d58a4`)}
                />
              </span>
              </Descriptions.Item>
            </Descriptions>

                {/* Room Price Details */}
            {/* <h6 style={{ marginTop: "20px", fontWeight: "bold" }}>Room Price Details:</h6>
            <Descriptions bordered size="middle" column={1} style={{ marginBottom: "20px" }}>
              {material.price_details.map((priceDetail) => (
                <Descriptions.Item key={priceDetail.room_id} label={`Room ${priceDetail.room_id}`}>
                  ${priceDetail.price}
                </Descriptions.Item>
              ))}
            </Descriptions> */}
      
      
        
          </Card>
          ))
        ) : (
          <p>No materials available</p>
        )}
       {/* Room Details (outside of the materials map loop) */}
  {quotationData.submittedData.rooms && quotationData.submittedData.rooms.length > 0 && (
    <>
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
          {room.title!=='' && (
            <Descriptions.Item label="Room Title">
              {room.title}
            </Descriptions.Item>
          )}
          
          {/* Optional 3D Image item if needed */}
          {/* <Descriptions.Item label="3D Image">
            <Image width={100} src={room.image_3D} alt="3D View" />
          </Descriptions.Item> */}
          
          <Descriptions.Item label="Preview">
            <Image width={100} src={room.image_2D} alt="2D View" preview={{
            className: "custom-preview", // Add a class for the preview modal
          }}/>
          </Descriptions.Item>
        </Descriptions>

        {/* Stall Details */}
        <h6 style={{ marginTop: "20px", fontWeight: "bold" }}> Stall Details:</h6>
        <Descriptions bordered size="middle" column={1}>
      <Descriptions.Item label="Number of Stall">
        {room.stall.noOfStalls}
      </Descriptions.Item>
      <Descriptions.Item label="Does this include a handicap accessible stall?">
        {room.stall?.adaStall ? 'Yes' : 'No'}
      </Descriptions.Item>
      {room.stall.stallConfig.map((stall, index) => (
            <Descriptions.Item label={`Stall ${index + 1}`}>
              <strong>Width:</strong> {stall.stallWidth} {stall.stallFraction}" <br />
              <strong>Door Opening:</strong> {stall.doorOpening}" <br />
              <strong>Door Swing:</strong> {stall.doorSwing?.name}
            </Descriptions.Item>
        ))}
        <Descriptions.Item label="Overall Room Width">
          {room.stall?.overallRoomWidth}"
        </Descriptions.Item>
        <Descriptions.Item label="Standard Depth">
          {room.stall?.standardDepth}"
        </Descriptions.Item>
        {/* <Descriptions.Item label="ADA Depth">
          {room.stall?.adaDepth}"
        </Descriptions.Item> */}

      {(() => {
        const label = (() => {
          if (room.stall?.adaStall && room.stall?.layout?.layoutOption?.includes('alcove')) {
            // Scenario 4: ADA, Alcove Stall → Label: "ADA Depth"
            return "ADA Depth";
          } else if (!room.stall?.adaStall && room.stall?.layout?.layoutOption?.includes('alcove')) {
            // Scenario 3: Non-ADA, Alcove Stall → Label: "Alcove Depth"
            return "Alcove Depth";
          } else if (room.stall?.adaStall && !room.stall?.layout?.layoutOption?.includes('alcove')) {
            // Scenario 2: ADA, Normal Stall → Label: "ADA Depth"
            return "ADA Depth";
          } else if (!room.stall?.adaStall && !room.stall?.layout?.layoutOption?.includes('alcove')) {
            // Scenario 1: Non-ADA, Normal Stall → No Label
            return "";
          }else {
            return "";
          }
        })();

        const value = (() => {
          if (room.stall?.adaStall && room.stall?.layout?.layoutOption?.includes('alcove')) {
            // Scenario 4: ADA, Alcove Stall → ADA Depth Value
            return `${room.stall?.adaDepth}"`;
          } else if (!room.stall?.adaStall && room.stall?.layout?.layoutOption?.includes('alcove')) {
            // Scenario 3: Non-ADA, Alcove Stall → Alcove Depth Value
            return `${room.stall?.alcoveDepth}"`;
          } else if (room.stall?.adaStall && !room.stall?.layout?.layoutOption?.includes('alcove')) {
            // Scenario 2: ADA, Normal Stall → ADA Depth Value
            return `${room.stall?.adaDepth}"`;
          } else if (!room.stall?.adaStall && !room.stall?.layout?.layoutOption?.includes('alcove')) {
            // Scenario 1: Non-ADA, Normal Stall → No Value
            return null;
          }else{
            return null;
          }
        })();

        // Render Descriptions.Item only if label is not empty
        return label ? (
          <Descriptions.Item label={label}>
            {value}
          </Descriptions.Item>
        ) : null;
      })()}


          <Descriptions.Item label="Layout">
        {room.stall.type === 'IC' ? (
        `In Corner`
      ) : room.stall.type === 'BW' ? (
        'Between Wall'
      ) : room.stall.type === 'ALIC' ? (
        `Alcove Corner`
      ) : room.stall.type === 'ALBW' ? (
        'Alcove Between Wall'
      ) : (
        ''
      )} {room.stall.layout?.layoutDirection}
        </Descriptions.Item>
        <Descriptions.Item label="Layout Direction">
          {room.stall.layout?.layoutDirection}
        </Descriptions.Item>
    </Descriptions>
      {room.hasUrinalScreens && (
  <>
   <h6 style={{ marginTop: "20px", fontWeight: "bold" }}>Urinal Screen Details:</h6>
    <Descriptions bordered size="middle" column={1}>
    <Descriptions.Item label="Preview">
       {/* <Descriptions.Item label="3D Image">
        <Image width={100} src={room.urinalScreen.urinal_3D} alt="3D View" />
      </Descriptions.Item> */}
      <Image width={100} src={room.urinalScreen.urinal_2D} alt="2D View" />
      </Descriptions.Item>
      <Descriptions.Item label="Number of Urinal Screens">
        {room.urinalScreen.noOfUrinalScreens}
      </Descriptions.Item>
      <Descriptions.Item label="Screen Depth">
        {room.urinalScreen?.urinalScreenConfig[0]?.screenDepth}"
      </Descriptions.Item>
    </Descriptions>
    {/* {room.urinalScreen.urinalScreenConfig.map((screen, index) => (
      <Descriptions bordered size="middle" column={1} key={index}>
        <Descriptions.Item label={`Urinal Screen ${index + 1}`}>
          <strong>Screen Depth:</strong> {screen.screenDepth}"
        </Descriptions.Item>
      </Descriptions>
    ))} */}
  </>
)}
      </Panel>
      ))}
    </Collapse>
    </>
  )}
      </Modal>
    </div>
  );
}

export default Lead;
