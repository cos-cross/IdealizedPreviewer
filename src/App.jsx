import { NavLink, Route, Routes } from 'react-router-dom'
import './App.css'
import HomePage from './pages/HomePage.jsx'
import OtogeLettersPage from './pages/OtogeLettersPage.jsx'

function App() {
  return (
    <div className="app-shell">
      <nav className="navbar navbar-expand-lg bg-white border-bottom sticky-top">
        <div className="container">
          <NavLink className="navbar-brand fw-bold text-primary" to="/">
            Idealized Previewer
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNav"
            aria-controls="mainNav"
            aria-expanded="false"
            aria-label="切换导航"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav ms-auto gap-lg-3">
              <li className="nav-item">
                <NavLink className="nav-link" to="/">
                  小站首页
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/otoge-letters">
                  音游开字母工具
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/otoge-letters" element={<OtogeLettersPage />} />
      </Routes>
    </div>
  )
}

export default App
