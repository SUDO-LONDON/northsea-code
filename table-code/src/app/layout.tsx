import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./critical.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Northsea - Bunker Oil",
  description: "Bunker Oil Trading Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
            /* Critical CSS - loaded immediately */
            * { box-sizing: border-box; }
            html, body { 
              margin: 0; 
              padding: 0; 
              font-family: ${inter.style.fontFamily}, system-ui, -apple-system, sans-serif;
            }
            
            /* Dark theme variables - always available */
            :root {
              --background: #0f0d21;
              --foreground: #fefeff;
              --muted: #1a1830;
              --muted-foreground: #9ca3af;
              --card: #141225;
              --card-foreground: #fefeff;
              --border: #2d2a3e;
              --radius: 0.65rem;
            }
            
            /* Force dark theme styling immediately */
            .bg-background { background-color: #0f0d21 !important; }
            .text-foreground { color: #fefeff !important; }
            .text-muted-foreground { color: #9ca3af !important; }
            .bg-muted { background-color: #1a1830 !important; }
            .bg-card { background-color: #141225 !important; }
            .text-card-foreground { color: #fefeff !important; }
            .border { border-color: #2d2a3e !important; }
            
            /* Layout utilities */
            .min-h-screen { min-height: 100vh !important; }
            .min-h-svh { min-height: 100vh !important; }
            .container { 
              max-width: 1200px !important; 
              margin: 0 auto !important; 
              padding: 0 1.5rem !important; 
            }
            .grid { display: grid !important; }
            .flex { display: flex !important; }
            .items-center { align-items: center !important; }
            .justify-center { justify-content: center !important; }
            .justify-between { justify-content: space-between !important; }
            .justify-end { justify-content: flex-end !important; }
            .flex-col { flex-direction: column !important; }
            
            /* Complete spacing utilities */
            .gap-1 { gap: 0.25rem !important; }
            .gap-4 { gap: 1rem !important; }
            .gap-6 { gap: 1.5rem !important; }
            .p-2 { padding: 0.5rem !important; }
            .p-4 { padding: 1rem !important; }
            .p-6 { padding: 1.5rem !important; }
            .px-2 { padding-left: 0.5rem !important; padding-right: 0.5rem !important; }
            .px-4 { padding-left: 1rem !important; padding-right: 1rem !important; }
            .px-6 { padding-left: 1.5rem !important; padding-right: 1.5rem !important; }
            .py-3 { padding-top: 0.75rem !important; padding-bottom: 0.75rem !important; }
            .mb-2 { margin-bottom: 0.5rem !important; }
            .mb-4 { margin-bottom: 1rem !important; }
            .mb-6 { margin-bottom: 1.5rem !important; }
            .mb-8 { margin-bottom: 2rem !important; }
            .mt-1 { margin-top: 0.25rem !important; }
            
            /* Typography */
            .text-4xl { font-size: 2.25rem !important; line-height: 2.5rem !important; }
            .text-2xl { font-size: 1.5rem !important; line-height: 2rem !important; }
            .text-xl { font-size: 1.25rem !important; line-height: 1.75rem !important; }
            .text-lg { font-size: 1.125rem !important; line-height: 1.75rem !important; }
            .text-sm { font-size: 0.875rem !important; line-height: 1.25rem !important; }
            .text-xs { font-size: 0.75rem !important; line-height: 1rem !important; }
            .font-bold { font-weight: 700 !important; }
            .font-semibold { font-weight: 600 !important; }
            .text-center { text-align: center !important; }
            .uppercase { text-transform: uppercase !important; }
            
            /* Colors for error states */
            .text-red-500 { color: #ef4444 !important; }
            .bg-red-50 { background-color: #fef2f2 !important; }
            .border-red-200 { border-color: #fecaca !important; }
            .text-gray-500 { color: #6b7280 !important; }
            .bg-gray-50 { background-color: #f9fafb !important; }
            
            /* Card styling */
            .rounded-xl { border-radius: 0.75rem !important; }
            .rounded-lg { border-radius: 0.65rem !important; }
            .rounded { border-radius: 0.375rem !important; }
            .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important; }
            .shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1) !important; }
            
            /* Grid utilities */
            .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            .space-y-4 > * + * { margin-top: 1rem !important; }
            .w-full { width: 100% !important; }
            .max-w-sm { max-width: 24rem !important; }
            .relative { position: relative !important; }
            .absolute { position: absolute !important; }
            .inset-0 { top: 0 !important; right: 0 !important; bottom: 0 !important; left: 0 !important; }
            .border-t { border-top-width: 1px !important; border-top-color: #2d2a3e !important; }
            .sr-only { position: absolute !important; width: 1px !important; height: 1px !important; padding: 0 !important; margin: -1px !important; overflow: hidden !important; clip: rect(0, 0, 0, 0) !important; white-space: nowrap !important; border: 0 !important; }
            
            /* Responsive utilities */
            @media (min-width: 640px) {
              .sm\\:px-6 { padding-left: 1.5rem !important; padding-right: 1.5rem !important; }
            }
            @media (min-width: 768px) {
              .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
              .md\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
              .md\\:p-10 { padding: 2.5rem !important; }
            }
            @media (min-width: 1024px) {
              .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)) !important; }
            }
          `,
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
