/**
 * Migration Script - Deploy CoursePlatform lên Ganache
 * 
 * File này được Truffle sử dụng để triển khai smart contract
 * lên mạng blockchain đã cấu hình trong truffle-config.js.
 */

// Import artifact của contract CoursePlatform
const CoursePlatform = artifacts.require("CoursePlatform");

module.exports = function (deployer) {
  // Deploy contract CoursePlatform lên mạng
  // Tài khoản đầu tiên trong Ganache sẽ là Admin
  deployer.deploy(CoursePlatform);
};
