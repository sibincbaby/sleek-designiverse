

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
  provider: string;
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
    provider: voucher.provider,
    createdAt: voucher.createdAt
  };
  
  const encodedData = encodeURIComponent(btoa(JSON.stringify(dataToEncode)));
  return `${baseUrl}?data=${encodedData}`;
}

/**
 * Shortens a URL using is.gd service
 */
export async function shortenUrl(longUrl: string): Promise<string> {
  try {
    const response = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`);
    if (!response.ok) {
      throw new Error('URL shortening service failed');
    }
    const data = await response.json();
    return data.shorturl;
  } catch (error) {
    console.error('Error shortening URL:', error);
    return longUrl; // Return original URL if shortening fails
  }
}

/**
 * Updates the document's meta tags for better link sharing
 */
export function updateMetaTags(title: string, provider: string, theme: VoucherTheme): void {
  // Update title
  document.title = title || 'Voucher';
  
  // Find and update meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    document.head.appendChild(metaDescription);
  }
  const themeInfo = VOUCHER_THEMES.find(t => t.id === theme) || VOUCHER_THEMES[0];
  metaDescription.setAttribute('content', 
    `${title} - ${provider ? `${provider} voucher` : 'Gift voucher'} ${themeInfo.emoji}`);
  
  // Update OG tags
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (!ogTitle) {
    ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    document.head.appendChild(ogTitle);
  }
  ogTitle.setAttribute('content', title);
  
  let ogDescription = document.querySelector('meta[property="og:description"]');
  if (!ogDescription) {
    ogDescription = document.createElement('meta');
    ogDescription.setAttribute('property', 'og:description');
    document.head.appendChild(ogDescription);
  }
  ogDescription.setAttribute('content', 
    `${provider ? `${provider} voucher` : 'Gift voucher'} - Click to view and use the code! ${themeInfo.emoji}`);
}

