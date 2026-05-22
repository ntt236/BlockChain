/**
 * StudyModal.js - Component "Phòng học" hiển thị nội dung khóa học
 *
 * Video được lấy từ Blockchain (do Admin nhập lúc tạo khóa học)
 * Danh sách bài học là demo minh hoạ tiến trình học tập
 */

import React, { useState, useEffect } from "react";

// ===== Trích YouTube Video ID từ bất kỳ dạng link nào =====
function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

// ===== Danh sách bài học demo theo ID khóa học =====
const LESSON_TEMPLATES = [
  [
    { id: 1, title: "Giới thiệu & Tổng quan", duration: "12:30", completed: true },
    { id: 2, title: "Cài đặt môi trường", duration: "18:45", completed: true },
    { id: 3, title: "Bài học chính — Nội dung video", duration: "25:10", completed: false },
    { id: 4, title: "Deploy & Kiểm thử", duration: "20:00", completed: false },
    { id: 5, title: "Bảo mật & Best practices", duration: "30:15", completed: false },
    { id: 6, title: "Dự án thực hành cuối khóa", duration: "45:00", completed: false },
  ],
  [
    { id: 1, title: "Tổng quan hệ sinh thái Web3", duration: "15:00", completed: true },
    { id: 2, title: "Frontend kết nối Smart Contract", duration: "22:30", completed: false },
    { id: 3, title: "Bài học chính — Nội dung video", duration: "28:15", completed: false },
    { id: 4, title: "MetaMask Integration", duration: "19:45", completed: false },
    { id: 5, title: "Events & Transaction", duration: "24:00", completed: false },
    { id: 6, title: "Deploy DApp production", duration: "35:00", completed: false },
  ],
  [
    { id: 1, title: "Khái niệm & Lịch sử", duration: "14:20", completed: true },
    { id: 2, title: "ERC-20 Token Standard", duration: "20:00", completed: true },
    { id: 3, title: "Bài học chính — Nội dung video", duration: "32:45", completed: false },
    { id: 4, title: "Yield Farming", duration: "27:10", completed: false },
    { id: 5, title: "Flash Loans & Arbitrage", duration: "35:30", completed: false },
    { id: 6, title: "Xây dựng DEX đơn giản", duration: "50:00", completed: false },
  ],
];

function getLessons(courseId) {
  return LESSON_TEMPLATES[(courseId - 1) % LESSON_TEMPLATES.length];
}

// ============ COMPONENT CHÍNH ============

