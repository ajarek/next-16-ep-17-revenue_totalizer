import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className='fixed top-0 left-0 right-0 h-screen w-full mx-auto border container flex flex-col items-center justify-center bg-secondary z-70 overflow-hidden'>
      <div className='w-full flex flex-col items-center text-center gap-6'>
        <h1 className='text-4xl font-serif text-primary mt-4'>
          Strona nie znaleziona!
        </h1>

        <p className='max-w-lg  text-lg px-4'>
          Strona, której próbujesz się dostać, nie jest dostępna lub adres jest
          niepoprawny. Spróbuj przejść na stronę główną lub sprawdź poprawność
          adresu URL.
        </p>

        <div className='flex gap-3'>
          <Link href='/'>
            <Button className='rounded-xl  cursor-pointer'>
              Strona główna
            </Button>
          </Link>
        </div>

        <p className=''>Kod błędu: 404</p>
      </div>
    </main>
  )
}
