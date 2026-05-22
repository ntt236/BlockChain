import React from "react";
import { Star, Loader2, PlayCircle, Users } from "lucide-react";

export default function CourseCard({ course, isOwned, onBuy, loading, onSelect }) {
  const handleBuy = (e) => {
    e.stopPropagation();
    onBuy();
  };

  const getRating = () => {
    if (course.reviewCount === 0) return 0;
    return (course.totalRating / course.reviewCount).toFixed(1);
  };

  return (
    <div 
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer"
      onClick={() => onSelect && onSelect(course)}
    >
      {/* Thumbnail */}
      <div className="aspect-video w-full overflow-hidden bg-gray-800 relative">
        <img
          src={course.imageUrl || "https://placehold.co/600x400/1f2937/a1a1aa?text=Course+Image"}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => e.target.src="https://placehold.co/600x400/1f2937/a1a1aa?text=Course+Image"}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 to-transparent opacity-60"></div>
        
        {/* Status Badge */}
        {isOwned && (
          <div className="absolute top-3 right-3 rounded-full bg-emerald-500/90 px-2.5 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-sm">
            Đã sở hữu
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-snug text-gray-100 group-hover:text-blue-400 transition-colors">
          {course.title}
        </h3>
        
        <p className="mb-4 line-clamp-2 text-sm text-gray-400 flex-1">
          {course.description || "Chưa có mô tả chi tiết."}
        </p>

        <div className="mt-auto">
          {/* Metadata */}
          <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span className="font-medium text-gray-300">{getRating()}</span>
              <span>({course.reviewCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <span>BlockCourse</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-800/60">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Giá</span>
              <span className="text-lg font-extrabold text-emerald-400">{course.priceEth} ETH</span>
            </div>
            
            {isOwned ? (
              <button disabled className="flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-300 cursor-not-allowed">
                <PlayCircle className="h-4 w-4" /> Đã có sẵn
              </button>
            ) : (
              <button
                onClick={handleBuy}
                disabled={loading}
                className="relative overflow-hidden rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:hover:bg-blue-600"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Mua ngay"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
