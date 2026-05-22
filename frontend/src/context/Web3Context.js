import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { ethers } from 'ethers';
import {
  connectWallet as connectWalletApi,
  fetchAllCourses,
  checkAllOwnerships,
  getAdmin,
  getContractBalance,
  purchaseCourse as purchaseCourseApi,
  createCourse as createCourseApi,
  updateCourse as updateCourseApi,
  withdrawFunds as withdrawFundsApi,
  addReview as addReviewApi,
  toggleCourseStatus as toggleCourseStatusApi,
  getBalance
} from '../ContractIntegration';

const Web3Context = createContext();

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0");
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [contractBalance, setContractBalance] = useState("0");
  
  const [courses, setCourses] = useState([]);
  const [ownerships, setOwnerships] = useState({});
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Lấy danh sách khóa học và thông tin chung
  const refreshData = useCallback(async (currentAccount = account, currentProvider = provider) => {
    if (!currentProvider && !window.ethereum) {
      setDataLoading(false);
      return;
    }
    
    try {
      setDataLoading(true);
      const allCourses = await fetchAllCourses();
      setCourses(allCourses);

      if (currentAccount && currentProvider) {
        const adminAddress = await getAdmin();
        const isUserAdmin = currentAccount.toLowerCase() === adminAddress.toLowerCase();
        setIsAdmin(isUserAdmin);

        if (isUserAdmin) {
          const cBalance = await getContractBalance();
          setContractBalance(cBalance);
          // Admin tự động sở hữu tất cả
          const adminOwnerships = {};
          allCourses.forEach(c => adminOwnerships[c.id] = true);
          setOwnerships(adminOwnerships);
        } else {
          const userOwnerships = await checkAllOwnerships(currentProvider, currentAccount, allCourses);
          setOwnerships(userOwnerships);
        }
        
        // Cập nhật lại số dư
        const newBalance = await getBalance(currentProvider, currentAccount);
        setBalance(newBalance);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    } finally {
      setDataLoading(false);
    }
  }, [account, provider]);

  // Gọi refreshData lần đầu
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Xử lý sự kiện ví
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          setAccount("");
          setBalance("0");
          setSigner(null);
          setProvider(null);
          setIsAdmin(false);
          setOwnerships({});
          toast.error("Ví đã bị ngắt kết nối!");
        } else {
          toast.loading("Đang chuyển đổi tài khoản...", { id: 'switch' });
          try {
            await connectWallet();
            toast.success("Đổi tài khoản thành công!", { id: 'switch' });
          } catch (error) {
            toast.error("Lỗi khi đổi tài khoản", { id: 'switch' });
          }
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectWallet = async () => {
    try {
      const { provider: p, signer: s, address, balance: b } = await connectWalletApi();
      setProvider(p);
      setSigner(s);
      setAccount(address);
      setBalance(b);
      
      toast.success("Kết nối ví thành công!");
      await refreshData(address, p);
    } catch (error) {
      toast.error(error.message || "Lỗi kết nối ví!");
      throw error;
    }
  };

  const purchaseCourse = async (courseId, priceEth) => {
    if (!signer) return toast.error("Vui lòng kết nối ví!");
    
    const toastId = toast.loading("Đang xử lý giao dịch...");
    setLoading(true);
    try {
      const priceWei = ethers.parseEther(priceEth.toString());
      await purchaseCourseApi(signer, courseId, priceWei);
      toast.success("Mua khóa học thành công!", { id: toastId });
      await refreshData();
    } catch (error) {
      toast.error(error.reason || "Giao dịch bị từ chối", { id: toastId });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (title, priceEth, videoUrl, description, imageUrl) => {
    if (!signer) return toast.error("Vui lòng kết nối ví!");
    
    const toastId = toast.loading("Đang ghi lên Blockchain...");
    setLoading(true);
    try {
      await createCourseApi(signer, title, priceEth, videoUrl, description, imageUrl);
      toast.success("Tạo khóa học thành công!", { id: toastId });
      await refreshData();
    } catch (error) {
      toast.error(error.reason || "Lỗi tạo khóa học", { id: toastId });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCourse = async (courseId, title, priceEth, videoUrl, description, imageUrl) => {
    if (!signer) return toast.error("Vui lòng kết nối ví!");
    
    const toastId = toast.loading("Đang cập nhật khóa học...");
    setLoading(true);
    try {
      await updateCourseApi(signer, courseId, title, priceEth, videoUrl, description, imageUrl);
      toast.success("Cập nhật thành công!", { id: toastId });
      await refreshData();
    } catch (error) {
      toast.error(error.reason || "Lỗi cập nhật", { id: toastId });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const withdrawFunds = async () => {
    if (!signer) return;
    const toastId = toast.loading("Đang rút tiền...");
    setLoading(true);
    try {
      await withdrawFundsApi(signer);
      toast.success("Rút tiền thành công!", { id: toastId });
      await refreshData();
    } catch (error) {
      toast.error(error.reason || "Lỗi rút tiền", { id: toastId });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addReview = async (courseId, rating, comment) => {
    if (!signer) return;
    const toastId = toast.loading("Đang gửi đánh giá...");
    setLoading(true);
    try {
      await addReviewApi(signer, courseId, rating, comment);
      toast.success("Đánh giá thành công!", { id: toastId });
      await refreshData();
    } catch (error) {
      toast.error(error.reason || "Lỗi gửi đánh giá", { id: toastId });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const toggleCourseStatus = async (courseId) => {
    if (!signer) return;
    const toastId = toast.loading("Đang cập nhật trạng thái...");
    setLoading(true);
    try {
      await toggleCourseStatusApi(signer, courseId);
      toast.success("Cập nhật trạng thái thành công!", { id: toastId });
      await refreshData();
    } catch (error) {
      toast.error(error.reason || "Lỗi cập nhật trạng thái", { id: toastId });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const contextValue = useMemo(() => ({
    account,
    balance,
    isAdmin,
    courses,
    ownerships,
    contractBalance,
    loading,
    dataLoading,
    connectWallet,
    purchaseCourse,
    createCourse,
    updateCourse,
    toggleCourseStatus,
    withdrawFunds,
    addReview,
    refreshData
  }), [account, balance, isAdmin, courses, ownerships, contractBalance, loading, dataLoading, refreshData]);

  return (
    <Web3Context.Provider value={contextValue}>
      {children}
    </Web3Context.Provider>
  );
};
