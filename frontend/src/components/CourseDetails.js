import React, { useState, useEffect } from "react";
import { ArrowLeft, Star, PlayCircle, Users, CheckCircle, Globe, Award, Loader2 } from "lucide-react";
import { getReviews } from "../ContractIntegration";

export default function CourseDetails({ course, isOwned, onBuy, onStudy, onBack, loading }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // Scroll to top when opening
    window.scrollTo(0, 0);
    // Lấy reviews
    getReviews(course.id).then(setReviews).catch(console.error);
  }, [course.id]);

  const rating = course.reviewCount === 0 ? 0 : (course.totalRating / course.reviewCount).toFixed(1);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Banner */}
      <div className="relative -mx-4 -mt-8 mb-12 sm:-mx-6 lg:-mx-8 overflow-hidden bg-gray-900 border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-900/90 to-transparent z-10"></div>
        <div className="absolute top-0 right-0 bottom-0 w-2/3 lg:w-1/2">
          <img 
            src={course.imageUrl || "https://placehold.co/1200x800/1f2937/a1a1aa?text=Banner"} 
            alt="Banner" 
            className="h-full w-full object-cover opacity-30 blur-sm"
          />
        </div>

        <div className="relative z-20 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20 flex flex-col lg:flex-row gap-12">
          
          <div className="flex-1 lg:pr-8">
            <button 
              onClick={onBack}
              className="mb-8 flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Quay lại cửa hàng
            </button>
            
            <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
              {course.title}
            </h1>
            
            <p className="mb-6 max-w-2xl text-lg text-gray-300 line-clamp-3">
              {course.description || "Khám phá kiến thức chuyên sâu với khóa học chất lượng cao, được lưu trữ hoàn toàn phi tập trung trên hệ thống Blockchain."}
            </p>
            
            <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1.5 text-amber-500">
                <span className="font-bold">{rating}</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-4 w-4 ${i < Math.round(rating) ? "fill-amber-500" : "fill-gray-700 text-gray-700"}`} />
                  ))}
                </div>
                <span className="text-gray-400 ml-1">({course.reviewCount} đánh giá)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" /> <span>Hàng nghìn học viên</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="h-4 w-4" /> <span>Tiếng Việt</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <span>Được tạo bởi:</span>
              <span className="font-mono bg-gray-800 px-2 py-1 rounded-md text-blue-400">
                {course.author.slice(0, 6)}...{course.author.slice(-4)}
              </span>
            </div>
          </div>

          {/* Floating Buy Card (Desktop) */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-24 rounded-2xl border border-gray-800 bg-gray-900/90 shadow-2xl backdrop-blur-md overflow-hidden">
              <div className="aspect-video w-full">
                <img 
                  src={course.imageUrl || "https://placehold.co/600x400/1f2937/a1a1aa?text=Thumbnail"} 
                  alt={course.title} 
                  className="h-full w-full object-cover" 
                />
              </div>
              <div className="p-6">
                <div className="mb-6 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-emerald-400">{course.priceEth} ETH</span>
                </div>
                
                {isOwned ? (
                  <button 
                    onClick={() => onStudy(course)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-4 text-sm font-bold text-white transition hover:bg-blue-500"
                  >
                    <PlayCircle className="h-5 w-5" /> Vào học ngay
                  </button>
                ) : (
                  <button 
                    onClick={() => onBuy()}
                    disabled={loading}
                    className="w-full rounded-xl bg-blue-600 px-4 py-4 text-sm font-bold text-white transition hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Mua khóa học"}
                  </button>
                )}
                
                <p className="mt-4 text-center text-xs text-gray-500">
                  Giao dịch an toàn 100% bằng Smart Contract. Quyền sở hữu trọn đời.
                </p>
                
                <div className="mt-6 border-t border-gray-800 pt-6">
                  <h4 className="font-medium text-gray-300 mb-4">Khóa học này bao gồm:</h4>
                  <ul className="space-y-3 text-sm text-gray-400">
                    <li className="flex items-center gap-3"><PlayCircle className="h-4 w-4 text-gray-500" /> Video chất lượng cao</li>
                    <li className="flex items-center gap-3"><CheckCircle className="h-4 w-4 text-gray-500" /> Quyền truy cập trọn đời</li>
                    <li className="flex items-center gap-3"><Award className="h-4 w-4 text-gray-500" /> Giao dịch On-chain</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Buy Card (Visible only on small screens) */}
      <div className="block lg:hidden rounded-2xl border border-gray-800 bg-gray-900/50 p-6 mb-12">
        <div className="mb-4 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-emerald-400">{course.priceEth} ETH</span>
        </div>
        {isOwned ? (
          <button onClick={() => onStudy(course)} className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-4 text-sm font-bold text-white">
            <PlayCircle className="h-5 w-5" /> Vào học ngay
          </button>
        ) : (
          <button onClick={() => onBuy()} disabled={loading} className="w-full rounded-xl bg-blue-600 px-4 py-4 text-sm font-bold text-white">
            {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Mua khóa học"}
          </button>
        )}
      </div>

      {/* Detailed Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        <div className="lg:col-span-2 space-y-12">
          {/* Bạn sẽ học được gì */}
          <div className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Bạn sẽ học được gì?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300 text-sm">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Nắm vững kiến thức chuyên sâu và thực tiễn nhất.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Tự tay xây dựng được các dự án thực tế sau khóa học.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Hiểu rõ nguyên lý hoạt động của nền tảng Blockchain.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <span>Sẵn sàng tham gia vào thị trường lao động Web3.</span>
              </div>
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Mô tả chi tiết</h2>
            <div className="prose prose-invert max-w-none text-gray-400 leading-relaxed whitespace-pre-line">
              {course.description || "Tác giả chưa cung cấp mô tả chi tiết cho khóa học này. Tuy nhiên, nội dung video bên trong chắc chắn sẽ mang lại nhiều giá trị."}
            </div>
          </div>

          {/* Đánh giá */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Star className="h-6 w-6 text-amber-500" /> Phản hồi từ học viên
            </h2>
            
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((r, idx) => (
                  <div key={idx} className="border-b border-gray-800/60 pb-6 last:border-0">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-800 font-bold text-gray-400 text-lg">
                        {r.user.slice(2, 4).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-mono text-sm text-gray-300">{r.user.slice(0, 6)}...{r.user.slice(-4)}</div>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3.5 w-3.5 ${i < r.rating ? "fill-amber-500 text-amber-500" : "text-gray-700"}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed sm:ml-16">{r.comment}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-gray-800 py-12 text-center text-gray-500">
                  Chưa có đánh giá nào. Bạn hãy học và trở thành người đầu tiên đánh giá nhé!
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right empty column for Desktop to respect the floating card space */}
        <div className="hidden lg:block"></div>
      </div>

    </div>
  );
}
