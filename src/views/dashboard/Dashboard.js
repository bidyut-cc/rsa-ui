import React, { useEffect, useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
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

import { message, Card, Row, Col, Spin } from "antd";
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
  const [loading, setLoading] = useState(false);
  // Bar chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
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
      },
      title: {
        display: false,
        text: "Order Ratio",
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
        const pieLabels = ["Total Orders", "Complete Orders"];
        // Update chart data
        setBarData({
          labels,
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
        setLoading(false);
      }
    } catch (error) {
      setBarData({});
      setPieData({});
      setLoading(false);
      message.error(
        error.response?.statusText || "Error fetching monthly orders"
      );
    }
  };

  useEffect(() => {
    fetchMonthlyChart();
  }, []);
  return (
    <div className="container-fluid">
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
              <Card title="Order Ratio" bordered={false}>
                {/* Your other content goes here */}
                <Pie data={pieData} options={pieOptions} />
              </Card>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Card title="Monthly Orders - Line Chart" bordered={false}>
                <Line data={barData} options={barOptions} />
              </Card>
            </Col>
          </Row>
        </Card>
      </Spin>
    </div>
  );
}

export default Dashboard;
