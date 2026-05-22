/**
 * App.js - Component gốc của ứng dụng BlockCourse
 * 
 * Quản lý toàn bộ state chính:
 * - Kết nối ví MetaMask
 * - Danh sách khóa học
 * - Trạng thái sở hữu
 * - Điều hướng tabs
 */

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "./components/Navbar";
import CourseCard from "./components/CourseCard";
import MyInventory from "./components/MyInventory";
import AdminPanel from "./components/AdminPanel";
import StudyModal from "./components/StudyModal";
import {
  connectWallet,
  fetchAllCourses,
  checkAllOwnerships,
  purchaseCourse,
  createCourse,
  getAdmin,
  getBalance,
  getContractBalance,
  withdrawFunds,
  addReview,
  getReviews,
} from "./ContractIntegration";
import "./App.css";

function App() {
  // ============ STATE MANAGEMENT ============

  // Thông tin ví MetaMask
  const [account, setAccount] = useState(null);       // Địa chỉ ví
  const [balance, setBalance] = useState("0");        // Số dư ETH
  const [provider, setProvider] = useState(null);      // Ethers Provider
  const [signer, setSigner] = useState(null);          // Ethers Signer
  const [contractBalance, setContractBalance] = useState("0"); // Số dư ETH trong contract

  // Dữ liệu khóa học
  const [courses, setCourses] = useState([]);          // Danh sách tất cả khóa học
  const [ownerships, setOwnerships] = useState({});    // Mapping sở hữu {courseId: bool}

  // Trạng thái UI
  const [loading, setLoading] = useState(false);       // Trạng thái loading chung
  const [activeTab, setActiveTab] = useState("market");// Tab: market | inventory | admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [notification, setNotification] = useState(null);
  const [studyCourse, setStudyCourse] = useState(null);

  // ============ HÀM HIỂN THỊ THÔNG BÁO ============

  /**
   * Hiển thị thông báo pop-up và tự động ẩn sau 4 giây
   * @param {string} message - Nội dung thông báo
   * @param {string} type - Loại: "success", "error", "info"
   */
  const showNotification = useCallback((message, type = "info") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // ============ HÀM TẢI DỮ LIỆU ============

  /**
   * Tải danh sách khóa học và kiểm tra quyền sở hữu từ blockchain
   */
  const loadBlockchainData = useCallback(async (prov, addr) => {
    try {
      setLoading(true);

      // Lấy tất cả khóa học từ contract (dùng JsonRpcProvider trực tiếp)
      const allCourses = await fetchAllCourses();
      setCourses(allCourses);

      // Lấy số dư của Smart Contract
      const cBalance = await getContractBalance();
      setContractBalance(cBalance);

      // Kiểm tra quyền sở hữu cho từng khóa học
      if (addr && allCourses.length > 0) {
        const ownershipMap = await checkAllOwnerships(null, addr, allCourses);
        setOwnerships(ownershipMap);
      }

      // Kiểm tra xem ví đang kết nối có phải Admin không
      const adminAddress = await getAdmin(prov);
      console.log("=== DEBUG ADMIN ===");
      console.log("Địa chỉ Admin thực sự (từ contract):", adminAddress);
      console.log("Địa chỉ ví của bạn đang kết nối:", addr);
      
      const adminCheck = addr?.toLowerCase() === adminAddress?.toLowerCase();
      console.log("Có phải admin không?", adminCheck);
      
      setIsAdmin(adminCheck);
      // Admin mặc định vào trang quản trị
      if (adminCheck) setActiveTab("admin");
      else setActiveTab("market");

    } catch (error) {
      console.error("Lỗi khi tải dữ liệu blockchain:", error);
      showNotification(`Lỗi Ganache: ${error.message || error.code || "Không rõ"}`, "error");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  // ============ HÀM KẾT NỐI VÍ ============

  /**
   * Xử lý kết nối ví MetaMask
   * Gọi hàm connectWallet từ ContractIntegration
   */
  const handleConnect = async () => {
    try {
      setLoading(true);
      
      // Kết nối ví MetaMask
      const wallet = await connectWallet();
      
      // Lưu thông tin ví vào state
      setAccount(wallet.address);
      setBalance(wallet.balance);
      setProvider(wallet.provider);
      setSigner(wallet.signer);

      showNotification("Kết nối ví thành công!", "success");

      // Tải dữ liệu blockchain
      await loadBlockchainData(wallet.provider, wallet.address);

    } catch (error) {
      console.error("Lỗi kết nối ví:", error);
      showNotification(error.message || "Không thể kết nối ví MetaMask!", "error");
    } finally {
      setLoading(false);
    }
  };

  // ============ HÀM MUA KHÓA HỌC ============

  /**
   * Xử lý mua khóa học
   * @param {Object} course - Object khóa học cần mua
   */
  const handleBuy = async (course) => {
    if (!signer) {
      showNotification("Vui lòng kết nối ví trước!", "error");
      return;
    }

    try {
      setLoading(true);
      showNotification(`Đang xử lý giao dịch mua "${course.title}"...`, "info");

      // Gọi hàm purchaseCourse trên contract và đợi xác nhận
      await purchaseCourse(signer, course.id, course.price);

      showNotification(`Mua "${course.title}" thành công! 🎉`, "success");

      // Cập nhật lại số dư ví
      const newBalance = await getBalance(provider, account);
      setBalance(newBalance);

      // Cập nhật lại trạng thái sở hữu
      await loadBlockchainData(provider, account);

    } catch (error) {
      console.error("Lỗi khi mua khóa học:", error);
      
      // Xử lý các loại lỗi cụ thể
      if (error.message?.includes("Da so huu")) {
        showNotification("Bạn đã sở hữu khóa học này rồi!", "error");
      } else if (error.message?.includes("khong du")) {
        showNotification("Số dư ETH không đủ để mua khóa học!", "error");
      } else if (error.code === "ACTION_REJECTED") {
        showNotification("Giao dịch đã bị từ chối!", "error");
      } else {
        showNotification("Giao dịch thất bại. Vui lòng thử lại!", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // ============ HÀM TẠO KHÓA HỌC (ADMIN) ============

  /**
   * Xử lý tạo khóa học mới (chỉ Admin)
   * @param {string} title - Tên khóa học
   * @param {string} priceEth - Giá (ETH)
   */
  const handleCreateCourse = async (title, priceEth, videoUrl, description) => {
    if (!signer) {
      showNotification("Vui lòng kết nối ví trước!", "error");
      return;
    }
    try {
      setLoading(true);
      showNotification(`Đang tạo khóa học "${title}"...`, "info");
      await createCourse(signer, title, priceEth, videoUrl, description);
      showNotification(`Tạo khóa học "${title}" thành công! 🎉`, "success");
      await loadBlockchainData(provider, account);
    } catch (error) {
      console.error("Lỗi khi tạo khóa học:", error);
      if (error.code === "ACTION_REJECTED")
        showNotification("Giao dịch đã bị từ chối!", "error");
      else
        showNotification("Không thể tạo khóa học. Chỉ Admin mới có quyền!", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xử lý Admin rút tiền (Withdraw)
   */
  const handleWithdraw = async () => {
    if (!signer) return;
    try {
      setLoading(true);
      showNotification("Đang xử lý rút tiền...", "info");
      await withdrawFunds(signer);
      showNotification("Đã rút toàn bộ doanh thu thành công! 💸", "success");
      
      // Cập nhật lại số dư
      const newBal = await getBalance(provider, account);
      setBalance(newBal);
      const cBal = await getContractBalance();
      setContractBalance(cBal);
    } catch (error) {
      console.error("Lỗi khi rút tiền:", error);
      if (error.code === "ACTION_REJECTED")
        showNotification("Giao dịch đã bị từ chối!", "error");
      else
        showNotification("Lỗi khi rút tiền!", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xử lý User gửi đánh giá (Rating & Review)
   */
  const handleAddReview = async (courseId, rating, comment) => {
    if (!signer) return;
    try {
      setLoading(true);
      showNotification("Đang gửi đánh giá lên Blockchain...", "info");
      await addReview(signer, courseId, rating, comment);
      showNotification("Gửi đánh giá thành công! ⭐", "success");
      
      // Tải lại dữ liệu để cập nhật số sao trên Marketplace
      await loadBlockchainData(provider, account);
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
      if (error.code === "ACTION_REJECTED")
        showNotification("Giao dịch đã bị từ chối!", "error");
      else
        showNotification("Lỗi khi gửi đánh giá! (Có thể bạn đã đánh giá rồi)", "error");
    } finally {
      setLoading(false);
    }
  };

  // ============ LẮNG NGHE SỰ KIỆN VÀ TỰ ĐỘNG KẾT NỐI ============

  // Tự động kết nối lại khi tải lại trang (nếu ví đã cấp quyền trước đó)
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" });
          if (accounts.length > 0) {
            // Đã từng kết nối và đang mở khóa MetaMask -> Tự động kết nối luôn
            handleConnect();
          }
        } catch (error) {
          console.error("Lỗi kiểm tra kết nối tự động:", error);
        }
      }
    };
    checkConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      // Lắng nghe khi người dùng đổi tài khoản MetaMask
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          // Người dùng ngắt kết nối
          setAccount(null);
          setBalance("0");
          setSigner(null);
          setProvider(null);
          setCourses([]);
          setOwnerships({});
          setIsAdmin(false);
          showNotification("Ví đã bị ngắt kết nối!", "info");
        } else {
          // Đổi sang tài khoản mới - kết nối lại
          handleConnect();
        }
      };

      // Lắng nghe khi đổi mạng (chain)
      const handleChainChanged = () => {
        // Tải lại trang khi đổi mạng
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      // Cleanup listeners khi component unmount
      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============ RENDER ============

  return (
    <div className="app">
      {/* Hiệu ứng nền gradient động */}
      <div className="bg-gradient"></div>

      {/* Thanh điều hướng (Chỉ hiện khi không ở trang Admin) */}
      {!(activeTab === "admin" && isAdmin) && (
        <Navbar
          account={account}
          balance={balance}
          isAdmin={isAdmin}
          onConnect={handleConnect}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}

      {/* Thông báo pop-up */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button
            className="notification-close"
            onClick={() => setNotification(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* Nội dung chính */}
      <main className="main-content">
        {!account ? (
          // ============ CHƯA KẾT NỐI VÍ ============
          <div className="hero-section">
            <div className="hero-content">
              <div className="hero-badge">🔗 Powered by Ethereum</div>
              <h1 className="hero-title">
                Học tập không giới hạn với
                <span className="hero-highlight"> Blockchain</span>
              </h1>
              <p className="hero-description">
                Mua và sở hữu khóa học mãi mãi trên blockchain. 
                Không trung gian, không phụ thuộc nền tảng.
                Dữ liệu minh bạch, an toàn tuyệt đối.
              </p>
              <button className="hero-connect-btn" onClick={handleConnect}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                  <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                  <circle cx="18" cy="16" r="2" />
                </svg>
                Kết nối MetaMask để bắt đầu
              </button>
              <p className="hero-note">
                * Yêu cầu cài đặt MetaMask và kết nối mạng Ganache
              </p>
            </div>

            {/* Feature cards */}
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3>An toàn</h3>
                <p>Dữ liệu sở hữu lưu trên blockchain, không ai có thể thay đổi</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💎</div>
                <h3>Minh bạch</h3>
                <p>Mọi giao dịch đều công khai, có thể kiểm chứng bất cứ lúc nào</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3>Nhanh chóng</h3>
                <p>Giao dịch được xử lý tức thì, không cần chờ xét duyệt</p>
              </div>
            </div>
          </div>
        ) : (
          // ============ ĐÃ KẾT NỐI VÍ ============
          <>
            {/* Tab: Marketplace */}
            {activeTab === "market" && (
              <div className="market-section">
                <div className="section-header">
                  <h2 className="section-title">
                    <span className="section-icon">🏪</span>
                    Khóa học có sẵn
                  </h2>
                  <p className="section-subtitle">
                    Khám phá và sở hữu các khóa học chất lượng cao
                  </p>
                </div>

                {loading && courses.length === 0 ? (
                  // Loading state
                  <div className="loading-state">
                    <div className="spinner large"></div>
                    <p>Đang tải dữ liệu từ blockchain...</p>
                  </div>
                ) : courses.length > 0 ? (
                  // Hiển thị grid khóa học
                  <div className="courses-grid">
                    {courses.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        isOwned={ownerships[course.id] || false}
                        onBuy={handleBuy}
                        onStudy={(c) => setStudyCourse(c)}
                        loading={loading}
                      />
                    ))}
                  </div>
                ) : (
                  // Empty state
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <h3 className="empty-title">Chưa có khóa học nào</h3>
                    <p className="empty-description">
                      {isAdmin
                        ? "Bạn là Admin! Hãy chuyển sang tab Admin để tạo khóa học đầu tiên."
                        : "Hiện chưa có khóa học nào. Vui lòng quay lại sau!"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Inventory */}
            {activeTab === "inventory" && (
              <MyInventory courses={courses} ownerships={ownerships} onStudy={(c) => setStudyCourse(c)} />
            )}

            {/* Tab: Admin Portal — riêng biệt hoàn toàn */}
            {activeTab === "admin" && isAdmin && (
              <AdminPanel
                onCreateCourse={handleCreateCourse}
                loading={loading}
                courses={courses}
                contractBalance={contractBalance}
                onWithdraw={handleWithdraw}
                onExit={() => setActiveTab("market")}
              />
            )}

            {/* Nếu là admin nhưng nhấn sai tab */}
            {activeTab === "admin" && !isAdmin && (
              <div className="empty-state">
                <div className="empty-icon">🔒</div>
                <h3 className="empty-title">Không có quyền truy cập</h3>
                <p className="empty-description">Chỉ Admin mới có thể xem trang này.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer (Chỉ hiện khi không ở trang Admin) */}
      {!(activeTab === "admin" && isAdmin) && (
        <footer className="app-footer">
          <p>© 2026 BlockCourse — Hệ thống mua khóa học Online bằng Blockchain</p>
          <p className="footer-sub">Đồ án cuối kỳ | Solidity • React • Ethers.js • Ganache</p>
        </footer>
      )}

      {/* Popup Phòng học */}
      {studyCourse && (
        <StudyModal
          course={studyCourse}
          onClose={() => setStudyCourse(null)}
          onAddReview={handleAddReview}
          getReviews={getReviews}
          currentUser={account}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}

export default App;
