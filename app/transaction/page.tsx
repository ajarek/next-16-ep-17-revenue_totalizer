"use client"
import ListTransaction from "@/components/ListTransaction"
import { Button } from "@/components/ui/button"
import { useRecordsStore } from "@/store/recordsStore"
import { useCurrentUserStore } from "@/store/currentUserStore"

const TransactionPage = () => {
  const { removeAllFromRecords } = useRecordsStore()
  const { items } = useRecordsStore()
  const { currentUser } = useCurrentUserStore()
  return (
    <div className='max-h-[calc(1200px-144px)] w-full flex flex-col justify-start gap-4 p-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl font-bold'>Wszystkie transakcje</h1>
        <Button
          onClick={() => removeAllFromRecords()}
          className='bg-red-500 text-white hover:bg-red-600 cursor-pointer'
        >
          Usuń wszystkie
        </Button>
      </div>
      <ListTransaction end={undefined} />
      <div className='text-xl flex items-center justify-between border-b-2 border-primary/40 pb-2'>
        <p className='w-full text-primary text-xl text-right font-bold px-4'>
          Suma:
          {items
            .filter(
              (item) =>
                currentUser?.name === "User" ||
                item.user_name === "User" ||
                item.user_name === currentUser?.name,
            )
            .reduce((acc, item) => acc + item.amount, 0)
            .toFixed(2)}
        </p>
      </div>
    </div>
  )
}

export default TransactionPage
