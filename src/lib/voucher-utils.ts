
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
  message?: string;
  createdAt: number;
}

// List of words that might trigger spam filters
const SUSPICIOUS_WORDS = [
  'free', 'win', 'winner', 'offer', 'discount', 'limited', 'special', 
  'exclusive', 'prize', 'gift', 'promotion', 'deal', 'bargain', 'sale',
  'cash', 'money', 'bonus', 'unlimited'
];

/**
 * Sanitizes text to avoid spam detection
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  
  // Normalize the text (trim and remove extra spaces)
  let sanitized = text.trim().replace(/\s+/g, ' ');
  
  // Convert to lowercase for comparison
  const lowerText = sanitized.toLowerCase();
  
  // Check for suspicious words and replace them with safer alternatives
  SUSPICIOUS_WORDS.forEach(word => {
    // Only replace whole words, not parts of words
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    
    // Build a replacement based on the word
    let replacement;
    switch (word) {
      case 'free': replacement = 'no-cost'; break;
      case 'discount': replacement = 'savings'; break;
      case 'offer': replacement = 'option'; break;
      case 'win': case 'winner': replacement = 'receive'; break;
      case 'prize': case 'gift': replacement = 'present'; break;
      case 'unlimited': replacement = 'full'; break;
      case 'promotion': case 'deal': replacement = 'opportunity'; break;
      default: replacement = ''; // Remove the word if no replacement
    }
    
    sanitized = sanitized.replace(regex, replacement);
  });
  
  // Remove any special characters that aren't needed
  sanitized = sanitized.replace(/[^\w\s.,!?-]/g, '');
  
  return sanitized;
}

/**
 * Creates a shareable URL that includes voucher data
 */
export function createShareableVoucherUrl(voucher: VoucherData): string {
  const timestamp = Date.now(); // Add timestamp to make URL unique
  const baseUrl = `${window.location.origin}/voucher/${voucher.id}`;
  const dataToEncode = {
    title: voucher.title,
    code: voucher.code,
    theme: voucher.theme,
    provider: voucher.provider,
    message: voucher.message,
    createdAt: voucher.createdAt
  };
  
  const encodedData = encodeURIComponent(btoa(JSON.stringify(dataToEncode)));
  return `${baseUrl}?data=${encodedData}&t=${timestamp}`;
}

/**
 * Shortens a URL using is.gd service with safeguards against rate limiting
 */
export async function shortenUrl(longUrl: string): Promise<string> {
  try {
    // Add a small random variation to prevent duplicate URLs if not already present
    if (!longUrl.includes('t=')) {
      const separator = longUrl.includes('?') ? '&' : '?';
      longUrl += `${separator}t=${Date.now()}`;
    }
    
    // First try with is.gd
    const response = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`);
    
    if (!response.ok) {
      console.warn('URL shortening service returned an error, using original URL');
      return longUrl;
    }
    
    const data = await response.json();
    return data.shorturl || longUrl;
  } catch (error) {
    console.error('Error shortening URL:', error);
    return longUrl; // Return original URL if shortening fails
  }
}

/**
 * Updates the document's meta tags for better link sharing
 */
export function updateMetaTags(title: string, provider: string, theme: VoucherTheme, message?: string): void {
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
  let descriptionText = `${title} - ${provider ? `${provider} voucher` : 'Gift voucher'} ${themeInfo.emoji}`;
  
  // Add a snippet of the message if available
  if (message) {
    const messageSnippet = message.length > 50 ? message.substring(0, 47) + '...' : message;
    descriptionText += ` "${messageSnippet}"`;
  }
  
  metaDescription.setAttribute('content', descriptionText);
  
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
  
  let ogDescText = `${provider ? `${provider} voucher` : 'Gift voucher'} - Click to view and use the code! ${themeInfo.emoji}`;
  if (message) {
    const messageSnippet = message.length > 30 ? message.substring(0, 27) + '...' : message;
    ogDescText += ` "${messageSnippet}"`;
  }
  
  ogDescription.setAttribute('content', ogDescText);
}
