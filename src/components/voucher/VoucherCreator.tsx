
import React, { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useVoucher } from "@/contexts/VoucherContext";
import { VOUCHER_THEMES, VoucherTheme, createShareableVoucherUrl, shortenUrl } from "@/lib/voucher-utils";
import { Gift, Share, Loader } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(50, "Title cannot exceed 50 characters"),
  code: z.string().min(3, "Code must be at least 3 characters").max(30, "Code cannot exceed 30 characters"),
  theme: z.enum(["birthday", "wedding", "anniversary", "thank-you", "congratulations"] as const),
  provider: z.string().min(2, "Provider must be at least 2 characters").max(30, "Provider cannot exceed 30 characters").optional()
});

export function VoucherCreator() {
  const { toast } = useToast();
  const { createVoucher } = useVoucher();
  const [isCreating, setIsCreating] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      code: "",
      theme: "birthday" as VoucherTheme,
      provider: ""
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsCreating(true);
    
    try {
      const voucherId = createVoucher(values.title, values.code, values.theme, values.provider || "");
      
      // Create a URL with the voucher ID
      const baseUrl = `${window.location.origin}/voucher/${voucherId}`;
      
      // Also create a data URL that can be used across different browsers/devices
      const voucherData = {
        title: values.title,
        code: values.code,
        theme: values.theme,
        provider: values.provider || "",
        createdAt: Date.now()
      };
      
      const dataParam = encodeURIComponent(btoa(JSON.stringify(voucherData)));
      const universalShareUrl = `${baseUrl}?data=${dataParam}`;
      
      // Shorten the URL
      const shortUrl = await shortenUrl(universalShareUrl);
      
      navigator.clipboard.writeText(shortUrl).then(() => {
        toast({
          title: "Share link copied!",
          description: "The shortened link to your voucher has been copied to your clipboard. You can share it with anyone.",
        });
      });
      
      form.reset();
    } catch (error) {
      console.error("Error creating voucher:", error);
      toast({
        title: "Error creating voucher",
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Birthday Gift Card" {...field} />
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
                  <FormLabel>Provider</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Amazon, Flipkart, Starbucks" {...field} />
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
                  <FormLabel>Voucher Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. BIRTHDAY2023" {...field} />
                  </FormControl>
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
