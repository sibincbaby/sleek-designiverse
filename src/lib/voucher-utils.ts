
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
  { 
    id: "birthday", 
    name: "Birthday", 
    colors: "bg-gradient-to-r from-pink-500 via-pink-400 to-purple-600", 
    icon: "cake",
    emoji: "🎂"
  },
  { 
    id: "wedding", 
    name: "Wedding", 
    colors: "bg-gradient-to-r from-blue-300 via-indigo-400 to-blue-500", 
    icon: "heart",
    emoji: "💍" 
  },
  { 
    id: "anniversary", 
    name: "Anniversary", 
    colors: "bg-gradient-to-r from-amber-400 via-red-400 to-amber-500", 
    icon: "trophy",
    emoji: "🥂" 
  },
  { 
    id: "thank-you", 
    name: "Thank You", 
    colors: "bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500", 
    icon: "smile",
    emoji: "🙏" 
  },
  { 
    id: "congratulations", 
    name: "Congratulations", 
    colors: "bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-500", 
    icon: "award",
    emoji: "🎉" 
  },
] as const;

export type VoucherTheme = typeof VOUCHER_THEMES[number]['id'];

export interface VoucherData {
  id: string;
  title: string;
  code: string;
  theme: VoucherTheme;
  createdAt: number;
}

/**
 * Creates a shareable URL that includes voucher data
 */
export function createShareableVoucherUrl(voucher: VoucherData): string {
  const baseUrl = `${window.location.origin}/voucher/${voucher.id}`;
  const dataToEncode = {
    title: voucher.title,
    code: voucher.code,
    theme: voucher.theme,
    createdAt: voucher.createdAt
  };
  
  const encodedData = encodeURIComponent(btoa(JSON.stringify(dataToEncode)));
  return `${baseUrl}?data=${encodedData}`;
}
