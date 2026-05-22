import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { getReviews } from "../ContractIntegration";
import { X, PlayCircle, CheckCircle2, Star, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function StudyModal({ course, onClose }) {
  const { account, isAdmin, addReview, loading } = useWeb3();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [activeLesson, setActiveLesson] = useState(1);

  // Giả lập danh sách bài học
  const mockLessons = [
    { id: 1, title: "Giới thiệu khóa học", duration: "05:20" },
    { id: 2, title: "Cài đặt môi trường", duration: "12:15" },
    { id: 3, title: "Kiến thức cốt lõi", duration: "45:00" },
    { id: 4, title: "Thực hành dự án", duration: "55:30" },
    { id: 5, title: "Tổng kết & Tài liệu", duration: "10:00" },
  ];

  useEffect(() => {
    // Disable body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Tải danh sách đánh giá
    getReviews(course.id).then(setReviews).catch(console.error);

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [course.id]);

  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };
  const videoId = getYouTubeId(course.videoUrl);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return toast.error("Vui lòng nhập nội dung đánh giá!");
    
    try {
      await addReview(course.id, rating, comment.trim());
      setComment("");
      const newReviews = await getReviews(course.id);
      setReviews(newReviews);
    } catch (e) {
      // Handled in context
    }
  };

  const hasReviewed = reviews.some(
    (r) => r.user.toLowerCase() === account?.toLowerCase()
  );

  return (
    <div className="fixed inset-0 z-[100] flex bg-gray-950 font-sans animate-in fade-in duration-300">
      
      {/* Nút đóng */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-gray-800/80 text-gray-400 transition hover:bg-gray-700 hover:text-white"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-950 pb-20">
        
        {/* Video Player */}
        <div className="w-full bg-black">
          <div className="mx-auto max-w-5xl aspect-video w-full">
            {videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                className="h-full w-full"
                title={course.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : course.videoUrl && !course.videoUrl.includes("youtube.com") && !course.videoUrl.includes("youtu.be") ? (
              <video src={course.videoUrl} controls autoPlay className="h-full w-full object-contain bg-black" />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center border border-dashed border-gray-800 bg-gray-900">
                <PlayCircle className="h-16 w-16 mb-4 text-gray-600" />
                <p className="text-gray-400">Không có dữ liệu video cho khóa học này</p>
              </div>
            )}
          </div>
        </div>

        {/* Course Info & Reviews */}
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">{course.title}</h1>
          <p className="text-gray-400 leading-relaxed mb-12 whitespace-pre-line text-lg">
            {course.description || "Chưa có mô tả chi tiết cho khóa học này."}
          </p>

          <div className="border-t border-gray-800 pt-12">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-8">
              <MessageSquare className="h-6 w-6 text-blue-500" /> 
              Đánh giá & Nhận xét ({course.reviewCount})
            </h2>

            {/* Review Form (Hide for Admin) */}
            {!isAdmin && (
              <div className="mb-12">
                {hasReviewed ? (
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-6 flex items-center gap-4">
                    <div className="rounded-full bg-emerald-500/20 p-2">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="font-medium text-emerald-400">Cảm ơn bạn!</h4>
                      <p className="text-sm text-emerald-500/80">Bạn đã đánh giá khóa học này. Ý kiến của bạn rất có giá trị.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitReview} className="rounded-xl border border-gray-800 bg-gray-900/50 p-6">
                    <h3 className="text-lg font-medium text-gray-200 mb-4">Để lại đánh giá của bạn</h3>
                    
                    <div className="mb-4 flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="focus:outline-none"
                        >
                          <Star className={`h-8 w-8 transition-colors ${rating >= star ? "fill-amber-500 text-amber-500" : "text-gray-600"}`} />
                        </button>
                      ))}
                    </div>

                    <textarea
                      className="w-full rounded-lg border border-gray-700 bg-gray-800/50 p-4 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 mb-4"
                      rows="4"
                      placeholder="Khóa học này như thế nào? Hãy chia sẻ trải nghiệm của bạn..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      disabled={loading}
                    />

                    <button
                      type="submit"
                      disabled={loading || !comment.trim()}
                      className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Gửi đánh giá"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Review List */}
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((r, idx) => (
                  <div key={idx} className="rounded-xl border border-gray-800 bg-gray-900/30 p-6">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 font-bold text-gray-400">
                        {r.user.slice(2, 4).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-mono text-sm text-gray-300">{r.user.slice(0, 6)}...{r.user.slice(-4)}</div>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-amber-500 text-amber-500" : "text-gray-700"}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed ml-14">{r.comment}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-gray-800 py-12 text-center text-gray-500">
                  Chưa có đánh giá nào. Bạn hãy là người đầu tiên nhé!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar (Mock Lessons) */}
      <div className="hidden w-80 flex-col border-l border-gray-800 bg-gray-900/80 lg:flex relative">
        <div className="p-6 border-b border-gray-800 pr-16">
          <h2 className="text-lg font-bold text-white">Nội dung khóa học</h2>
          <p className="text-sm text-gray-400 mt-1">1 bài học (Demo)</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {/* Thay vì mock data, hiển thị bài học thật từ videoUrl */}
          <button
            className="w-full flex items-start gap-4 p-4 text-left transition-colors border-b border-gray-800/50 bg-blue-600/10"
          >
            <div className="mt-0.5 font-mono text-xs text-gray-500">01</div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-blue-400">
                Video chính khóa học
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <PlayCircle className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-500">Nội dung trọn gói</span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
