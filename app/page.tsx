import Calculator from "@/components/Calculator"

export default function Home() {
  const currentDate = new Date()
  return (
    <div className='w-full min-h-screen flex flex-col items-center justify-start gap-4  p-4'>
      <div className='flex flex-col items-center justify-center gap-2 '>
        <p className='text-sm  space-x-2'>
          <span className='text-sm text-muted-foreground'>
            Suma w miesiącu:{" "}
          </span>
          {currentDate.toLocaleString("pl-PL", {
            month: "long",
            year: "numeric",
          })}{" "}
        </p>
        <h1 className='text-5xl font-bold text-primary'>240.00 zł</h1>
        <p>
          <span className='text-sm text-muted-foreground'>Bieżący dzień:</span>{" "}
          {currentDate.toLocaleDateString()}
        </p>
      </div>

      <Calculator />
    </div>
  )
}
