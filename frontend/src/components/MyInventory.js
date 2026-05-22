import React, { useState, useEffect } from "react";
import { useWeb3 } from "../context/Web3Context";
import { PlayCircle, Library, Trophy, Clock, ExternalLink } from "lucide-react";
import { getTransactionHistory } from "../ContractIntegration";
import { ethers } from "ethers";

export default function MyInventory({ onStudy }) {
  const { courses, ownerships, account } = useWeb3();
  const [activeTab, setActiveTab] = useState("courses");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (activeTab === "history" && account && window.ethereum) {
      setLoadingHistory(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      getTransactionHistory(provider, account)
        .then(setHistory)
        .catch(console.error)
        .finally(() => setLoadingHistory(false));
    }
  }, [activeTab, account]);

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
      
      {/* Tab Navigation */}
      <div className="flex items-center gap-6 border-b border-gray-800 mb-8 pb-2">
        <button 
          onClick={() => setActiveTab("courses")}
          className={`flex items-center gap-2 pb-2 text-lg font-bold transition-colors border-b-2 ${activeTab === "courses" ? "border-blue-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}
        >
          <Library className="h-5 w-5" /> Khóa học của tôi
        </button>
        <button 
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 pb-2 text-lg font-bold transition-colors border-b-2 ${activeTab === "history" ? "border-blue-500 text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}
        >
          <Clock className="h-5 w-5" /> Lịch sử giao dịch
        </button>
      </div>
      
      {activeTab === "courses" ? (
        <>
          <p className="text-gray-400 mb-6 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-emerald-500" /> 
            Bạn đã sở hữu {ownedCourses.length} khóa học.
          </p>
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
        </>
      ) : (
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden">
          {loadingHistory ? (
            <div className="p-12 text-center text-gray-500">Đang tải lịch sử giao dịch...</div>
          ) : history.length > 0 ? (
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-gray-800/50 text-xs uppercase text-gray-300">
                <tr>
                  <th className="px-6 py-4">Khóa học</th>
                  <th className="px-6 py-4">Giá tiền</th>
                  <th className="px-6 py-4">Thời gian</th>
                  <th className="px-6 py-4">Tx Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {history.map((tx, idx) => {
                  const courseInfo = courses.find(c => c.id === tx.courseId.toString());
                  return (
                    <tr key={idx} className="hover:bg-gray-800/30">
                      <td className="px-6 py-4 font-medium text-white">{courseInfo ? courseInfo.title : `#${tx.courseId}`}</td>
                      <td className="px-6 py-4 text-emerald-400">{tx.priceEth} ETH</td>
                      <td className="px-6 py-4">{new Date(tx.timestamp).toLocaleString("vi-VN")}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{tx.txHash.slice(0, 10)}...{tx.txHash.slice(-8)}</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-gray-500">Chưa có giao dịch nào được ghi nhận trên Blockchain.</div>
          )}
        </div>
      )}
    </div>
  );
}
