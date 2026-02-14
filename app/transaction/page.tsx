"use client"
import ListTransaction from '@/components/ListTransaction'
import { Button } from '@/components/ui/button'
import { useRecordsStore } from "@/store/recordsStore"

const TransactionPage = () => {
  const {removeAllFromRecords} = useRecordsStore()
  return (
    <div className='min-h-[calc(1200px-128px)] w-full flex flex-col justify-start gap-4 p-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-xl font-bold'>Wszystkie transakcje</h1>
        <Button onClick={() => removeAllFromRecords()} className='bg-red-500 text-white hover:bg-red-600 cursor-pointer'>Usuń wszystkie</Button>

      </div>
       <ListTransaction />
    </div>
  )
}

export default TransactionPage