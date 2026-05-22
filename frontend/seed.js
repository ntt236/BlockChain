const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const contractJSON = JSON.parse(fs.readFileSync(path.join(__dirname, "src", "CoursePlatform.json")));
const abi = contractJSON.abi;
const networks = contractJSON.networks;
const contractAddress = networks["1337"]?.address || networks["5777"]?.address || networks[Object.keys(networks)[0]]?.address;

if (!contractAddress) {
  console.error("Could not find contract address in JSON!");
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");

async function seed() {
  try {
    const signer = await provider.getSigner(0);
    const contract = new ethers.Contract(contractAddress, abi, signer);

    console.log("Connecting to contract at:", contractAddress);
    console.log("Using Admin account:", await signer.getAddress());
    console.log("Creating 3 premium courses...");

    const courses = [
      {
        title: "Web3 Masterclass: Lập trình Smart Contract với Solidity",
        description: "Khóa học toàn diện nhất dành cho người mới bắt đầu. Tìm hiểu cách viết, biên dịch, bảo mật và triển khai Smart Contract trên nền tảng Ethereum. Từng bước xây dựng DApp đầu tiên của bạn với Truffle và Hardhat.",
        price: ethers.parseEther("0.05"),
        videoUrl: "https://www.youtube.com/embed/M576WGiDBdQ",
        imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f4ec651?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      },
      {
        title: "Kiến trúc Frontend DApp: ReactJS & ethers.js",
        description: "Học cách kết nối React.js với Blockchain. Xử lý trạng thái ví MetaMask, lắng nghe sự kiện từ hợp đồng thông minh, tích hợp Web3Context và xây dựng giao diện người dùng tối ưu hóa UX/UI cho DApp.",
        price: ethers.parseEther("0.08"),
        videoUrl: "https://www.youtube.com/embed/pWbMrx5rVBE",
        imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      },
      {
        title: "Thiết kế UI/UX hiện đại với Tailwind CSS v3",
        description: "Bí quyết thiết kế giao diện tuyệt đẹp mà không cần viết CSS thuần. Thực hành xây dựng các Component phức tạp, Dark Mode, Animations và Responsive Design chuẩn xác 100% như các nền tảng công nghệ lớn.",
        price: ethers.parseEther("0.02"),
        videoUrl: "https://www.youtube.com/embed/UBOj6rqRUME",
        imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      }
    ];

    for (let i = 0; i < courses.length; i++) {
      const c = courses[i];
      console.log(`[${i+1}/3] Creating: ${c.title}...`);
      const tx = await contract.createCourse(c.title, c.price, c.videoUrl, c.description, c.imageUrl);
      await tx.wait();
      console.log(` => Success! Tx Hash: ${tx.hash}`);
    }
    
    console.log("\n🎉 Seeding complete! Refresh your browser to see the courses.");
  } catch (error) {
    console.error("Seed failed:", error);
  }
}

seed();
