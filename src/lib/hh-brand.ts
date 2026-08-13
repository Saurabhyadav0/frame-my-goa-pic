export const BRAND = {
  green: "#0d5c34",
  greenDeep: "#062a18",
  yellow: "#f5d919",
  pink: "#ec1a71",
  cream: "#f5f1e4",
  ink: "#062a18",
};

export const TITLES = [
  "The Beach-Side Builder",
  "The Sunset Shipper",
  "The Midnight Merger",
  "The Coconut Compiler",
  "The Tide-Table Tinkerer",
  "The Susegad Stack Wizard",
  "The Palm-Shade Prototyper",
  "The Feni-Fueled Founder",
  "The Low-Latency Lifeguard",
  "The Sandbox Surfer",
  "The Monsoon Monolith Slayer",
  "The Barefoot Backend Boss",
];

export function titleFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return TITLES[h % TITLES.length] as string;
}

export const CAPTION = `Ready to build, ship, and make waves at Hacker House Goa 2026! 🌴🚀

Just claimed my official Hacker House Goa 2026 Builder Pass! 🌴

Who else is building in paradise this October? 🌴

Get your pass here 👇
https://frame-my-goa-pic.vercel.app

#FrameInGoa #HHGoa2026`;
