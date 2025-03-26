
import React, { useState } from "react";
import { Calendar, Copy, Share, Gift, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { VOUCHER_THEMES, VoucherData, shortenUrl } from "@/lib/voucher-utils";

interface VoucherDisplayProps {
  voucher: VoucherData;
}

export function VoucherDisplay({ voucher }: VoucherDisplayProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  
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
  
  const shareVoucher = async () => {
    setSharing(true);
    try {
      // Get the current URL and shorten it
      const currentUrl = window.location.href;
      const shortenedUrl = await shortenUrl(currentUrl);
      
      if (navigator.share) {
        await navigator.share({
          title: voucher.title,
          text: `Check out my ${voucher.provider ? voucher.provider + ' ' : ''}voucher: ${voucher.title}`,
          url: shortenedUrl,
        });
      } else {
        // If Web Share API is not available, copy the shortened link
        await navigator.clipboard.writeText(shortenedUrl);
        toast({
          title: "Ready to share!",
          description: "The voucher link is now on your clipboard, ready to send.",
        });
      }
    } catch (error) {
      console.error("Error sharing voucher:", error);
      toast({
        title: "Something went wrong",
        description: "Couldn't prepare your voucher for sharing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSharing(false);
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
        {voucher.provider && (
          <div className="flex items-center mt-2 text-sm bg-white/10 px-2 py-1 rounded-md w-fit">
            <Tag className="h-3 w-3 mr-1" />
            <span>{voucher.provider}</span>
          </div>
        )}
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
          className="border-white text-white bg-white/20 hover:bg-white/30 flex items-center"
          disabled={sharing}
        >
          <Share className="mr-2 h-4 w-4" />
          {sharing ? "Preparing..." : "Send to Friend"}
        </Button>
      </CardFooter>
    </Card>
  );
}
