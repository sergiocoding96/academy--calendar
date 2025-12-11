import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SotoTennis Academy',
  description: 'Tennis Academy Management System - Sessions & Tournament Calendar',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
