
"use client"

import Calculator from "@/components/Calculator"
import { useRecordsStore } from "@/store/recordsStore"
import {useCurrentUserStore} from "@/store/currentUserStore"
import ListTransaction from "@/components/ListTransaction"
export default function Home() {
  const currentDate = new Date()
  const {items} = useRecordsStore()
  const {currentUser} = useCurrentUserStore()
  return (
    <div className='w-full min-h-[calc(1200px-144px)] flex flex-col items-center justify-start gap-4  p-4'>
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
        <h1 className='text-5xl font-bold text-primary'>{(items
          .filter((item) => item.user_name === currentUser?.name)
          .reduce((total, item) => total + item.amount, 0)).toFixed(2)} zł</h1>
      </div>

      <Calculator />
      <h2 className="text-2xl font-bold">Ostatnie transakcje:</h2>
      <ListTransaction end={5} />
    </div>
  )
}
