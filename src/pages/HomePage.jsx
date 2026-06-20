import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <>
      <header className="hero py-5 py-lg-6">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <p className="text-uppercase fw-semibold text-primary mb-2">Cos(x)の个人小站</p>
              <h1 className="display-5 fw-bold mb-3">实践 & 工具箱</h1>
              <p className="lead text-secondary mb-4">
                Update 260620: 创建小站! 先试试开字母工具~
              </p>
              <Link to="/otoge-letters" className="btn btn-primary btn-lg">
                音游开字母工具
              </Link>
            </div>
            {/* <div className="col-lg-5">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h2 className="h5 mb-3">当前页面结构</h2>
                  <ul className="list-group list-group-flush">
                    <li className="list-group-item px-0">首页（介绍与入口）</li>
                    <li className="list-group-item px-0">音游开字母（独立子页面）</li>
                  </ul>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </header>
    </>
  )
}

export default HomePage
