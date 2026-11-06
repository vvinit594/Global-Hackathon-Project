import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stealth Pay – Privacy-Preserving Blockchain Payments",
  description:
    "Shielded payment prototype utilizing one-time stealth addresses, private note commitments, and zero-knowledge proofs on EVM networks.",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('stealthpay-theme');
                  var isDark = stored === 'dark' || ((!stored || stored === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  document.documentElement.setAttribute('data-theme', stored || 'system');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-primary)] antialiased transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
