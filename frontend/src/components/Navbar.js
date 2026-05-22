import React from "react";
import { useWeb3 } from "../context/Web3Context";
import { BookOpen, User, Wallet } from "lucide-react";

export default function Navbar({ activeTab, setActiveTab, onConnect }) {
  const { account, balance } = useWeb3();

  // Rút gọn địa chỉ ví: 0x1234...abcd
  const truncateAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-800 bg-gray-950/80 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo */}
        <div 
          className="flex cursor-pointer items-center gap-2 group" 
          onClick={() => account && setActiveTab("market")}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white hidden sm:block">
            BlockCourse
          </span>
        </div>

        {/* Tabs / Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {account && (
            <div className="flex rounded-lg bg-gray-900/50 p-1 border border-gray-800">
              <button
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === "market"
                    ? "bg-gray-800 text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                }`}
                onClick={() => setActiveTab("market")}
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Khóa học</span>
              </button>
              
              <button
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === "inventory"
                    ? "bg-gray-800 text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                }`}
                onClick={() => setActiveTab("inventory")}
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Kho của tôi</span>
              </button>
            </div>
          )}

          {/* User Info / Connect Button */}
          {account ? (
            <div className="flex items-center gap-3">
              <div className="hidden flex-col items-end sm:flex">
                <span className="text-xs font-medium text-gray-400">Số dư</span>
                <span className="text-sm font-bold text-green-400">{parseFloat(balance).toFixed(4)} ETH</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-gray-700 bg-gray-800 py-1.5 pl-2 pr-4 shadow-sm">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400">
                  <Wallet className="h-3 w-3 text-gray-900" />
                </div>
                <span className="text-sm font-medium text-gray-200">{truncateAddress(account)}</span>
              </div>
            </div>
          ) : (
            <button
              onClick={onConnect}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/20"
            >
              Kết nối ví
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