export default function StudyModal({ course, onClose, onAddReview, getReviews, currentUser, isAdmin }) {
  const lessons = getLessons(course.id);
  const [activeLesson, setActiveLesson] = useState(lessons[0]);
  const [completedLessons, setCompletedLessons] = useState(
    () => new Set(lessons.filter(l => l.completed).map(l => l.id))
  );

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (getReviews) {
      getReviews(course.id).then(setReviews).catch(console.error);
    }
  }, [course.id, getReviews]);

  const hasReviewed = reviews.some(r => r.user?.toLowerCase() === currentUser?.toLowerCase());

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !onAddReview) return;
    setIsSubmitting(true);
    await onAddReview(course.id, rating, comment.trim());
    setIsSubmitting(false);
    // Reload reviews
    if (getReviews) {
      getReviews(course.id).then(setReviews).catch(console.error);
    }
  };

  // Lấy video ID từ URL do Admin nhập trên Blockchain
  const videoId = extractYouTubeId(course.videoUrl);

  const progress = Math.round((completedLessons.size / lessons.length) * 100);

  const toggleComplete = (lessonId) => {
    setCompletedLessons(prev => {
      const next = new Set(prev);
      next.has(lessonId) ? next.delete(lessonId) : next.add(lessonId);
      return next;
    });
  };

  const goToNextLesson = () => {
    const idx = lessons.findIndex(l => l.id === activeLesson.id);
    if (idx < lessons.length - 1) {
      setCompletedLessons(prev => new Set([...prev, activeLesson.id]));
      setActiveLesson(lessons[idx + 1]);
    }
  };

  const goToPrevLesson = () => {
    const idx = lessons.findIndex(l => l.id === activeLesson.id);
    if (idx > 0) setActiveLesson(lessons[idx - 1]);
  };

  return (
    <div className="study-modal-overlay" onClick={onClose}>
      <div className="study-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="study-modal-header">
          <div className="study-header-info">
            <div className="study-header-badge">📖 Phòng học</div>
            <h2 className="study-header-title">{course.title}</h2>
            <p className="study-header-sub">
              {lessons.length} bài học • Tiến trình: {progress}%
            </p>
          </div>
          <button className="study-close-btn" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Thanh tiến trình */}
        <div className="study-progress-bar">
          <div className="study-progress-fill" style={{ width: `${progress}%` }}>
            <span className="study-progress-text">{progress}%</span>
          </div>
        </div>

        {/* Nội dung chính */}
        <div className="study-modal-body">
          
          {/* Cột trái: Video Player */}
          <div className="study-video-section">
            {/* Video từ blockchain - do Admin nhập link */}
            {videoId ? (
              <div className="study-video-wrapper">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                  title={course.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="study-no-video">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <p>Link video chưa được cung cấp cho khóa học này</p>
                {course.videoUrl && (
                  <a href={course.videoUrl} target="_blank" rel="noopener noreferrer" className="study-external-link">
                    Mở video bên ngoài ↗
                  </a>
                )}
              </div>
            )}

            {/* Thông tin bài học đang xem */}
            <div className="study-lesson-info">
              <div className="study-lesson-current">
                <span className="study-lesson-number">Bài {activeLesson.id}</span>
                <h3 className="study-lesson-title">{activeLesson.title}</h3>
                <span className="study-lesson-duration">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {activeLesson.duration}
                </span>
              </div>
              
              {/* Nút điều hướng bài học */}
              <div className="study-nav-buttons">
                <button 
                  className="study-nav-btn" 
                  onClick={goToPrevLesson}
                  disabled={lessons.findIndex(l => l.id === activeLesson.id) === 0}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  Bài trước
                </button>
                <button 
                  className="study-mark-btn"
                  onClick={() => toggleComplete(activeLesson.id)}
                >
                  {completedLessons.has(activeLesson.id) ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Đã hoàn thành
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/>
                      </svg>
                      Đánh dấu hoàn thành
                    </>
                  )}
                </button>
                <button 
                  className="study-nav-btn next"
                  onClick={goToNextLesson}
                  disabled={lessons.findIndex(l => l.id === activeLesson.id) === lessons.length - 1}
                >
                  Bài tiếp
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Cột phải: Danh sách bài học */}
          <div className="study-sidebar">
            <h4 className="study-sidebar-title">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
              Danh sách bài học
            </h4>
            <div className="study-lesson-list">
              {lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  className={`study-lesson-item ${activeLesson.id === lesson.id ? "active" : ""} ${completedLessons.has(lesson.id) ? "completed" : ""}`}
                  onClick={() => setActiveLesson(lesson)}
                >
                  <div className="study-lesson-check">
                    {completedLessons.has(lesson.id) ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    ) : (
                      <span className="study-lesson-num">{lesson.id}</span>
                    )}
                  </div>
                  <div className="study-lesson-text">
                    <span className="study-lesson-name">{lesson.title}</span>
                    <span className="study-lesson-time">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {lesson.duration}
                    </span>
                  </div>
                  {activeLesson.id === lesson.id && (
                    <div className="study-playing-icon">
                      <span></span><span></span><span></span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            {/* Phần Đánh Giá (Review) */}
            <div className="study-reviews-section">
              <h4 className="study-sidebar-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                Đánh giá khóa học
              </h4>
              
              {!isAdmin && !hasReviewed && (
                <form className="study-review-form" onSubmit={handleSubmitReview}>
                  <div className="review-rating-select">
                    {[1,2,3,4,5].map(num => (
                      <span 
                        key={num} 
                        className={`star ${num <= rating ? 'active' : ''}`}
                        onClick={() => setRating(num)}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <textarea 
                    placeholder="Khóa học này thế nào?" 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                  <button type="submit" disabled={isSubmitting || !comment.trim()}>
                    {isSubmitting ? "Đang gửi..." : "Gửi đánh giá"}
                  </button>
                </form>
              )}
              
              {!isAdmin && hasReviewed && (
                <div className="review-thankyou">Cảm ơn bạn đã đánh giá! ❤️</div>
              )}

              <div className="study-review-list">
                {reviews.map((rev, idx) => (
                  <div key={idx} className="study-review-item">
                    <div className="reviewer-info">
                      <span className="reviewer-avatar">👤</span>
                      <span className="reviewer-address">{rev.user.slice(0, 6)}...{rev.user.slice(-4)}</span>
                      <span className="reviewer-stars">{"★".repeat(rev.rating)}{"☆".repeat(5-rev.rating)}</span>
                    </div>
                    <p className="reviewer-comment">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
