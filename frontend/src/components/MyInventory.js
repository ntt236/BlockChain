/**
 * MyInventory.js - Component hiển thị danh sách khóa học đã sở hữu
 * 
 * Hiển thị các khóa học mà ví hiện tại đã mua thành công.
 * Nếu chưa sở hữu khóa học nào, hiển thị thông báo empty state.
 */

import React from "react";
import CourseCard from "./CourseCard";

export default function MyInventory({ courses, ownerships, onStudy }) {
  // Lọc ra những khóa học đã sở hữu
  const ownedCourses = courses.filter((course) => ownerships[course.id]);

  return (
    <div className="inventory-section">
      {/* Tiêu đề section */}
      <div className="section-header">
        <h2 className="section-title">
          <span className="section-icon">📚</span>
          Kho khóa học của tôi
        </h2>
        <p className="section-subtitle">
          Bạn đang sở hữu <strong>{ownedCourses.length}</strong> khóa học
        </p>
      </div>

      {/* Danh sách khóa học đã sở hữu */}
      {ownedCourses.length > 0 ? (
        <div className="courses-grid">
          {ownedCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isOwned={true}
              onBuy={() => {}}
              onStudy={onStudy}
            />
          ))}
        </div>
      ) : (
        // Empty state - chưa sở hữu khóa học nào
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <h3 className="empty-title">Chưa có khóa học nào</h3>
          <p className="empty-description">
            Hãy khám phá và mua khóa học đầu tiên của bạn tại trang Khóa học!
          </p>
        </div>
      )}
    </div>
  );
}
