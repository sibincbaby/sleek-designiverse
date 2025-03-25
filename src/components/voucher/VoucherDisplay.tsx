
import React, { useState } from "react";
import { Calendar, Copy, Share, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { VOUCHER_THEMES, VoucherData } from "@/lib/voucher-utils";

interface VoucherDisplayProps {
  voucher: VoucherData;
}

export function VoucherDisplay({ voucher }: VoucherDisplayProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const theme = VOUCHER_THEMES.find(t => t.id === voucher.theme) || VOUCHER_THEMES[0];
  
  const copyCode = () => {
    navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    toast({
      title: "Code copied!",
      description: "The voucher code has been copied to your clipboard.",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const shareVoucher = () => {
    if (navigator.share) {
      navigator.share({
        title: voucher.title,
        text: `Check out my voucher: ${voucher.title}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "The voucher link has been copied to your clipboard.",
      });
    }
  };
  
  return (
    <Card className={`w-full max-w-md mx-auto overflow-hidden shadow-lg ${theme.colors} text-white`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <Calendar className="h-6 w-6" />
          <div className="text-sm opacity-80">
            {new Date(voucher.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <CardTitle className="text-2xl font-bold">{voucher.title}</CardTitle>
          <span className="text-4xl animate-bounce">{theme.emoji}</span>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 text-center">
          <p className="text-sm mb-2 opacity-80">Your voucher code:</p>
          <div className="text-3xl font-mono font-bold tracking-wider break-all">
            {voucher.code}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 justify-center pt-0">
        <Button 
          onClick={copyCode} 
          variant="secondary" 
          className="text-black bg-white hover:bg-white/90"
        >
          <Copy className="mr-2 h-4 w-4" />
          {copied ? "Copied!" : "Copy Code"}
        </Button>
        <Button 
          onClick={shareVoucher}
          variant="outline" 
          className="border-white text-white hover:bg-white/20"
        >
          <Share className="mr-2 h-4 w-4" />
          Share
        </Button>
      </CardFooter>
    </Card>
  );
}
