# 🎓 BlockCourse — Hệ thống mua khóa học Online bằng Blockchain

## 📋 Mô tả
Hệ thống dApp (Decentralized Application) cho phép **Admin đăng tải khóa học** và **người dùng mua khóa học bằng ETH** thông qua ví MetaMask. Mọi dữ liệu giao dịch và quyền sở hữu được lưu trữ **on-chain** trên mạng thử nghiệm Ganache.

## 🏗 Kiến trúc hệ thống

```
BlockCourse/
├── contracts/                  # Smart Contracts (Solidity)
│   └── CoursePlatform.sol      # Contract chính
├── migrations/                 # Truffle migration scripts
│   └── 1_deploy_contract.js    # Script deploy contract
├── frontend/                   # Frontend ReactJS
│   └── src/
│       ├── App.js              # Component gốc
│       ├── App.css             # Stylesheet chính
│       ├── ContractIntegration.js  # Logic tương tác blockchain
│       └── components/
│           ├── Navbar.js       # Thanh điều hướng
│           ├── CourseCard.js   # Card khóa học
│           ├── MyInventory.js  # Kho khóa học đã mua
│           └── AdminPanel.js   # Panel quản trị (Admin)
├── truffle-config.js           # Cấu hình Truffle
└── package.json
```

## 🔧 Công nghệ sử dụng
| Thành phần | Công nghệ |
|---|---|
| Smart Contract | Solidity ^0.8.0 |
| Blockchain Framework | Truffle Suite |
| Mạng thử nghiệm | Ganache (Network ID: 5777) |
| Frontend | ReactJS (Create React App) |
| Blockchain Library | Ethers.js v6 |
| Styling | CSS (Dark Mode + Glassmorphism) |
| Wallet | MetaMask |

---

## 🚀 Hướng dẫn cài đặt & chạy dự án

