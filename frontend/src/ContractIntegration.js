/**
 * ContractIntegration.js - Module tích hợp Smart Contract với Ethers.js
 * 
 * File này chứa toàn bộ logic tương tác giữa Frontend và Smart Contract:
 * - Kết nối ví MetaMask
 * - Gọi các hàm trên contract (đọc & ghi)
 * - Quản lý provider và signer
 */

import { ethers } from "ethers";
import CoursePlatformJSON from "./CoursePlatform.json";

// Lấy ABI từ file JSON do Truffle tự generate
const CONTRACT_ABI = CoursePlatformJSON.abi;

// ============ CẤU HÌNH CONTRACT ============

/**
 * Lấy địa chỉ contract từ JSON (bất kể network ID là 5777 hay 1337)
 * Lấy địa chỉ từ network đầu tiên có trong JSON, tránh lỗi key bị lệch
 */
function getContractAddress() {
  const networks = CoursePlatformJSON.networks;
  // Thử theo thứ tự: 1337 (chain id metamask), 5777 (ganache network id), rồi lấy cái đầu tiên
  const address =
    networks["1337"]?.address ||
    networks["5777"]?.address ||
    networks[Object.keys(networks)[0]]?.address;

  if (!address) {
    throw new Error("Chưa deploy contract! Chạy: npx truffle migrate --reset --network development");
  }
  return address;
}

const CONTRACT_ADDRESS = getContractAddress();

// Provider đọc dữ liệu trực tiếp từ Ganache (không qua MetaMask)
// Giải quyết lỗi BAD_DATA khi MetaMask dùng chainId khác networkId
const READ_PROVIDER = new ethers.JsonRpcProvider("http://127.0.0.1:7545");

// ============ HÀM CHUYỂN MẠNG GANACHE ============

/**
 * Tự động yêu cầu MetaMask chuyển sang mạng Ganache Local
 * Nếu chưa có mạng Ganache thì tự động thêm vào
 */
async function switchToGanache() {
  // Chain ID của Ganache = 0x539 (hex của 1337)
  const GANACHE_CHAIN_ID = "0x539";
  
  try {
    // Thử chuyển sang mạng Ganache
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: GANACHE_CHAIN_ID }],
    });
  } catch (switchError) {
    // Lỗi 4902 = mạng chưa tồn tại trong MetaMask → tự động thêm vào
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: GANACHE_CHAIN_ID,
          chainName: "Ganache Local",
          nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
          rpcUrls: ["http://127.0.0.1:7545"],
        }],
      });
    } else {
      throw switchError;
    }
  }
}

// ============ HÀM KẾT NỐI VÍ ============

/**
 * Kết nối ví MetaMask của người dùng
 * 
 * @returns {Object} Chứa provider, signer, địa chỉ ví và số dư
 * @throws {Error} Nếu MetaMask chưa được cài đặt
 */
export async function connectWallet() {
  // Kiểm tra MetaMask đã cài đặt chưa (inject window.ethereum)
  if (!window.ethereum) {
    throw new Error("Vui lòng cài đặt MetaMask để sử dụng ứng dụng!");
  }

  // ⭐ Tự động chuyển sang mạng Ganache trước khi kết nối
  // Đây là fix chính: tránh dùng nhầm Ethereum Mainnet
  await switchToGanache();

  // Tạo provider từ MetaMask (Ethers.js v6)
  const provider = new ethers.BrowserProvider(window.ethereum);

  // Yêu cầu người dùng cho phép kết nối ví
  const signer = await provider.getSigner();

  // Lấy địa chỉ ví đã kết nối
  const address = await signer.getAddress();

  // Lấy số dư ETH từ Ganache trực tiếp (tránh lỗi 0 ETH do sai mạng)
  const balanceWei = await READ_PROVIDER.getBalance(address);
  const balanceEth = ethers.formatEther(balanceWei);

  return {
    provider,   // Provider để đọc dữ liệu blockchain
    signer,     // Signer để ký giao dịch (ghi dữ liệu)
    address,    // Địa chỉ ví người dùng
    balance: balanceEth  // Số dư ETH (dạng chuỗi)
  };
}

