
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useVoucher } from "@/contexts/VoucherContext";
import { VoucherDisplay } from "@/components/voucher/VoucherDisplay";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function VoucherView() {
  const { id } = useParams<{ id: string }>();
  const { getVoucherById } = useVoucher();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  const voucher = id ? getVoucherById(id) : undefined;
  
  useEffect(() => {
    // Short timeout to allow for smooth transitions
    const timer = setTimeout(() => {
      setLoading(false);
      if (!voucher) {
        setNotFound(true);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [voucher]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-80 h-40 bg-gray-200 rounded-md mb-4"></div>
          <div className="w-60 h-6 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }
  
  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Voucher Not Found</h1>
        <p className="text-muted-foreground mb-6">This voucher may have expired or the link is incorrect.</p>
        <Link to="/">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Create Your Own Voucher
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto mb-6">
        <Link to="/" className="inline-block">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Create Your Own
          </Button>
        </Link>
      </div>
      
      {voucher && <VoucherDisplay voucher={voucher} />}
    </div>
  );
}
