import type { Metadata } from "next";
import Nav from "@/components/Nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Buck Up — Tools for Organizational Resilience",
  description: "Four tools to help groups, industries, and professions harden against authoritarian pressure and organized reversal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 antialiased">
        <Nav />
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-zinc-800 py-6 mt-16">
          <div className="max-w-6xl mx-auto px-4 text-center text-zinc-500 text-sm">
            Built on the &ldquo;In Formation&rdquo; and &ldquo;Bucking Up Groups&rdquo; frameworks.
            Resilience should be built into formation itself, not retrofitted after a threat appears.
          </div>
        </footer>
      </body>
    </html>
  );
}