// ============ HÀM TẠO INSTANCE CONTRACT ============

/**
 * Tạo instance contract để tương tác
 * 
 * @param {Object} signerOrProvider - Signer (ghi) hoặc Provider (đọc)
 * @returns {ethers.Contract} Instance contract
 */
export function getContractInstance(signerOrProvider) {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signerOrProvider);
}

/**
 * Tạo instance contract dùng READ_PROVIDER trực tiếp từ Ganache
 * Dùng cho các lệnh đọc (view) để tránh lỗi BAD_DATA từ MetaMask
 */
export function getReadContractInstance() {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, READ_PROVIDER);
}

// ============ HÀM ĐỌC DỮ LIỆU (READ - không tốn gas) ============

/**
 * Lấy danh sách tất cả khóa học từ blockchain
 * 
 * @param {Object} provider - Provider đã kết nối
 * @returns {Array} Mảng chứa thông tin các khóa học
 */
export async function fetchAllCourses() {
  // Dùng READ_PROVIDER trực tiếp (JsonRpcProvider → Ganache) thay vì MetaMask
  // Tránh lỗi BAD_DATA do chain ID không khớp giữa MetaMask và Ganache
  const contract = getReadContractInstance();

  // Gọi hàm fetchAllCourses trên contract (view - không tốn gas)
  const rawCourses = await contract.fetchAllCourses();

  // Chuyển đổi dữ liệu từ blockchain sang object JavaScript
  const courses = rawCourses.map((course) => ({
    id: Number(course.id),
    title: course.title,
    price: course.price,
    priceEth: ethers.formatEther(course.price),
    author: course.author,
    videoUrl: course.videoUrl || "",        // Link video on-chain
    description: course.description || "",  // Mô tả on-chain
    totalRating: Number(course.totalRating || 0),
    reviewCount: Number(course.reviewCount || 0)
  }));

  return courses;
}

/**
 * Kiểm tra người dùng đã sở hữu khóa học hay chưa
 * 
 * @param {Object} provider - Provider đã kết nối
 * @param {string} userAddress - Địa chỉ ví người dùng
 * @param {number} courseId - ID khóa học
 * @returns {boolean} true nếu đã sở hữu
 */
export async function checkOwnership(provider, userAddress, courseId) {
  // Dùng READ_PROVIDER để tránh lỗi chain ID
  const contract = getReadContractInstance();
  return await contract.checkOwnership(userAddress, courseId);
}

/**
 * Kiểm tra quyền sở hữu cho toàn bộ danh sách khóa học
 * 
 * @param {Object} provider - Provider đã kết nối  
 * @param {string} userAddress - Địa chỉ ví người dùng
 * @param {Array} courses - Mảng khóa học
 * @returns {Object} Mapping courseId => boolean
 */
export async function checkAllOwnerships(provider, userAddress, courses) {
  const ownerships = {};
  
  // Duyệt qua từng khóa học và kiểm tra quyền sở hữu
  for (const course of courses) {
    ownerships[course.id] = await checkOwnership(provider, userAddress, course.id);
  }

  return ownerships;
}

// ============ HÀM GHI DỮ LIỆU (WRITE - tốn gas) ============

/**
 * Mua một khóa học bằng ETH
 * 
 * @param {Object} signer - Signer (người dùng đã kết nối ví)
 * @param {number} courseId - ID khóa học muốn mua
 * @param {BigInt} priceWei - Giá khóa học (đơn vị Wei)
 * @returns {Object} Receipt giao dịch sau khi hoàn tất
 */
export async function purchaseCourse(signer, courseId, priceWei) {
  const contract = getContractInstance(signer);

  // Gọi hàm purchaseCourse, gửi kèm ETH bằng giá khóa học
  const tx = await contract.purchaseCourse(courseId, {
    value: priceWei  // Số Wei gửi kèm giao dịch
  });

  // Đợi giao dịch được xác nhận trên blockchain (1 block confirmation)
  const receipt = await tx.wait();

  return receipt;
}

/**
 * Tạo khóa học mới (chỉ Admin)
 * 
 * @param {Object} signer - Signer của Admin
 * @param {string} title - Tên khóa học
 * @param {string} priceEth - Giá khóa học (đơn vị ETH, ví dụ: "0.01")
 * @returns {Object} Receipt giao dịch
 */
