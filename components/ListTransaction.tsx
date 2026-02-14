"use client"
import { useRecordsStore } from "@/store/recordsStore"
import { Button } from "./ui/button"
import { Trash } from "lucide-react"
import { format } from "date-fns"

const ListTransaction = () => {
  const { items, removeItemFromRecords } = useRecordsStore()
  return (
    <div className='w-full flex flex-col gap-4 p-4 overflow-y-auto'>
      {items
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((item, index) => (
          <div
            key={item.id}
            className='text-xl flex items-center justify-between border-b-2 border-primary/40 pb-2'
          >
            <p>{index + 1}.</p>
            <p>{format(new Date(item.date), "dd.MM.yyyy")}</p>
            <p>{item.user_name}</p>
            <p>{item.amount}</p>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => removeItemFromRecords(item.id)}
              className="cursor-pointer h-10 w-10"
            >
              <Trash />
            </Button>
          </div>
        ))}
    </div>
  )
}

export default ListTransaction
