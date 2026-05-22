import React, { useState } from "react";
import Navbar from "./components/Navbar";
import CourseCard from "./components/CourseCard";
import CourseDetails from "./components/CourseDetails";
import MyInventory from "./components/MyInventory";
import AdminPanel from "./components/AdminPanel";
import StudyModal from "./components/StudyModal";
import { useWeb3 } from "./context/Web3Context";
import { Search, Filter, Loader2 } from "lucide-react";

export default function App() {
  const { account, isAdmin, courses, ownerships, purchaseCourse, loading, dataLoading, connectWallet } = useWeb3();

  // Tabs: "market", "inventory", "admin"
  const [activeTab, setActiveTab] = useState("market");
  const [studyCourse, setStudyCourse] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");

  // Handle mua khóa học
  const handlePurchase = async (courseId, priceEth) => {
    try {
      await purchaseCourse(courseId, priceEth);
    } catch (e) {
      // Lỗi đã được xử lý bằng toast trong context
    }
  };

  if (dataLoading && !account) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-950 text-gray-400">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Lọc khóa học
  const filteredCourses = courses.filter((c) => {
    if (!c.isActive) return false;
    if (searchTerm && !c.title.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (maxPrice && parseFloat(c.priceEth) > parseFloat(maxPrice)) return false;
    if (minRating) {
      const cRating = c.reviewCount === 0 ? 0 : (c.totalRating / c.reviewCount);
      if (cRating < parseFloat(minRating)) return false;
    }
    return true;
  });

  // Nếu là Admin, HIỂN THỊ DUY NHẤT ADMIN DASHBOARD (Theo yêu cầu)
  if (account && isAdmin) {
    return <AdminPanel onExit={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-50 font-sans selection:bg-blue-500/30">
      {/* Background gradient tinh tế */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-950 to-gray-950"></div>

      {/* Navbar (Chỉ hiện cho User bình thường) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedCourse(null);
          setActiveTab(tab);
        }}
        onConnect={connectWallet}
      />

      {/* Nội dung chính */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        
        {!account ? (
          // ============ CHƯA KẾT NỐI VÍ ============
          <div className="flex flex-col items-center justify-center py-20 text-center lg:py-32">
            <div className="mb-6 inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
              </span>
              Powered by Ethereum & Smart Contracts
            </div>
            <h1 className="mb-6 max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              Học tập không giới hạn với <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Blockchain</span>
            </h1>
            <p className="mb-10 max-w-2xl text-lg text-gray-400">
              Mua và sở hữu khóa học vĩnh viễn trên blockchain. Không trung gian, không rủi ro nền tảng. Toàn quyền kiểm soát tài sản tri thức của bạn.
            </p>
            <button
              onClick={connectWallet}
              disabled={loading}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-blue-600 px-8 py-4 font-medium text-white transition-all hover:bg-blue-500 hover:ring-4 hover:ring-blue-500/30 disabled:opacity-70"
            >
              <span className="mr-2">Kết nối MetaMask để bắt đầu</span>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <svg className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              )}
            </button>
          </div>
        ) : (
          // ============ ĐÃ KẾT NỐI VÍ ============
          <>
            {/* Tab: Cửa hàng */}
            {activeTab === "market" && (
              selectedCourse ? (
                <CourseDetails
                  course={selectedCourse}
                  isOwned={ownerships[selectedCourse.id]}
                  onBuy={() => handlePurchase(selectedCourse.id, selectedCourse.priceEth)}
                  onStudy={() => {
                    setSelectedCourse(null);
                    setStudyCourse(selectedCourse);
                  }}
                  onBack={() => setSelectedCourse(null)}
                  loading={loading}
                />
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-3xl font-bold text-white tracking-tight">Khám phá khóa học</h2>
                      <p className="text-gray-400 mt-1">Học hỏi các kỹ năng Web3 & Lập trình từ các chuyên gia.</p>
                    </div>
                    
                    {/* Search & Filter */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input 
                          type="text" 
                          placeholder="Tìm khóa học..." 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="h-10 w-full sm:w-64 rounded-lg border border-gray-800 bg-gray-900/50 pl-9 pr-4 text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                        />
                      </div>
                      <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input 
                          type="number" 
                          placeholder="Giá tối đa (ETH)" 
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          className="h-10 w-full sm:w-40 rounded-lg border border-gray-800 bg-gray-900/50 pl-9 pr-4 text-sm text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                          step="0.01" min="0"
                        />
                      </div>
                      <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <select
                          value={minRating}
                          onChange={(e) => setMinRating(e.target.value)}
                          className="h-10 w-full sm:w-36 rounded-lg border border-gray-800 bg-gray-900/50 pl-9 pr-8 text-sm text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors appearance-none"
                        >
                          <option value="">Mọi đánh giá</option>
                          <option value="4.5">Từ 4.5 ⭐</option>
                          <option value="4.0">Từ 4.0 ⭐</option>
                          <option value="3.5">Từ 3.5 ⭐</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {filteredCourses.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {filteredCourses.map((course) => (
                        <CourseCard
                          key={course.id}
                          course={course}
                          isOwned={ownerships[course.id]}
                          onSelect={setSelectedCourse}
                          onBuy={() => handlePurchase(course.id, course.priceEth)}
                          loading={loading}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-800 bg-gray-900/20 py-20 text-center">
                      <div className="rounded-full bg-gray-800/50 p-4 mb-4">
                        <Search className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-200">Không tìm thấy khóa học</h3>
                      <p className="mt-2 text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc khoảng giá.</p>
                    </div>
                  )}
                </div>
              )
            )}

            {/* Tab: Kho của tôi */}
            {activeTab === "inventory" && (
              <MyInventory onStudy={(c) => {
                setSelectedCourse(null);
                setStudyCourse(c);
              }} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      {account && (
        <footer className="relative z-10 border-t border-gray-800/60 bg-gray-950/80 backdrop-blur-md py-8">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-sm text-gray-400">
              © 2026 BlockCourse — Hệ thống giáo dục phi tập trung.
            </p>
          </div>
        </footer>
      )}

      {/* Modal Phòng học */}
      {studyCourse && (
        <StudyModal
          course={studyCourse}
          onClose={() => setStudyCourse(null)}
        />
      )}
    </div>
  );
}
