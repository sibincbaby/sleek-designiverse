
/**
 * Generates a unique ID for voucher links
 */
export function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Available voucher themes
 */
export const VOUCHER_THEMES = [
  { id: "birthday", name: "Birthday", 
    colors: "bg-gradient-to-r from-pink-500 to-purple-600", 
    icon: "gift" },
  { id: "wedding", name: "Wedding", 
    colors: "bg-gradient-to-r from-blue-400 to-indigo-500", 
    icon: "gift" },
  { id: "anniversary", name: "Anniversary", 
    colors: "bg-gradient-to-r from-amber-500 to-red-500", 
    icon: "calendar" },
  { id: "thank-you", name: "Thank You", 
    colors: "bg-gradient-to-r from-green-400 to-emerald-500", 
    icon: "gift" },
  { id: "congratulations", name: "Congratulations", 
    colors: "bg-gradient-to-r from-yellow-400 to-orange-500", 
    icon: "calendar-check" },
] as const;

export type VoucherTheme = typeof VOUCHER_THEMES[number]['id'];

export interface VoucherData {
  id: string;
  title: string;
  code: string;
  theme: VoucherTheme;
  createdAt: number;
}