export async function createCourse(signer, title, priceEth, videoUrl, description) {
  const contract = getContractInstance(signer);
  const priceWei = ethers.parseEther(priceEth);
  // Gọi hàm createCourse mới với 4 tham số
  const tx = await contract.createCourse(title, priceWei, videoUrl, description || "");
  const receipt = await tx.wait();
  return receipt;
}

/**
 * Lấy địa chỉ Admin của contract
 * 
 * @param {Object} provider - Provider đã kết nối
 * @returns {string} Địa chỉ Admin
 */
export async function getAdmin(provider) {
  // Dùng READ_PROVIDER để tránh lỗi chain ID
  const contract = getReadContractInstance();
  return await contract.admin();
}

/**
 * Cập nhật số dư ví hiện tại
 * 
 * @param {Object} provider - Provider đã kết nối
 * @param {string} address - Địa chỉ ví
 * @returns {string} Số dư ETH
 */
export async function getBalance(provider, address) {
  // Lấy số dư thẳng từ Ganache, không qua MetaMask → luôn hiển thị đúng
  const balanceWei = await READ_PROVIDER.getBalance(address);
  return ethers.formatEther(balanceWei);
}

// ============ CÁC HÀM NÂNG CẤP (RÚT TIỀN & ĐÁNH GIÁ) ============

/**
 * Lấy tổng số dư ETH đang nằm trong Smart Contract
 * @param {Object} provider - Provider đã kết nối
 * @returns {string} Số dư ETH của contract
 */
export async function getContractBalance(provider) {
  const balanceWei = await READ_PROVIDER.getBalance(CONTRACT_ADDRESS);
  return ethers.formatEther(balanceWei);
}

/**
 * Rút tiền từ contract về ví Admin (chỉ Admin)
 * @param {Object} signer - Signer của Admin
 */
export async function withdrawFunds(signer) {
  const contract = getContractInstance(signer);
  const tx = await contract.withdrawFunds();
  return await tx.wait();
}

/**
 * Thêm đánh giá cho khóa học
 * @param {Object} signer - Signer của người dùng
 * @param {number} courseId - ID khóa học
 * @param {number} rating - Số sao (1-5)
 * @param {string} comment - Bình luận
 */
export async function addReview(signer, courseId, rating, comment) {
  const contract = getContractInstance(signer);
  const tx = await contract.addReview(courseId, rating, comment);
  return await tx.wait();
}

/**
 * Lấy danh sách đánh giá của khóa học
 * @param {number} courseId - ID khóa học
 * @returns {Array} Mảng các bài đánh giá
 */
export async function getReviews(courseId) {
  const contract = getReadContractInstance();
  const rawReviews = await contract.getReviews(courseId);
  return rawReviews.map(r => ({
    user: r.user,
    rating: Number(r.rating),
    comment: r.comment
  }));
}

/**
 * Lấy danh sách tất cả người dùng đã mua khóa học từ Event CoursePurchased
 */
export async function getAllBuyers() {
  try {
    const contract = getReadContractInstance();
    // Lấy tất cả sự kiện CoursePurchased từ block 0
    const filter = contract.filters.CoursePurchased();
    const events = await contract.queryFilter(filter, 0, "latest");
    
    // Group by user
    const userMap = {};
    events.forEach(event => {
      // ethers v6: args is an array-like object. 
      // event.args: [courseId, buyer, price]
      const courseId = Number(event.args[0]);
      const buyer = event.args[1];
      const price = ethers.formatEther(event.args[2]);

      if (!userMap[buyer]) {
        userMap[buyer] = { address: buyer, totalSpent: 0, courses: [] };
      }
      userMap[buyer].totalSpent += parseFloat(price);
      if (!userMap[buyer].courses.includes(courseId)) {
        userMap[buyer].courses.push(courseId);
      }
    });

    return Object.values(userMap);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người mua:", error);
    return [];
  }
}

// ============ XUẤT ĐỊA CHỈ CONTRACT ============
export { CONTRACT_ADDRESS };
