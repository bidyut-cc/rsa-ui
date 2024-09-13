import React from 'react';


function Dashboard(props) {
    
    return (
        <div id="content">

        {/* <!-- Begin Page Content --> */}
        <div className="container-fluid">

            {/*  <!-- Page Heading --> */}
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Dashboard</h1>
            </div>

            {/*  <!-- Content Row --> */}
            <div className="row">

                {/*  <!-- Users Card Example --> */}
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

                {/*  <!-- Quotation Amount Card Example --> */}
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

                {/*  <!-- Earnings (Monthly) Card Example --> */}
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

                {/*  <!-- Pending Quotation Card Example --> */}
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
            </div>

      

        </div>
        {/*   <!-- /.container-fluid --> */}

    </div>
    );
}

export default Dashboard;