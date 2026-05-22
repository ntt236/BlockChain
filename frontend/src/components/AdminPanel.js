import React, { useState, useEffect } from "react";
import { getAllBuyers } from "../ContractIntegration";

export default function AdminPanel({ onCreateCourse, loading, courses, contractBalance, onWithdraw, onExit }) {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [activeView, setActiveView] = useState("overview"); 
  
  const [buyers, setBuyers] = useState([]);

  useEffect(() => {
    getAllBuyers().then(setBuyers).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !price || !videoUrl.trim()) return;
    await onCreateCourse(title.trim(), price, videoUrl.trim(), description.trim());
    setTitle(""); setPrice(""); setVideoUrl(""); setDescription("");
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };
  const previewId = getYouTubeId(videoUrl);

  const renderViewTitle = () => {
    switch (activeView) {
      case "overview": return "Tổng quan (Overview)";
      case "list": return "Quản lý khóa học (Courses)";
      case "create": return "Tạo khóa học (Create)";
      case "users": return "Quản lý người dùng (Users)";
      default: return "Admin Dashboard";
    }
  };

  // Các icon SVG đơn giản mô phỏng Lucide React (Shadcn style)
  const PackageIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
  const HomeIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
  const BookIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
  const PlusIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>;
  const UsersIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
  const ExitIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
  const DollarIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;

  return (
    <div className="shadcn-layout">
      {/* SIDEBAR */}
      <aside className="shadcn-sidebar">
        <div className="shadcn-sidebar-header">
          <PackageIcon />
          <span>BlockCourse Admin</span>
        </div>
        <nav className="shadcn-sidebar-nav">
          <button className={`shadcn-nav-item ${activeView === "overview" ? "active" : ""}`} onClick={() => setActiveView("overview")}>
            <HomeIcon /> Tổng quan
          </button>
          <button className={`shadcn-nav-item ${activeView === "list" ? "active" : ""}`} onClick={() => setActiveView("list")}>
            <BookIcon /> Quản lý khóa học
          </button>
          <button className={`shadcn-nav-item ${activeView === "create" ? "active" : ""}`} onClick={() => setActiveView("create")}>
            <PlusIcon /> Tạo khóa học
          </button>
          <button className={`shadcn-nav-item ${activeView === "users" ? "active" : ""}`} onClick={() => setActiveView("users")}>
            <UsersIcon /> Khách hàng
          </button>
        </nav>
      </aside>

      {/* MAIN */}
      <div className="shadcn-main">
        {/* HEADER */}
        <header className="shadcn-header">
          <div className="shadcn-header-title">{renderViewTitle()}</div>
          <button className="shadcn-btn-outline" onClick={onExit}>
            <ExitIcon />
            Thoát Admin
          </button>
        </header>

        {/* CONTENT */}
        <main className="shadcn-content">
          {/* VIEW: OVERVIEW */}
          {activeView === "overview" && (
            <>
              <div className="shadcn-grid">
                <div className="shadcn-card">
                  <div className="shadcn-card-header">
                    <h3 className="shadcn-card-title">Tổng doanh thu</h3>
                    <DollarIcon />
                  </div>
                  <div>
                    <div className="shadcn-card-value">{parseFloat(contractBalance || 0).toFixed(4)} ETH</div>
                    <div className="shadcn-card-desc">Sẵn sàng để rút về ví</div>
                  </div>
                </div>
                <div className="shadcn-card">
                  <div className="shadcn-card-header">
                    <h3 className="shadcn-card-title">Tổng khóa học</h3>
                    <BookIcon />
                  </div>
                  <div>
                    <div className="shadcn-card-value">{courses?.length || 0}</div>
                    <div className="shadcn-card-desc">Đã tạo trên Smart Contract</div>
                  </div>
                </div>
                <div className="shadcn-card">
                  <div className="shadcn-card-header">
                    <h3 className="shadcn-card-title">Tổng học viên</h3>
                    <UsersIcon />
                  </div>
                  <div>
                    <div className="shadcn-card-value">{buyers?.length || 0}</div>
                    <div className="shadcn-card-desc">Học viên đã mua ít nhất 1 khóa</div>
                  </div>
                </div>
              </div>

              {parseFloat(contractBalance || 0) > 0 && (
                <div className="shadcn-card" style={{ maxWidth: '300px' }}>
                  <div className="shadcn-card-header">
                    <h3 className="shadcn-card-title">Thanh toán (Payout)</h3>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <button className="shadcn-btn-primary" onClick={onWithdraw} disabled={loading} style={{ width: '100%' }}>
                      {loading ? "Đang xử lý..." : "Rút tiền về ví MetaMask"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* VIEW: CREATE */}
          {activeView === "create" && (
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div className="shadcn-card" style={{ flex: '1 1 400px' }}>
                <div className="shadcn-card-header" style={{ marginBottom: '16px' }}>
                  <h3 className="shadcn-card-title">Thông tin khóa học mới</h3>
                </div>
                <form className="shadcn-form" onSubmit={handleSubmit}>
                  <div className="shadcn-input-group">
                    <label className="shadcn-label">Tên khóa học</label>
                    <input type="text" className="shadcn-input" placeholder="Nhập tên khóa học" value={title} onChange={e => setTitle(e.target.value)} required disabled={loading} />
                  </div>
                  <div className="shadcn-input-group">
                    <label className="shadcn-label">Giá (ETH)</label>
                    <input type="number" className="shadcn-input" placeholder="0.05" step="0.001" min="0.001" value={price} onChange={e => setPrice(e.target.value)} required disabled={loading} />
                  </div>
                  <div className="shadcn-input-group">
                    <label className="shadcn-label">Link YouTube</label>
                    <input type="url" className="shadcn-input" placeholder="https://youtube.com/watch?v=..." value={videoUrl} onChange={e => setVideoUrl(e.target.value)} required disabled={loading} />
                  </div>
                  <div className="shadcn-input-group">
                    <label className="shadcn-label">Mô tả chi tiết</label>
                    <textarea className="shadcn-textarea" placeholder="Nội dung khóa học..." value={description} onChange={e => setDescription(e.target.value)} disabled={loading} />
                  </div>
                  <button type="submit" className="shadcn-btn-primary" disabled={loading || !title.trim() || !price || !videoUrl.trim()}>
                    {loading ? "Đang xử lý giao dịch..." : "Tạo khóa học"}
                  </button>
                </form>
              </div>
              
              <div className="shadcn-card" style={{ flex: '1 1 300px', height: 'fit-content' }}>
                <div className="shadcn-card-header" style={{ marginBottom: '16px' }}>
                  <h3 className="shadcn-card-title">Xem trước Video</h3>
                </div>
                {previewId ? (
                  <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '6px', overflow: 'hidden' }}>
                    <iframe src={`https://www.youtube.com/embed/${previewId}?rel=0`} title="Preview" width="100%" height="100%" frameBorder="0" allowFullScreen />
                  </div>
                ) : (
                  <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: '6px', background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa', fontSize: '14px' }}>
                    Chưa có link video
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW: LIST COURSES */}
          {activeView === "list" && (
            <div className="shadcn-table-container">
              <table className="shadcn-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên khóa học</th>
                    <th>Giá</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {courses && courses.length > 0 ? courses.map((course) => (
                    <tr key={course.id}>
                      <td style={{ fontWeight: 500 }}>#{course.id}</td>
                      <td>{course.title}</td>
                      <td>{course.priceEth} ETH</td>
                      <td>
                        <a href={course.videoUrl} target="_blank" rel="noreferrer" style={{ color: '#fafafa', textDecoration: 'underline', fontSize: '13px' }}>Xem video</a>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '32px' }}>Chưa có khóa học nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW: USERS */}
          {activeView === "users" && (
            <div className="shadcn-table-container">
              <table className="shadcn-table">
                <thead>
                  <tr>
                    <th>Địa chỉ ví (Khách hàng)</th>
                    <th>Số khóa đã mua</th>
                    <th>Tổng chi tiêu</th>
                  </tr>
                </thead>
                <tbody>
                  {buyers && buyers.length > 0 ? buyers.map((buyer, idx) => (
                    <tr key={idx}>
                      <td style={{ fontFamily: 'monospace' }}>{buyer.address}</td>
                      <td>{buyer.courses.length}</td>
                      <td>{buyer.totalSpent.toFixed(4)} ETH</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '32px' }}>Chưa có khách hàng nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
