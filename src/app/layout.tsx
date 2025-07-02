import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Volza Automation",
  description: "Upload and analyze CSV files with Volza Automation",
  icons: {
    icon: "/image.png", // ✅ This tells Next.js to use favicon from /public
  },
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
