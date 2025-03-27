import React, { createContext, useContext, useState, useEffect } from "react";
import { VoucherData, VoucherTheme, generateUniqueId } from "@/lib/voucher-utils";

interface VoucherContextProps {
  vouchers: VoucherData[];
  recentVouchers: VoucherData[];
  currentVoucher: VoucherData | null;
  createVoucher: (title: string, code: string, theme: VoucherTheme, provider: string, message?: string, expiryDate?: string) => string;
  getVoucherById: (id: string) => VoucherData | undefined;
  isDuplicateCode: (code: string) => boolean;
}

const VoucherContext = createContext<VoucherContextProps | undefined>(undefined);

export function VoucherProvider({ children }: { children: React.ReactNode }) {
  const [vouchers, setVouchers] = useState<VoucherData[]>([]);
  const [recentVouchers, setRecentVouchers] = useState<VoucherData[]>([]);
  const [currentVoucher, setCurrentVoucher] = useState<VoucherData | null>(null);

  // Load vouchers from localStorage on mount
  useEffect(() => {
    const savedVouchers = localStorage.getItem("vouchers");
    if (savedVouchers) {
      setVouchers(JSON.parse(savedVouchers));
    }
    
    const savedRecentVouchers = localStorage.getItem("recentVouchers");
    if (savedRecentVouchers) {
      setRecentVouchers(JSON.parse(savedRecentVouchers));
    }
  }, []);

  // Save vouchers to localStorage when they change
  useEffect(() => {
    if (vouchers.length > 0) {
      localStorage.setItem("vouchers", JSON.stringify(vouchers));
    }
  }, [vouchers]);
  
  // Save recent vouchers to localStorage when they change
  useEffect(() => {
    if (recentVouchers.length > 0) {
      localStorage.setItem("recentVouchers", JSON.stringify(recentVouchers));
    }
  }, [recentVouchers]);

  const createVoucher = (title: string, code: string, theme: VoucherTheme, provider: string, message?: string, expiryDate?: string) => {
    const id = generateUniqueId();
    const newVoucher: VoucherData = {
      id,
      title,
      code,
      theme,
      provider,
      message,
      expiryDate,
      createdAt: Date.now()
    };
    
    setVouchers(prev => [...prev, newVoucher]);
    setCurrentVoucher(newVoucher);
    
    // Update recent vouchers (keep only the last 5)
    setRecentVouchers(prev => {
      const updated = [newVoucher, ...prev].slice(0, 5);
      localStorage.setItem("recentVouchers", JSON.stringify(updated));
      return updated;
    });
    
    return id;
  };

  const getVoucherById = (id: string) => {
    return vouchers.find(v => v.id === id);
  };
  
  const isDuplicateCode = (code: string) => {
    // Check if this code was used today
    const today = new Date().toDateString();
    return vouchers.some(v => {
      const voucherDate = new Date(v.createdAt).toDateString();
      return v.code === code && voucherDate === today;
    });
  };

  return (
    <VoucherContext.Provider value={{ 
      vouchers, 
      recentVouchers,
      currentVoucher, 
      createVoucher, 
      getVoucherById,
      isDuplicateCode
    }}>
      {children}
    </VoucherContext.Provider>
  );
}

export function useVoucher() {
  const context = useContext(VoucherContext);
  if (context === undefined) {
    throw new Error('useVoucher must be used within a VoucherProvider');
  }
  return context;
}
