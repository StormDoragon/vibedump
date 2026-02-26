import "./globals.css";

export const metadata = {
  title: "Vibedump — Paste → Run → Grok Roast → Commit → Pump",
  description:
    "Browser-native sandbox. Node.js in your browser. Grok AI roasts your code. GitHub commits. X posts. Solana pumps. All in one chaotic flow.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="dark bg-slate-950 text-white">
        {children}
      </body>
    </html>
  );
}
