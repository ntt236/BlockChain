import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { getAllBuyers } from "../ContractIntegration";
import { 
  Package, LayoutDashboard, Library, Users, LogOut,
  Wallet, BookOpen, PlusCircle, UploadCloud
} from "lucide-react";
import { toast } from "react-hot-toast";
import { uploadToIPFS } from "../utils/pinata";

export default function AdminPanel({ onExit }) {
  const { createCourse, updateCourse, loading, courses, contractBalance, withdrawFunds } = useWeb3();
  
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [editCourseId, setEditCourseId] = useState(null);
  
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const [activeView, setActiveView] = useState("overview"); 
  const [buyers, setBuyers] = useState([]);

  useEffect(() => {
    getAllBuyers().then(setBuyers).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Tên khóa học không được trống!");
    if (!price || parseFloat(price) <= 0) return toast.error("Giá khóa học phải lớn hơn 0!");
    if (!videoUrl.trim()) return toast.error("Link video không được trống!");
    if (!imageUrl.trim()) return toast.error("Link ảnh thumbnail không được trống!");

    try {
      if (editCourseId) {
        await updateCourse(editCourseId, title.trim(), price, videoUrl.trim(), description.trim(), imageUrl.trim());
      } else {
        await createCourse(title.trim(), price, videoUrl.trim(), description.trim(), imageUrl.trim());
      }
      resetForm();
      setActiveView("list");
    } catch (error) {
      // Error handled by context
    }
  };

  const resetForm = () => {
    setTitle(""); setPrice(""); setVideoUrl(""); setImageUrl(""); setDescription(""); setEditCourseId(null);
  };

  const handleEdit = (course) => {
    setEditCourseId(course.id);
    setTitle(course.title);
    setPrice(course.priceEth);
    setVideoUrl(course.videoUrl);
    setImageUrl(course.imageUrl || "");
    setDescription(course.description || "");
    setActiveView("create");
  };

  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };
  const previewId = getYouTubeId(videoUrl);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const toastId = toast.loading("Đang tải ảnh lên IPFS...");
      const ipfsUrl = await uploadToIPFS(file);
      setImageUrl(ipfsUrl);
      toast.success("Tải ảnh lên IPFS thành công!", { id: toastId });
    } catch (error) {
      toast.error(error.message || "Lỗi tải ảnh lên IPFS");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploadingVideo(true);
      const toastId = toast.loading("Đang tải video lên IPFS... (Vui lòng chờ)");
      const ipfsUrl = await uploadToIPFS(file);
      setVideoUrl(ipfsUrl);
      toast.success("Tải video lên IPFS thành công!", { id: toastId });
    } catch (error) {
      toast.error(error.message || "Lỗi tải video lên IPFS");
    } finally {
      setUploadingVideo(false);
    }
  };

  const renderViewTitle = () => {
    switch (activeView) {
      case "overview": return "Tổng quan hệ thống";
      case "list": return "Quản lý khóa học";
      case "create": return editCourseId ? "Sửa khóa học" : "Tạo khóa học mới";
      case "users": return "Quản lý khách hàng";
      default: return "Admin Dashboard";
    }
  };

  return (
    <div className="flex h-screen w-full fixed top-0 left-0 z-[100] bg-gray-950 font-sans text-gray-100">
      {/* SIDEBAR */}
      <aside className="w-72 border-r border-gray-800 bg-gray-950 flex flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-gray-800 px-6 font-semibold text-white">
          <Package className="h-6 w-6 text-blue-500" />
          <span>BlockCourse Admin</span>
        </div>
        
        <nav className="flex-1 space-y-1 p-4">
          <button 
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${activeView === "overview" ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-900 hover:text-white"}`}
            onClick={() => setActiveView("overview")}
          >
            <LayoutDashboard className="h-4 w-4" /> Tổng quan
          </button>
          <button 
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${activeView === "list" ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-900 hover:text-white"}`}
            onClick={() => setActiveView("list")}
          >
            <Library className="h-4 w-4" /> Quản lý khóa học
          </button>
          <button 
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${activeView === "create" ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-900 hover:text-white"}`}
            onClick={() => { resetForm(); setActiveView("create"); }}
          >
            <PlusCircle className="h-4 w-4" /> Tạo khóa học mới
          </button>
          <button 
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${activeView === "users" ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-900 hover:text-white"}`}
            onClick={() => setActiveView("users")}
          >
            <Users className="h-4 w-4" /> Khách hàng
          </button>
        </nav>

        <div className="p-4 mt-auto">
          <button 
            onClick={onExit} 
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Thoát Admin
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 flex-col overflow-hidden bg-gray-950">
        <header className="flex h-16 items-center justify-between border-b border-gray-800 px-8">
          <h1 className="text-lg font-semibold text-white">{renderViewTitle()}</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          
          {/* VIEW: OVERVIEW */}
          {activeView === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-400">Doanh thu chờ rút</h3>
                    <Wallet className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">{parseFloat(contractBalance || 0).toFixed(4)}</span>
                    <span className="text-sm text-gray-400">ETH</span>
                  </div>
                </div>
                
                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-400">Tổng khóa học</h3>
                    <BookOpen className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">{courses?.length || 0}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-400">Tổng khách hàng</h3>
                    <Users className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">{buyers?.length || 0}</span>
                  </div>
                </div>
              </div>

              {parseFloat(contractBalance || 0) > 0 && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6 max-w-md">
                  <h3 className="text-lg font-semibold text-emerald-400 mb-2">Thanh toán</h3>
                  <p className="text-sm text-gray-400 mb-4">Bạn có doanh thu trên Smart Contract sẵn sàng để rút về ví.</p>
                  <button 
                    onClick={withdrawFunds} 
                    disabled={loading}
                    className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {loading ? "Đang xử lý..." : "Rút tiền về MetaMask"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW: CREATE */}
          {activeView === "create" && (
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">Tên khóa học <span className="text-red-400">*</span></label>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} required disabled={loading}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                      placeholder="VD: Web3 DApp Development" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">Giá bán (ETH) <span className="text-red-400">*</span></label>
                    <input type="number" step="0.001" min="0.001" value={price} onChange={e => setPrice(e.target.value)} required disabled={loading}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                      placeholder="0.05" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">Link ảnh Thumbnail (Hoặc tải lên IPFS) <span className="text-red-400">*</span></label>
                    <div className="flex gap-2">
                      <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} required disabled={loading || uploadingImage}
                        className="flex-1 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                        placeholder="https://... hoặc ipfs://..." />
                      <label className="cursor-pointer flex items-center justify-center gap-2 rounded-lg bg-gray-800 px-4 py-2.5 font-medium text-gray-300 transition hover:bg-gray-700 hover:text-white">
                        <UploadCloud className="h-4 w-4" />
                        {uploadingImage ? "Đang tải..." : "Tải lên"}
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage || loading} />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">Link Video (Hoặc tải lên IPFS) <span className="text-red-400">*</span></label>
                    <div className="flex gap-2">
                      <input type="text" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} required disabled={loading || uploadingVideo}
                        className="flex-1 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                        placeholder="https://youtube.com/watch?v=... hoặc ipfs://..." />
                      <label className="cursor-pointer flex items-center justify-center gap-2 rounded-lg bg-gray-800 px-4 py-2.5 font-medium text-gray-300 transition hover:bg-gray-700 hover:text-white">
                        <UploadCloud className="h-4 w-4" />
                        {uploadingVideo ? "Đang tải..." : "Tải lên"}
                        <input type="file" className="hidden" accept="video/*" onChange={handleVideoUpload} disabled={uploadingVideo || loading} />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">Mô tả khóa học</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} disabled={loading} rows={4}
                      className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" 
                      placeholder="Nội dung chi tiết..." />
                  </div>
                  <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-500 disabled:opacity-50">
                    {loading ? "Đang xử lý..." : (editCourseId ? "Lưu thay đổi" : "Tạo khóa học")}
                  </button>
                  {editCourseId && (
                    <button type="button" onClick={() => { resetForm(); setActiveView("list"); }} disabled={loading} className="w-full rounded-lg bg-gray-800 px-4 py-3 font-medium text-white transition hover:bg-gray-700 disabled:opacity-50 mt-2">
                      Hủy thao tác
                    </button>
                  )}
                </form>
              </div>
              
              <div className="w-full lg:w-80 space-y-6">
                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                  <h3 className="mb-4 text-sm font-medium text-gray-300">Xem trước Thumbnail</h3>
                  {imageUrl ? (
                    <img src={imageUrl} alt="Thumbnail" className="w-full aspect-video rounded-lg object-cover bg-gray-800" onError={(e) => e.target.src="https://placehold.co/600x400/1f2937/a1a1aa?text=Image+Error"}/>
                  ) : (
                    <div className="flex w-full aspect-video items-center justify-center rounded-lg bg-gray-800 text-sm text-gray-500">Chưa có ảnh</div>
                  )}
                </div>
                <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                  <h3 className="mb-4 text-sm font-medium text-gray-300">Xem trước Video</h3>
                  {previewId ? (
                    <iframe src={`https://www.youtube.com/embed/${previewId}?rel=0`} className="w-full aspect-video rounded-lg bg-gray-800" title="Preview" frameBorder="0" allowFullScreen />
                  ) : videoUrl && !videoUrl.includes("youtube.com") && !videoUrl.includes("youtu.be") ? (
                    <video src={videoUrl} controls className="w-full aspect-video rounded-lg bg-gray-800 object-cover" />
                  ) : (
                    <div className="flex w-full aspect-video items-center justify-center rounded-lg bg-gray-800 text-sm text-gray-500">Chưa có video</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: LIST */}
          {activeView === "list" && (
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-gray-800/50 text-xs uppercase text-gray-300">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Tên khóa học</th>
                    <th className="px-6 py-4">Giá</th>
                    <th className="px-6 py-4">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {courses && courses.length > 0 ? courses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-800/30">
                      <td className="px-6 py-4 font-medium text-white">#{course.id}</td>
                      <td className="px-6 py-4">{course.title}</td>
                      <td className="px-6 py-4 text-emerald-400">{course.priceEth} ETH</td>
                      <td className="px-6 py-4 flex gap-3">
                        <a href={course.videoUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Xem video</a>
                        <button onClick={() => handleEdit(course)} className="text-amber-400 hover:underline">Sửa</button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" className="px-6 py-8 text-center">Chưa có khóa học nào.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW: USERS */}
          {activeView === "users" && (
            <div className="rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-gray-800/50 text-xs uppercase text-gray-300">
                  <tr>
                    <th className="px-6 py-4">Khách hàng</th>
                    <th className="px-6 py-4">Khóa đã mua</th>
                    <th className="px-6 py-4">Tổng chi tiêu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {buyers && buyers.length > 0 ? buyers.map((buyer, idx) => (
                    <tr key={idx} className="hover:bg-gray-800/30">
                      <td className="px-6 py-4 font-mono text-xs text-white">{buyer.address}</td>
                      <td className="px-6 py-4">{buyer.courses.length}</td>
                      <td className="px-6 py-4 text-emerald-400">{buyer.totalSpent.toFixed(4)} ETH</td>
                    </tr>
                  )) : (
                    <tr><td colSpan="3" className="px-6 py-8 text-center">Chưa có khách hàng nào.</td></tr>
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
