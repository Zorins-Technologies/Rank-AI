import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-display" });

export const metadata = {
  title: "RankAI — Dominate Search on Autopilot",
  description: "RankAI automates content creation, backlink building, and Answer Engine Optimization (AEO). The single platform to grow organic traffic seamlessly.",
  keywords: ["AI SEO", "AEO", "automated content", "AI backlinks", "search optimization"],
  openGraph: {
    title: "RankAI — AI-Powered Growth Engine",
    description: "Automate your content pipeline and rank higher on Google + AI engines.",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "RankAI",
      "applicationCategory": "SEO Software",
      "operatingSystem": "Web",
      "description": "AI-powered SEO and AEO platform for automated growth.",
      "offers": {
        "@type": "AggregateOffer",
        "lowPrice": "29",
        "highPrice": "199",
        "priceCurrency": "USD"
      },
    }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-[#020617] text-slate-100`}>
        <AuthProvider>
          <Toaster 
            position="bottom-right"
            toastOptions={{
              className: '!bg-slate-900 !text-slate-100 !border !border-white/10 !rounded-2xl',
            }}
          />
          
          <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
          </div>

          <main className="relative flex flex-col min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
