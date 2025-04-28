import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from '../context/UserContext';
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Bug Tracker | Track and manage software issues",
  description: "A modern bug tracking application to manage, track, and resolve software issues efficiently.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
    ],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: "#4f46e5",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <UserProvider>
          {children}
          <Toaster position="bottom-right" toastOptions={{
            success: {
              duration: 3000,
              style: {
                background: 'var(--success-color-light)',
                color: 'var(--success-color-dark)',
              },
            },
            error: {
              duration: 4000,
              style: {
                background: 'var(--error-color-light)',
                color: 'var(--error-color-dark)',
              },
            },
          }} />
        </UserProvider>
      </body>
    </html>
  );
}
