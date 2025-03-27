
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useVoucher } from "@/contexts/VoucherContext";
import { VOUCHER_THEMES, VoucherTheme, shortenUrl, sanitizeText } from "@/lib/voucher-utils";
import { Gift, Share, Loader, AlertCircle } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define maximum character limits
const MAX_CHARS = {
  title: 50,
  provider: 30,
  code: 25,
  message: 150
};

// Define rate limiting constants
const MIN_GENERATION_INTERVAL = 5000; // 5 seconds
const MAX_DAILY_VOUCHERS = 10;

const formSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(MAX_CHARS.title, `Title cannot exceed ${MAX_CHARS.title} characters`),
  code: z.string()
    .min(3, "Code must be at least 3 characters")
    .max(MAX_CHARS.code, `Code cannot exceed ${MAX_CHARS.code} characters`),
  theme: z.enum(["birthday", "wedding", "anniversary", "thank-you", "congratulations"] as const),
  provider: z.string()
    .max(MAX_CHARS.provider, `Provider cannot exceed ${MAX_CHARS.provider} characters`)
    .optional(),
  message: z.string()
    .max(MAX_CHARS.message, `Message cannot exceed ${MAX_CHARS.message} characters`)
    .optional()
});

export function VoucherCreator() {
  const { toast } = useToast();
  const { createVoucher } = useVoucher();
  const [isCreating, setIsCreating] = useState(false);
  const [rateLimitError, setRateLimitError] = useState("");
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      code: "",
      theme: "birthday" as VoucherTheme,
      provider: "",
      message: ""
    },
  });

  // Reset rate limit error when form values change
  useEffect(() => {
    if (rateLimitError) {
      setRateLimitError("");
    }
  }, [form.watch(), rateLimitError]);

  // Function to check if we can generate a new voucher
  const canGenerateVoucher = (): boolean => {
    // Check for rate limiting
    const lastGeneration = localStorage.getItem('lastVoucherGeneration');
    if (lastGeneration) {
      const timeSinceLastGeneration = Date.now() - parseInt(lastGeneration, 10);
      if (timeSinceLastGeneration < MIN_GENERATION_INTERVAL) {
        setRateLimitError("Please wait a few seconds before generating another voucher.");
        return false;
      }
    }

    // Check for daily limit
    const voucherCountData = localStorage.getItem('dailyVoucherCount');
    if (voucherCountData) {
      const { count, date } = JSON.parse(voucherCountData);
      const today = new Date().toDateString();
      
      // If it's a new day, reset the counter
      if (date !== today) {
        localStorage.setItem('dailyVoucherCount', JSON.stringify({ count: 1, date: today }));
        return true;
      }
      
      // Check if we've hit the limit
      if (count >= MAX_DAILY_VOUCHERS) {
        setRateLimitError(`You have reached the daily limit of ${MAX_DAILY_VOUCHERS} vouchers. Please try again tomorrow.`);
        return false;
      }
      
      // Update the counter for today
      localStorage.setItem('dailyVoucherCount', JSON.stringify({ count: count + 1, date: today }));
    } else {
      // First voucher of the day
      const today = new Date().toDateString();
      localStorage.setItem('dailyVoucherCount', JSON.stringify({ count: 1, date: today }));
    }
    
    return true;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Check rate limiting and daily limits
    if (!canGenerateVoucher()) {
      return;
    }

    setIsCreating(true);
    
    try {
      // Sanitize inputs for URL shortening
      const sanitizedValues = {
        title: sanitizeText(values.title),
        code: values.code,
        theme: values.theme,
        provider: values.provider ? sanitizeText(values.provider) : "",
        message: values.message ? sanitizeText(values.message) : "",
      };

      const voucherId = createVoucher(
        sanitizedValues.title, 
        sanitizedValues.code, 
        sanitizedValues.theme, 
        sanitizedValues.provider,
        sanitizedValues.message
      );
      
      // Create a URL with the voucher ID and add a timestamp to prevent duplicate URLs
      const timestamp = Date.now();
      const baseUrl = `${window.location.origin}/voucher/${voucherId}`;
      
      // Create voucher data with timestamp to make URL unique
      const voucherData = {
        title: sanitizedValues.title,
        code: sanitizedValues.code,
        theme: sanitizedValues.theme,
        provider: sanitizedValues.provider || "",
        message: sanitizedValues.message || "",
        createdAt: timestamp
      };
      
      const dataParam = encodeURIComponent(btoa(JSON.stringify(voucherData)));
      const universalShareUrl = `${baseUrl}?data=${dataParam}&t=${timestamp}`;
      
      // Shorten the URL
      const shortUrl = await shortenUrl(universalShareUrl);
      
      // Store the last generation time for rate limiting
      localStorage.setItem('lastVoucherGeneration', Date.now().toString());
      
      // Copy the shortened link to clipboard
      await navigator.clipboard.writeText(shortUrl);
      toast({
        title: "Ready to share!",
        description: "Your voucher link is ready and copied to your clipboard. Send it to someone special!",
      });
      
      form.reset();
    } catch (error) {
      console.error("Error creating voucher:", error);
      toast({
        title: "Something went wrong",
        description: "There was a problem creating your voucher. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Create a Voucher</CardTitle>
        <CardDescription className="text-center">
          Create a beautiful voucher to share with someone special
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rateLimitError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Rate Limited</AlertTitle>
            <AlertDescription>{rateLimitError}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Title</FormLabel>
                    <span className="text-xs text-muted-foreground">
                      {field.value.length}/{MAX_CHARS.title}
                    </span>
                  </div>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Birthday Gift Card" 
                      {...field} 
                      maxLength={MAX_CHARS.title}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Provider</FormLabel>
                    <span className="text-xs text-muted-foreground">
                      {field.value?.length || 0}/{MAX_CHARS.provider}
                    </span>
                  </div>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Amazon, Flipkart, Starbucks" 
                      {...field} 
                      maxLength={MAX_CHARS.provider}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Voucher Code</FormLabel>
                    <span className="text-xs text-muted-foreground">
                      {field.value.length}/{MAX_CHARS.code}
                    </span>
                  </div>
                  <FormControl>
                    <Input 
                      placeholder="e.g. BIRTHDAY2023" 
                      {...field} 
                      maxLength={MAX_CHARS.code}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Message (Optional)</FormLabel>
                    <span className="text-xs text-muted-foreground">
                      {field.value?.length || 0}/{MAX_CHARS.message}
                    </span>
                  </div>
                  <FormControl>
                    <Textarea 
                      placeholder="Add a personal message..." 
                      {...field} 
                      maxLength={MAX_CHARS.message}
                      className="resize-none"
                    />
                  </FormControl>
                  <FormDescription>
                    Add a personal note to accompany your voucher
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Theme</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 md:grid-cols-2 gap-2"
                    >
                      {VOUCHER_THEMES.map((theme) => (
                        <FormItem key={theme.id}>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem 
                                value={theme.id} 
                                id={theme.id} 
                                className="sr-only" 
                              />
                              <label
                                htmlFor={theme.id}
                                className={`${
                                  field.value === theme.id
                                    ? `ring-2 ring-primary ${theme.colors}`
                                    : theme.colors
                                } flex items-center justify-between p-3 rounded-md cursor-pointer text-white w-full`}
                              >
                                <div className="flex items-center">
                                  <Gift className="mr-2 h-4 w-4" />
                                  {theme.name}
                                </div>
                                <span className="text-xl">{theme.emoji}</span>
                              </label>
                            </div>
                          </FormControl>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Share className="mr-2 h-4 w-4" />
                  Create & Share Voucher
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
