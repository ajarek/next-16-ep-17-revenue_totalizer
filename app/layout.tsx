import type { Metadata } from "next"
import { Roboto } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import { ThemeProvider } from "next-themes"

const roboto = Roboto({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Sumator przychodów",
  description: "Sumator przychodów - aplikacja do sumowania przychodów",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='pl' className={roboto.variable} suppressHydrationWarning>
      <body className={`antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
         <div className='w-full max-w-[560px] h-[1200px] mx-auto flex flex-col items-center justify-start border-4 border-primary '>
          <Navbar />
          {children}
         </div>
          </ThemeProvider>
      </body>
    </html>
  )
}
