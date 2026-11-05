import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stealth Pay – Privacy-Preserving Blockchain Payments",
  description:
    "Shielded payment prototype utilizing one-time stealth addresses, private note commitments, and zero-knowledge proofs on EVM testnets.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background text-charcoal min-h-screen antialiased selection:bg-sage-200">
        {children}
      </body>
    </html>
  );
}
