import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from '../context/UserContext';

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
        </UserProvider>
      </body>
    </html>
  );
}
