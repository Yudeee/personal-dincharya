import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dincharya",
  description: "Return to yourself",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Dincharya",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f7f4ef",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>
        <div className="min-h-screen min-h-dvh flex flex-col">
          <main className="flex-1 flex flex-col">
            {children}
          </main>

          {/* Minimal navigation - recedes, doesn't compete */}
          <nav className="py-6 px-4">
            <div className="max-w-md mx-auto flex justify-center gap-8">
              <Link
                href="/"
                className="text-sm text-earth-muted hover:text-earth transition-colors duration-300"
              >
                return
              </Link>
              <Link
                href="/reflect"
                className="text-sm text-earth-muted hover:text-earth transition-colors duration-300"
              >
                past
              </Link>
              <Link
                href="/settings"
                className="text-sm text-earth-muted hover:text-earth transition-colors duration-300"
              >
                settings
              </Link>
            </div>
          </nav>
        </div>
      </body>
    </html>
  );
}
