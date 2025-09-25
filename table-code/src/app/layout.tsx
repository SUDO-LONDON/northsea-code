import type { Metadata } from "next";
import "../index.css";

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
        <title>Northsea - Bunker Oil</title>
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-background">
        {children}
      </body>
    </html>
  );
}
