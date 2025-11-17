import type { Metadata } from "next";
import "../index.css";

export const metadata: Metadata = {
  title: "Secret Caps Society",
  description: "Marketplace for cap resellers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
