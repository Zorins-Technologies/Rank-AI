import "./globals.css";

export const metadata = {
  title: "RANK AI — AI-Powered SEO Blog Generator",
  description:
    "Generate high-quality, SEO-optimized blog posts with AI-generated images in seconds. Powered by Google Gemini and Imagen.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-grid">
        <div className="fixed inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-700/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-700/8 rounded-full blur-3xl" />
        </div>
        {children}
      </body>
    </html>
  );
}
