import React, { useEffect, useState } from "react";
import { Button, Space, Table } from 'antd';
import apiService from "../../services/apiService";
function User() {
    const [dataSource, setDataSource] = useState({
        loading:false,
        data:[]
    });
      const columns = [
        {
            title: 'Sl No.',
            key: 'index',
            render: (text, record,index) => index + 1,
        },
        {
          title: 'First Name',
          dataIndex: 'first_name',
          key: 'first_name',
        },
        {
          title: 'Last Name',
          dataIndex: 'last_name',
          key: 'last_name',
        },
        {
          title: 'Email',
          dataIndex: 'email',
          key: 'email',
        },
        {
          title: 'Phone',
          dataIndex: 'phone',
          key: 'phone',
        },
        {
            title: 'Action',
            render: (_, record) => (
                <Space size="middle">
                     <Button type="primary" shape="circle" onClick={()=>handleEdit(record)}><i className="fa fa-edit" aria-hidden="true" /></Button>
                     <Button danger shape="circle" onClick={()=>handleDelete(record.id)}><i className="fa fa-trash" aria-hidden="true" /></Button>
                </Space>
            ),
        },
      ];
    const fetchRecords = async () => {
        setDataSource({...dataSource,loading : true});
        try {
          const response = await apiService.get('users');
          setDataSource({...dataSource,loading : false, data:response.results.results.data});
        } catch (error) {
            setDataSource({...dataSource,loading : false});
          console.error("Error fetching profile data:", error);
        }
      };
      useEffect( ()=> {
        fetchRecords()
    },[]);
    const handleDelete = (id) => {
     console.log(id);
    }
    const handleEdit = (row) => {
        console.log(row);
       }
  return (
    <div className="container-fluid">
      <h1 className="h3 mb-4 text-gray-800">Users</h1>
      <section className="content">
        <div className="container-fluid">
          <div className="col-12 ">
            <div className="card">
              <div className="card-body">
              <Table loading={dataSource.loading} rowKey="id" dataSource={dataSource.data} columns={columns} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default User;
