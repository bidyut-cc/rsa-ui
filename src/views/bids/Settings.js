import React, { useState, useEffect } from "react";
import { Card, Table, Tabs, message } from "antd";
import apiService from "../../services/apiService";

const { TabPane } = Tabs;

function Settings() {
  const [bidsData, setBidsData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch bids data from API
  useEffect(() => {
    const fetchBidsData = async () => {
      setLoading(true);
      try {
        const response = await apiService.get("masterSettings/view/?key=bids"); // Replace with your API endpoint
        if (response.status === 200) {
          setBidsData(response.data.value); // Adjust based on API responseaq3
        }
      } catch (error) {
        console.error(error);
        message.error("Failed to fetch bids data");
      } finally {
        setLoading(false);
      }
    };

    fetchBidsData();
  }, []);

  // Generic function to render a table for any section
  const renderTable = (data, type) => {
    if (!data) return null;

    // Generate columns dynamically
    let columns = [
      { title: "Sl No.", key: "index", render: (text, record, index) => index + 1 },
    ];

    if (type === "distance" || type === "projectTimeline" || type === "projectSize") {
      const keys = Object.keys(data[0] || {});
      keys.forEach((key) => {
        columns.push({
          title: key.charAt(0).toUpperCase() + key.slice(1),
          dataIndex: key,
          key,
          render: (val) => {
            if (val === null || val === undefined) return "N/A";
            // Append % if the key is "percentage"
            if (key === "percentage") return `${val}%`;
            return val;
          },
        });
      });
    } else {
      columns.push(
        { title: "Name", dataIndex: "name", key: "name" },
        { title: "Percentage", dataIndex: "percentage", key: "percentage", render: (val) => `${val}%` }
      );
    }

    return (
      <Table
        loading={loading}
        rowKey={(record, index) => record.name || index}
        dataSource={data}
        columns={columns}
        pagination={{ pageSize: 50 }}
      />
    );
  };

  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4 text-gray-800">Bids Overview</h1>
      <Card>
        <Tabs defaultActiveKey="clients" type="card">
          <TabPane tab="Clients" key="clients">
            {renderTable(bidsData?.clients, "clients")}
          </TabPane>
          <TabPane tab="States" key="states">
            {renderTable(bidsData?.states, "states")}
          </TabPane>
          <TabPane tab="Distance" key="distance">
            {renderTable(bidsData?.distance, "distance")}
          </TabPane>
          <TabPane tab="Trade Names" key="tradeNames">
            {renderTable(bidsData?.tradeNames, "tradeNames")}
          </TabPane>
          <TabPane tab="Project Names" key="projectNames">
            {renderTable(bidsData?.projectNames, "projectNames")}
          </TabPane>
          <TabPane tab="Project Timeline" key="projectTimeline">
            {renderTable(bidsData?.projectTimeline, "projectTimeline")}
          </TabPane>
          <TabPane tab="Project Size" key="projectSize">
            {renderTable(bidsData?.projectSize, "projectSize")}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}

export default Settings;
