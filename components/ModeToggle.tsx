"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Button
      variant='ghost'
      size='icon'
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label='Toggle theme'
      className='cursor-pointer bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent'
    >
      {theme === "dark" ? (
        <Sun size={32} className='' />
      ) : (
        <Moon size={32} className='' />
      )}
    </Button>
  )
}
