import React from "react";
import { useWeb3 } from "../context/Web3Context";
import { PlayCircle, Library, Trophy } from "lucide-react";

export default function MyInventory({ onStudy }) {
  const { courses, ownerships } = useWeb3();

  // Lọc ra các khóa học mà người dùng đã sở hữu
  const ownedCourses = courses.filter(c => ownerships[c.id]);

  if (ownedCourses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-in fade-in">
        <div className="rounded-full bg-gray-900/80 p-6 mb-6 shadow-inner">
          <Library className="h-12 w-12 text-gray-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-200">Kho của bạn đang trống</h2>
        <p className="mt-2 text-gray-500 max-w-md text-center">
          Bạn chưa sở hữu khóa học nào. Hãy quay lại cửa hàng để khám phá và bắt đầu hành trình học tập.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Khóa học của tôi</h2>
          <p className="text-gray-400 mt-1 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-emerald-500" /> 
            Bạn đã sở hữu {ownedCourses.length} khóa học.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ownedCourses.map((course) => (
          <div 
            key={course.id} 
            className="group cursor-pointer flex flex-col overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50 transition-all hover:-translate-y-1 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10"
            onClick={() => onStudy(course)}
          >
            <div className="aspect-video relative overflow-hidden bg-gray-800">
              <img
                src={course.imageUrl || "https://placehold.co/600x400/1f2937/a1a1aa?text=Course+Image"}
                alt={course.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                onError={(e) => e.target.src="https://placehold.co/600x400/1f2937/a1a1aa?text=Course+Image"}
              />
              <div className="absolute inset-0 bg-gray-950/20 group-hover:bg-transparent transition-colors"></div>
              
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="rounded-full bg-blue-600/90 p-3 shadow-lg backdrop-blur-sm">
                  <PlayCircle className="h-8 w-8 text-white fill-white/20" />
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-5">
              <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-snug text-gray-100 group-hover:text-blue-400 transition-colors">
                {course.title}
              </h3>
              
              <div className="mt-auto">
                <div className="h-1.5 w-full rounded-full bg-gray-800 overflow-hidden mb-3">
                  <div className="h-full rounded-full bg-blue-500 w-0 group-hover:w-1/3 transition-all duration-1000"></div>
                </div>
                <div className="text-xs font-medium text-gray-400">
                  Bấm để bắt đầu học
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
