
import React, { createContext, useContext, useState, useEffect } from "react";
import { VoucherData, VoucherTheme, generateUniqueId } from "@/lib/voucher-utils";

interface VoucherContextProps {
  vouchers: VoucherData[];
  currentVoucher: VoucherData | null;
  createVoucher: (title: string, code: string, theme: VoucherTheme, provider: string) => string;
  getVoucherById: (id: string) => VoucherData | undefined;
}

const VoucherContext = createContext<VoucherContextProps | undefined>(undefined);

export function VoucherProvider({ children }: { children: React.ReactNode }) {
  const [vouchers, setVouchers] = useState<VoucherData[]>([]);
  const [currentVoucher, setCurrentVoucher] = useState<VoucherData | null>(null);

  // Load vouchers from localStorage on mount
  useEffect(() => {
    const savedVouchers = localStorage.getItem("vouchers");
    if (savedVouchers) {
      setVouchers(JSON.parse(savedVouchers));
    }
  }, []);

  // Save vouchers to localStorage when they change
  useEffect(() => {
    if (vouchers.length > 0) {
      localStorage.setItem("vouchers", JSON.stringify(vouchers));
    }
  }, [vouchers]);

  const createVoucher = (title: string, code: string, theme: VoucherTheme, provider: string) => {
    const id = generateUniqueId();
    const newVoucher: VoucherData = {
      id,
      title,
      code,
      theme,
      provider,
      createdAt: Date.now()
    };
    
    setVouchers(prev => [...prev, newVoucher]);
    setCurrentVoucher(newVoucher);
    
    return id;
  };

  const getVoucherById = (id: string) => {
    return vouchers.find(v => v.id === id);
  };

  return (
    <VoucherContext.Provider value={{ 
      vouchers, 
      currentVoucher, 
      createVoucher, 
      getVoucherById 
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
