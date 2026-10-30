import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

// Meta tags específicas do PWA e iOS
export const metadata: Metadata = {
  title: 'Visitas da Emilia',
  description: 'Gestão de visitas e clientes em campo',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Visitas Emilia',
  },
  formatDetection: {
    telephone: false,
  },
}

// Configuração do Viewport para comportamento de App Nativo no iPhone 11
export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover', // Respeita a notch e home indicator do iPhone
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-50 text-slate-900 antialiased selection:bg-blue-100`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}