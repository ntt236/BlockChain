/**
 * Navbar.js - Thanh điều hướng chính của ứng dụng
 * 
 * Hiển thị:
 * - Logo và tên ứng dụng
 * - Nút kết nối MetaMask
 * - Địa chỉ ví (dạng rút gọn 0x123...abc)
 * - Số dư ETH
 * - Badge Admin (nếu là Admin)
 */

import React from "react";

/**
 * Rút gọn địa chỉ ví để hiển thị gọn trên UI
 * Ví dụ: 0x1234567890abcdef... => 0x1234...cdef
 * 
 * @param {string} address - Địa chỉ ví đầy đủ
 * @returns {string} Địa chỉ ví rút gọn
 */
function shortenAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function Navbar({ account, balance, isAdmin, onConnect, activeTab, setActiveTab }) {
  return (
    <nav className="navbar">
      {/* Logo và tên ứng dụng */}
      <div className="navbar-brand">
        <div className="navbar-logo">
          {/* Icon sách/blockchain */}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <path d="M8 7h8" />
            <path d="M8 11h6" />
          </svg>
        </div>
        <span className="navbar-title">BlockCourse</span>
      </div>

      {/* Tabs điều hướng */}
      {account && (
        <div className="navbar-tabs">
          <button
            className={`nav-tab ${activeTab === "market" ? "active" : ""}`}
            onClick={() => setActiveTab("market")}
          >
            🏪 Khóa học
          </button>
          <button
            className={`nav-tab ${activeTab === "inventory" ? "active" : ""}`}
            onClick={() => setActiveTab("inventory")}
          >
            📚 Kho của tôi
          </button>
          {/* Tab Admin chỉ hiện khi là Admin */}
          {isAdmin && (
            <button
              className={`nav-tab ${activeTab === "admin" ? "active" : ""}`}
              onClick={() => setActiveTab("admin")}
            >
              ⚙️ Admin
            </button>
          )}
        </div>
      )}

      {/* Khu vực ví */}
      <div className="navbar-wallet">
        {account ? (
          // Đã kết nối ví - Hiển thị thông tin
          <div className="wallet-info">
            {/* Badge Admin */}
            {isAdmin && <span className="admin-badge">ADMIN</span>}
            {/* Số dư ETH */}
            <div className="wallet-balance">
              <span className="balance-icon">◆</span>
              <span>{parseFloat(balance).toFixed(4)} ETH</span>
            </div>
            {/* Địa chỉ ví rút gọn */}
            <div className="wallet-address">
              <div className="address-dot"></div>
              <span>{shortenAddress(account)}</span>
            </div>
          </div>
        ) : (
          // Chưa kết nối - Hiển thị nút Connect
          <button className="connect-btn" onClick={onConnect}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
              <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
              <circle cx="18" cy="16" r="2" />
            </svg>
            Kết nối ví
          </button>
        )}
      </div>
    </nav>
  );
}
