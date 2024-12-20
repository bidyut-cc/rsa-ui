import React, { useEffect, useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import moment from 'moment';
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement, // For Pie chart
  LineElement, // Add this for Line chart
  PointElement, // Add this for Point (points are used in line charts)
  Filler, // Filler element is required for filling the area under the line
} from "chart.js";

import { Breadcrumb, message, Card, Row, Col, Spin, Table } from "antd";
import apiService from "../../services/apiService";

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement, // Register ArcElement for Pie chart
  LineElement, // Register LineElement for Line chart
  PointElement, // Register PointElement for Line chart points
  Filler // Register Filler element for line chart area fill
);

function Dashboard({ title }) {
  const [barData, setBarData] = useState({
    labels: [],
    datasets: [],
  });
  const [pieData, setPieData] = useState({
    labels: [],
    datasets: [],
  });
  const [lineData, setLineData] = useState({
    labels: [],
    datasets: [],
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  // Bar chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        onClick: null, // Disable click interactions
      },
      title: {
        display: false,
        text: "Monthly Orders",
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return "$" + tooltipItem.raw.toLocaleString(); // Add dollar sign to tooltips
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "$" + value.toLocaleString(); // Adds a $ prefix and formats the number with commas
          },
        },
      },
    },
  };
  // Pie chart options
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        onClick: null, // Disable click interactions
      },
      title: {
        display: false,
        text: "Order Ratio",
      },
    },
  };
    // Line chart options
    const lineOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
          onClick: null, // Disable click interactions
        },
        title: {
          display: false,
          text: "Monthly Leads",
        },
      },
     
    };
  const fetchMonthlyChart = async () => {
    setLoading(true);
    try {
      const response = await apiService.get(`orders/charts`);
      if (response.status === 200) {
        // Data for Bar Chart
        const labels = response.data.data.monthlyOrders.map((item) =>
          new Date(item.year, item.month - 1).toLocaleString("default", {
            month: "long",
          })
        );
        const datasetValues = response.data.data.monthlyOrders.map(
          (item) => item.totalAmount
        );
        // Data for Pie Chart (Order Ratio)
        const orderRatioData = response.data.data.orderRatio;
        const pieDatasetValues = [
          orderRatioData.totalOrders,
          orderRatioData.totalCompleteOrders,
        ];
        const pieLabels = ["Total Quotations", "Completed Orders"];
          // Data for Line Chart
          const lineLabels = response.data.data.monthlyOrders.map((item) =>
          new Date(item.year, item.month - 1).toLocaleString("default", {
            month: "long",
          })
        );
        const lineDatasetValues = response.data.data.monthlyLeads.map(
          (item) => item.count
        );
       
        // Update chart data
        setBarData({
          labels: labels,
          datasets: [
            {
              label: "Total Amount",
              data: datasetValues,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        });
        // Update Pie chart data
        setPieData({
          labels: pieLabels,
          datasets: [
            {
              label: "Order Ratio",
              data: pieDatasetValues,
              backgroundColor: ["rgb(255, 99, 132)", "rgb(54, 162, 235)"],
              hoverOffset: 4,
            },
          ],
        });
          // Update Line data
          setLineData({
            labels: lineLabels,
            datasets: [
              {
                label: "Total Leads",
                data: lineDatasetValues,
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
              },
            ],
          });
        setRecentOrders(response.data.data.recentOrders);
        setLoading(false);
      }
    } catch (error) {
      setBarData({});
      setPieData({});
      setLineData({});
      setLoading(false);
      message.error(
        error.response?.statusText || "Error fetching monthly orders"
      );
    }
  };

  useEffect(() => {
    fetchMonthlyChart();
  }, []);
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
        title: "Order Total",
        dataIndex: "amount",
        key: "amount",
        render: (amount) => `$${amount}`,
    },
    {
      title: "Payment Status",
      dataIndex: "payment_status",
      key: "payment_status",
      render: (status) => {
        if (status) {
          // Capitalize the first letter of each word
          return status
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
        return status; // Return status as is if it's empty or null
      },
    },
    {
      title: "Order Status",
      dataIndex: "order_status",
      key: "order_status",
      render: (status) => {
        if (status) {
          // Capitalize the first letter of each word
          return status
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
        return status; // Return status as is if it's empty or null
      },
    },
    {
      title: "Order Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => moment(date).format('MM-DD-YYYY hh:mm:ss A'),
  }
  ];
  return (
    <div className="container-fluid">
      <Breadcrumb
      style={{ marginBottom: "16px" }}
      items={[
        {
          title: <Link to="/dashboard">Home</Link>,
        },
        {
          title: "Dashboard",
        },
      ]}
    />
      <h1 className="h3 mb-4 text-gray-800">{title}</h1>

      {/* <div className="row">

                
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-primary shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                        Users</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">5</div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-user fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

               
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-success shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                    Quotation Amount</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">$215,000</div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-dollar-sign fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-info shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-info text-uppercase mb-1">Tasks
                                    </div>
                                    <div className="row no-gutters align-items-center">
                                        <div className="col-auto">
                                            <div className="h5 mb-0 mr-3 font-weight-bold text-gray-800">50%</div>
                                        </div>
                                        <div className="col">
                                            <div className="progress progress-sm mr-2">
                                                <div className="progress-bar bg-info a1" role="progressbar"
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-clipboard-list fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

               
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-warning shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                        Pending Quotation</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">18</div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-comments fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
            </div> */}
      <Spin spinning={loading}>
        <Card>
          <Row gutter={16}>
            <Col span={15}>
              <Card title="Monthly Orders" bordered={false}>
                <Bar data={barData} options={barOptions} />
              </Card>
            </Col>
            <Col span={8}>
              <Card title="Orders Ratio" bordered={false}>
                <Pie data={pieData} options={pieOptions} />
              </Card>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Card title="Monthly Leads" bordered={false}>
                <Line data={lineData} options={lineOptions} />
              </Card>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Card title="Recent Orders" bordered={false}>
                <Table
                  dataSource={recentOrders}
                  columns={columns}
                  rowKey="_id"
                  pagination={false}
                />
                  {/* Link Below the Table */}
  <div style={{ marginTop: "16px", textAlign: "center" }}>
    <Link to="/orders" style={{ fontSize: "16px", color: "#1890ff" }}>
      View All Orders
    </Link>
  </div>
              </Card>
            </Col>
          </Row>
        </Card>
      </Spin>
    </div>
  );
}

export default Dashboard;