### Bước 1: Cài đặt các phần mềm cần thiết
- **Node.js** >= 16.x: [https://nodejs.org](https://nodejs.org)
- **Ganache**: [https://trufflesuite.com/ganache/](https://trufflesuite.com/ganache/)
- **MetaMask** (Extension trình duyệt): [https://metamask.io](https://metamask.io)

### Bước 2: Mở Ganache
1. Mở ứng dụng Ganache Desktop
2. Tạo workspace mới (hoặc dùng Quickstart)
3. Đảm bảo cấu hình:
   - **Port**: `7545`
   - **Network ID**: `5777`
4. Ganache sẽ tạo sẵn 10 tài khoản với 100 ETH mỗi tài khoản

### Bước 3: Deploy Smart Contract
```bash
# Mở terminal tại thư mục gốc dự án (d:/BlockChain)
cd d:/BlockChain

# Compile contract
npx truffle compile

# Deploy contract lên Ganache
npx truffle migrate --network development
```

Sau khi deploy thành công, bạn sẽ thấy output tương tự:
```
Deploying 'CoursePlatform'
--------------------------
> transaction hash:    0x...
> contract address:    0xAbCdEf1234567890... ← COPY ĐỊA CHỈ NÀY
> block number:        1
> account:             0x... (Admin)
```

### Bước 4: Cập nhật địa chỉ Contract vào Frontend
Mở file `frontend/src/ContractIntegration.js`, tìm dòng:
```javascript
const CONTRACT_ADDRESS = "0xYOUR_CONTRACT_ADDRESS_HERE";
```
Thay `0xYOUR_CONTRACT_ADDRESS_HERE` bằng địa chỉ contract vừa copy ở Bước 3.

### Bước 5: Cấu hình MetaMask kết nối Ganache
1. Mở MetaMask → Thêm mạng mới (Add Network)
2. Điền thông tin:
   - **Network Name**: Ganache Local
   - **RPC URL**: `http://127.0.0.1:7545`
   - **Chain ID**: `1337` (hoặc `5777`)
   - **Currency Symbol**: ETH
3. Import tài khoản từ Ganache:
   - Trong Ganache, click icon 🔑 bên cạnh tài khoản
   - Copy **Private Key**
   - Trong MetaMask → Import Account → Dán Private Key

### Bước 6: Chạy Frontend
```bash
cd d:/BlockChain/frontend
npm start
```
Ứng dụng sẽ chạy tại: [http://localhost:3000](http://localhost:3000)

---

## 📖 Giải thích ABI (Application Binary Interface)

### ABI là gì?
ABI là bản "giao diện" mô tả cấu trúc các hàm, input/output của smart contract. Nó giống như API documentation giúp thư viện Ethers.js biết cách gọi đúng hàm trên contract.

### Cách lấy ABI từ file JSON sau khi compile:
1. Chạy lệnh: `npx truffle compile`
2. Truffle sẽ tạo file JSON tại: `build/contracts/CoursePlatform.json`
3. Mở file đó, trường `"abi"` chứa mảng JSON mô tả toàn bộ hàm của contract
4. Copy nội dung trường `"abi"` để sử dụng trong frontend

**Trong dự án này**, để đơn giản hóa, chúng ta sử dụng **Human-Readable ABI** (cú pháp Ethers.js v6) thay vì JSON ABI đầy đủ. Cả hai cách đều tương đương về chức năng.

---

## 🎬 Kịch bản Demo 5 bước

### Bước 1: Trạng thái ban đầu (Chưa kết nối ví)
- Mở trình duyệt tại `http://localhost:3000`
- Giao diện Hero hiển thị: tiêu đề "Học tập không giới hạn với Blockchain"
- 3 feature cards: An toàn, Minh bạch, Nhanh chóng
- Nút "Kết nối MetaMask để bắt đầu" ở giữa trang
- **Trạng thái**: Chưa có kết nối ví, không hiển thị khóa học

### Bước 2: Kết nối ví MetaMask
- Nhấn nút **"Kết nối MetaMask để bắt đầu"**
- MetaMask popup hiện ra → Xác nhận kết nối
- Navbar cập nhật: hiển thị địa chỉ ví rút gọn (0x1234...cdef), số dư ETH
- Nếu ví là tài khoản deploy contract → hiện badge **ADMIN** và tab **⚙️ Admin**
- **Trạng thái**: Đã kết nối, trang "Khóa học" trống (chưa có khóa học)

### Bước 3: Admin tạo khóa học (Tài khoản Admin)
- Đảm bảo đang dùng tài khoản Admin (tài khoản đầu tiên trong Ganache)
- Click tab **⚙️ Admin**
- Điền form:
  - Tên: `"Blockchain cơ bản cho người mới"`
  - Giá: `0.05` ETH
- Nhấn **"Tạo khóa học"** → Xác nhận giao dịch trên MetaMask
- Thông báo: "Tạo khóa học thành công! 🎉"
- Tạo thêm 2-3 khóa học nữa để demo đầy đủ
- **Trạng thái**: Danh sách khóa học hiển thị trên tab "Khóa học"

### Bước 4: Người dùng mua khóa học (Tài khoản khác)
- Trong MetaMask, **chuyển sang tài khoản thứ 2** (import từ Ganache)
- Trang tự động refresh, hiển thị ví mới
- Tab "Khóa học" hiển thị các khóa học Admin vừa tạo
- Nhấn **"Mua ngay"** trên khóa học muốn mua
- MetaMask popup → Xác nhận giao dịch (trả ETH)
- Spinner quay → Đợi giao dịch xác nhận → Thông báo thành công
- Card khóa học đổi: nút "Mua ngay" → nhãn **"Đã sở hữu"** + nút **"Vào học"**
- Số dư ETH giảm tương ứng
- **Trạng thái**: Khóa học đã được mua thành công

### Bước 5: Kiểm tra kho khóa học đã sở hữu
- Click tab **📚 Kho của tôi**
- Hiển thị: "Bạn đang sở hữu **1** khóa học"
- Card khóa học đã mua hiển thị với nhãn "Đã sở hữu"
- Quay lại tab "Khóa học" → khóa học đã mua có nhãn "Đã sở hữu"
- Nhấn **"Mua ngay"** lần nữa trên khóa học đã mua → Báo lỗi "Bạn đã sở hữu khóa học này rồi!"
- **Trạng thái**: Hoàn tất quy trình mua và kiểm chứng quyền sở hữu on-chain

---

## 🔍 Các hàm Smart Contract

| Hàm | Quyền | Mô tả | Gas |
|---|---|---|---|
| `createCourse(title, price)` | Admin | Tạo khóa học mới | Có |
| `purchaseCourse(courseId)` | Tất cả | Mua khóa học bằng ETH | Có |
| `fetchAllCourses()` | Tất cả | Lấy danh sách khóa học | Không |
| `checkOwnership(user, courseId)` | Tất cả | Kiểm tra sở hữu | Không |
| `getCourse(courseId)` | Tất cả | Lấy chi tiết 1 khóa học | Không |

---

## ⚠️ Lưu ý quan trọng
1. **Ganache phải chạy** trước khi deploy contract và chạy frontend
2. **Địa chỉ contract thay đổi** mỗi lần deploy lại → cần cập nhật `CONTRACT_ADDRESS` 
3. **Tài khoản Admin** = tài khoản đầu tiên trong Ganache (người deploy contract)
4. **MetaMask** cần được cấu hình đúng mạng Ganache (RPC URL + Chain ID)

## 📝 Tác giả
Đồ án cuối kỳ — Blockchain Course Platform
