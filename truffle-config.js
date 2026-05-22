/**
 * truffle-config.js - Cấu hình Truffle cho mạng Ganache
 * 
 * File này cấu hình kết nối đến mạng thử nghiệm Ganache chạy trên máy local.
 * Network ID: 5777 (mặc định của Ganache)
 * Port: 7545 (mặc định của Ganache GUI) hoặc 8545 (Ganache CLI)
 */

module.exports = {
  // Cấu hình các mạng blockchain
  networks: {
    // Mạng Ganache chạy trên máy local
    development: {
      host: "127.0.0.1",     // Địa chỉ localhost
      port: 7545,             // Port mặc định của Ganache GUI
      network_id: "5777",     // Network ID của Ganache
    },
  },

  // Cấu hình trình biên dịch Solidity
  compilers: {
    solc: {
      version: "0.8.21",      // Phiên bản Solidity sử dụng
      settings: {
        optimizer: {
          enabled: true,       // Bật tối ưu hóa bytecode
          runs: 200            // Số lần chạy để tối ưu
        },
        evmVersion: "paris"    // BẮT BUỘC: Ganache chưa hỗ trợ opcodes mới (PUSH0) của solc 0.8.20+
      },
    },
  },
};
