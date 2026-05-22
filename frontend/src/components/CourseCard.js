/**
 * CourseCard.js - Component hiển thị thông tin một khóa học
 * 
 * Hiển thị:
 * - Hình minh họa khóa học (gradient + icon)
 * - Tiêu đề khóa học
 * - Giá (ETH)
 * - Tác giả (rút gọn)
 * - Nút "Mua ngay" hoặc nhãn "Đã sở hữu"
 */

import React, { useState } from "react";

// Mảng gradient màu sắc cho card thumbnail (luân phiên theo ID)
const GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
  "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
];

// Icon SVG cho từng khóa học (luân phiên theo ID) 
const COURSE_ICONS = [
  // Code icon
  <svg key="code" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  // Blockchain icon
  <svg key="block" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  // Design icon
  <svg key="design" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>,
  // Database icon
  <svg key="db" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
];

/**
 * Rút gọn địa chỉ ví tác giả
 */
function shortenAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function CourseCard({ course, isOwned, onBuy, onStudy, loading }) {
  const [buying, setBuying] = useState(false);

  // Chọn gradient và icon dựa trên ID khóa học
  const gradient = GRADIENTS[(course.id - 1) % GRADIENTS.length];
  const icon = COURSE_ICONS[(course.id - 1) % COURSE_ICONS.length];

  /**
   * Xử lý sự kiện nhấn nút "Mua ngay"
   * Gọi callback onBuy và quản lý trạng thái loading
   */
  const handleBuy = async () => {
    setBuying(true);
    try {
      await onBuy(course);
    } catch (error) {
      console.error("Lỗi khi mua khóa học:", error);
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className={`course-card ${isOwned ? "owned" : ""}`}>
      {/* Thumbnail với gradient và icon */}
      <div className="course-thumbnail" style={{ background: gradient }}>
        <div className="course-icon">{icon}</div>
        {/* Nhãn "Đã sở hữu" nếu đã mua */}
        {isOwned && (
          <div className="owned-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Đã sở hữu
          </div>
        )}
      </div>

      {/* Nội dung card */}
      <div className="course-content">
        {/* Tiêu đề */}
        <h3 className="course-title">{course.title}</h3>

        {/* Thông tin tác giả & Đánh giá */}
        <div className="course-meta">
          <p className="course-author">
            <span className="author-label">Giảng viên:</span>
            <span className="author-address">{shortenAddress(course.author)}</span>
          </p>
          <div className="course-rating">
            <span className="rating-star">⭐</span>
            <span className="rating-score">
              {course.reviewCount > 0 
                ? (course.totalRating / course.reviewCount).toFixed(1) 
                : "Chưa có"}
            </span>
            <span className="rating-count">({course.reviewCount})</span>
          </div>
        </div>

        {/* Footer: Giá và nút hành động */}
        <div className="course-footer">
          {/* Giá ETH */}
          <div className="course-price">
            <span className="price-icon">◆</span>
            <span className="price-value">{course.priceEth}</span>
            <span className="price-unit">ETH</span>
          </div>

          {/* Nút hành động */}
          {isOwned ? (
            // Đã sở hữu - hiện nút "Vào học"
            <button className="btn-access" onClick={() => onStudy && onStudy(course)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3"/>
              </svg>
              Vào học
            </button>
          ) : (
            // Chưa mua - hiện nút "Mua ngay"
            <button
              className="btn-buy"
              onClick={handleBuy}
              disabled={buying || loading}
            >
              {buying ? (
                // Hiển thị spinner khi đang xử lý
                <>
                  <div className="spinner"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  Mua ngay
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
