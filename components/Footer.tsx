import { Home, List, ChartLine, Settings } from "lucide-react"
import Link from "next/link"
import { Button } from "./ui/button"

const LinksButton = [
  {
    href: "/",
    label: "Strona główna",
    icon: Home,
  },
  {
    href: "/transaction",
    label: "Transakcje",
    icon: List,
  },
  {
    href: "/analytics",
    label: "Przychody",
    icon: ChartLine,
  },
  {
    href: "/settings",
    label: "Ustawienia",
    icon: Settings,
  },
]

const Footer = () => {
  return (
    <div className='w-full h-20 flex justify-between items-center px-4 bg-primary/20'>
      {LinksButton.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className=' flex items-center justify-center hover:text-primary transition-colors duration-300 '
        >
          <link.icon size={48} />
        </Link>
      ))}
    </div>
  )
}

export default Footer
