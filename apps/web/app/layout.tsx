import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vibedump — Paste → Run → Grok Roast → Commit → Pump",
  description:
    "Browser-native sandbox. Node.js in your browser. Grok AI roasts your code. GitHub commits. X posts. Solana pumps. All in one chaotic flow.",
  keywords: [
    "sandbox",
    "webcontainer",
    "node.js",
    "browser",
    "grok-4",
    "ai",
    "solana",
  ],
  authors: [{ name: "Sarcastic Apes" }],
  openGraph: {
    title: "Vibedump",
    description: "The chaotic dev playground that actually ships",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body>
          <ThemeProvider attribute="class" defaultTheme="dark">
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
