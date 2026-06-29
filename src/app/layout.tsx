import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Computech Ops",
  description: "Equipment, ticketing, and admin time tracking for IT service work.",
  icons: {
    icon: '/logo.png'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
