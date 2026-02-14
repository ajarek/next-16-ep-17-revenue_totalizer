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
        <Button
          asChild
          key={link.href}
          variant='ghost'
          size='icon'
          className='rounded-full cursor-pointer w-14 h-14 p-0 m-0'
        >
          <Link href={link.href}>
            <link.icon size={48} strokeWidth={1.75} />
          </Link>
        </Button>
      ))}
    </div>
  )
}

export default Footer
