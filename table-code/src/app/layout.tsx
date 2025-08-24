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
            /* Prevent flash of unstyled content */
            body { 
              background-color: #0f0d21; 
              color: #fefeff; 
              font-family: ${inter.style.fontFamily}, system-ui, -apple-system, sans-serif;
            }
            .container { 
              max-width: 1200px; 
              margin: 0 auto; 
              padding: 0 1.5rem; 
            }
          `,
          }}
        />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
