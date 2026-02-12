"use client"
import Link from "next/link"
import { ModeToggle } from "@/components/ModeToggle"
import Image from "next/image"
import User from "@/data/users.json"
import { useState } from "react"
import { Button } from "./ui/button"

const Navbar = () => {
  const [changeUser, setChangeUser] = useState(0)
  return (
    <div className='w-full h-16 flex justify-between items-center px-4 bg-primary/20'>
      <Link href='/'>
        <h1 className='text-xl font-semibold'>Sumator przychodów</h1>
      </Link>
      <div className='  flex gap-4 items-center'>
        <Button
          variant='ghost'
          size='icon'
          className='rounded-full cursor-pointer w-12 h-12'
          onClick={() => setChangeUser(changeUser === 0 ? 1 : 0)}
        >
          <Image
            src={User[changeUser].image}
            alt='Settings'
            width={60}
            height={60}
            className='rounded-full'
          />
        </Button>
        <ModeToggle />
      </div>
    </div>
  )
}

export default Navbar
