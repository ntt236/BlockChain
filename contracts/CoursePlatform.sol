// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title CoursePlatform - Hệ thống mua khóa học Online bằng Blockchain
/// @notice Contract cho phép Admin tạo khóa học và người dùng mua bằng ETH
/// @dev Mọi dữ liệu giao dịch và quyền sở hữu được lưu trữ on-chain

contract CoursePlatform {

    // ============ CẤU TRÚC DỮ LIỆU ============

    /// @notice Cấu trúc lưu trữ thông tin một khóa học
    struct Course {
        uint id;           // ID duy nhất của khóa học
        string title;      // Tên khóa học
        uint price;        // Giá khóa học (đơn vị: Wei)
        address author;    // Địa chỉ ví của tác giả/admin tạo khóa học
        string videoUrl;   // Link video bài giảng (YouTube URL hoặc link trực tiếp)
        string description;// Mô tả ngắn về khóa học
        string imageUrl;   // URL hình ảnh thumbnail của khóa học
        uint totalRating;  // Tổng số sao đánh giá (để tính trung bình)
        uint reviewCount;  // Tổng số lượt đánh giá
    }

    /// @notice Cấu trúc lưu một đánh giá (Review)
    struct Review {
        address user;      // Người đánh giá
        uint8 rating;      // Số sao (1-5)
        string comment;    // Bình luận
    }

    // ============ BIẾN TRẠNG THÁI ============

    /// @notice Địa chỉ Admin (người deploy contract)
    address public admin;

    /// @notice Bộ đếm ID khóa học, tự động tăng
    uint public courseCount;

    /// @notice Mapping lưu trữ danh sách khóa học theo ID
    /// @dev courses[courseId] => Course
    mapping(uint => Course) public courses;

    /// @notice Mapping kiểm tra quyền sở hữu khóa học của người dùng
    /// @dev ownedCourses[địa_chỉ_ví][courseId] => true/false
    mapping(address => mapping(uint => bool)) public ownedCourses;

    /// @notice Mapping danh sách review của mỗi khóa học
    mapping(uint => Review[]) public courseReviews;

    /// @notice Mapping kiểm tra user đã đánh giá khóa học chưa
    mapping(address => mapping(uint => bool)) public hasReviewed;

    // ============ SỰ KIỆN (EVENTS) ============

    /// @notice Phát ra khi một khóa học mới được tạo
    event CourseCreated(uint id, string title, uint price, address author);

    /// @notice Phát ra khi một người dùng mua khóa học thành công
    event CoursePurchased(uint courseId, address buyer, uint price);

    /// @notice Phát ra khi có đánh giá mới
    event ReviewAdded(uint courseId, address user, uint8 rating);

    /// @notice Phát ra khi Admin rút tiền thành công
    event FundsWithdrawn(address admin, uint amount);

    // ============ MODIFIER ============

    /// @notice Chỉ cho phép Admin thực thi hàm
    modifier onlyAdmin() {
        require(msg.sender == admin, "Chi Admin moi co quyen thuc hien chuc nang nay");
        _;
    }

    // ============ CONSTRUCTOR ============

    /// @notice Khởi tạo contract, gán người deploy làm Admin
    constructor() {
        admin = msg.sender; // Người deploy contract tự động trở thành Admin
    }

    // ============ CÁC HÀM CHÍNH ============

    /// @notice Tạo một khóa học mới (chỉ Admin)
    /// @param _title Tên khóa học
    /// @param _price Giá khóa học (đơn vị: Wei)
    /// @param _videoUrl Link video bài giảng YouTube
    /// @param _description Mô tả ngắn về khóa học
    /// @param _imageUrl URL hình ảnh thumbnail
    function createCourse(string memory _title, uint _price, string memory _videoUrl, string memory _description, string memory _imageUrl) public onlyAdmin {
        require(_price > 0, "Gia khoa hoc phai lon hon 0");
        require(bytes(_title).length > 0, "Tieu de khoa hoc khong duoc de trong");
        require(bytes(_videoUrl).length > 0, "Link video khong duoc de trong");
        require(bytes(_imageUrl).length > 0, "Link anh khong duoc de trong");

        courseCount++;
        courses[courseCount] = Course(courseCount, _title, _price, msg.sender, _videoUrl, _description, _imageUrl, 0, 0);
        
        // Mặc định Admin sở hữu khóa học vừa tạo
        ownedCourses[msg.sender][courseCount] = true;

        emit CourseCreated(courseCount, _title, _price, msg.sender);
    }

    /// @notice Cập nhật thông tin khóa học (chỉ Admin)
    function updateCourse(uint _courseId, string memory _title, uint _price, string memory _videoUrl, string memory _description, string memory _imageUrl) public onlyAdmin {
        require(_courseId > 0 && _courseId <= courseCount, "Khoa hoc khong ton tai");
        require(_price > 0, "Gia khoa hoc phai lon hon 0");
        require(bytes(_title).length > 0, "Tieu de khong duoc de trong");
        require(bytes(_videoUrl).length > 0, "Link video khong duoc de trong");
        require(bytes(_imageUrl).length > 0, "Link anh khong duoc de trong");
        
        Course storage c = courses[_courseId];
        c.title = _title;
        c.price = _price;
        c.videoUrl = _videoUrl;
        c.description = _description;
        c.imageUrl = _imageUrl;
    }

    /// @notice Mua một khóa học bằng ETH
    /// @param _courseId ID của khóa học muốn mua
    function purchaseCourse(uint _courseId) public payable {
        // Lấy thông tin khóa học từ storage
        Course memory _course = courses[_courseId];

        // Kiểm tra khóa học tồn tại (ID hợp lệ)
        require(_course.id > 0 && _course.id <= courseCount, "Khoa hoc khong ton tai");

        // Kiểm tra người dùng chưa sở hữu khóa học này
        require(!ownedCourses[msg.sender][_courseId], "Ban da so huu khoa hoc nay roi");

        // Kiểm tra số ETH gửi kèm phải đủ giá khóa học
        require(msg.value >= _course.price, "So ETH gui khong du de mua khoa hoc");

        // Đánh dấu người dùng đã sở hữu khóa học
        ownedCourses[msg.sender][_courseId] = true;

        // Tiền ETH sẽ được lưu lại trong Smart Contract để Admin rút sau bằng hàm withdrawFunds()

        // Phát sự kiện thông báo giao dịch thành công
        emit CoursePurchased(_courseId, msg.sender, msg.value);
    }

    /// @notice Lấy danh sách tất cả khóa học
    /// @return Mảng chứa tất cả các struct Course
    function fetchAllCourses() public view returns (Course[] memory) {
        // Tạo mảng tạm với kích thước bằng số lượng khóa học
        Course[] memory allCourses = new Course[](courseCount);

        // Duyệt qua từng khóa học và thêm vào mảng
        for (uint i = 0; i < courseCount; i++) {
            allCourses[i] = courses[i + 1]; // ID bắt đầu từ 1
        }

        return allCourses;
    }

    /// @notice Kiểm tra người dùng đã sở hữu khóa học hay chưa
    /// @param _user Địa chỉ ví người dùng cần kiểm tra
    /// @param _courseId ID khóa học cần kiểm tra
    /// @return true nếu đã sở hữu, false nếu chưa
    function checkOwnership(address _user, uint _courseId) public view returns (bool) {
        return ownedCourses[_user][_courseId];
    }

    /// @notice Lấy thông tin chi tiết một khóa học
    /// @param _courseId ID khóa học
    /// @return Struct Course chứa thông tin khóa học
    function getCourse(uint _courseId) public view returns (Course memory) {
        require(_courseId > 0 && _courseId <= courseCount, "Khoa hoc khong ton tai");
        return courses[_courseId];
    }

    // ============ HÀM MỚI BỔ SUNG (NÂNG CẤP) ============

    /// @notice Đánh giá khóa học
    /// @param _courseId ID khóa học
    /// @param _rating Số sao (1-5)
    /// @param _comment Bình luận
    function addReview(uint _courseId, uint8 _rating, string memory _comment) public {
        require(_courseId > 0 && _courseId <= courseCount, "Khoa hoc khong ton tai");
        require(ownedCourses[msg.sender][_courseId], "Phai mua khoa hoc truoc khi danh gia");
        require(!hasReviewed[msg.sender][_courseId], "Ban da danh gia khoa hoc nay roi");
        require(_rating >= 1 && _rating <= 5, "So sao phai tu 1 den 5");

        courseReviews[_courseId].push(Review(msg.sender, _rating, _comment));
        hasReviewed[msg.sender][_courseId] = true;
        
        courses[_courseId].totalRating += _rating;
        courses[_courseId].reviewCount++;

        emit ReviewAdded(_courseId, msg.sender, _rating);
    }

    /// @notice Lấy danh sách đánh giá của khóa học
    /// @param _courseId ID khóa học
    function getReviews(uint _courseId) public view returns (Review[] memory) {
        return courseReviews[_courseId];
    }

    /// @notice Rút tiền từ doanh thu bán khóa học (chỉ Admin)
    function withdrawFunds() public onlyAdmin {
        uint balance = address(this).balance;
        require(balance > 0, "Khong co so du de rut");
        
        payable(admin).transfer(balance);
        emit FundsWithdrawn(admin, balance);
    }
}
