import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Volza CSV Analyzer",
  description: "Upload and analyze CSV files with Volza Automation",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
