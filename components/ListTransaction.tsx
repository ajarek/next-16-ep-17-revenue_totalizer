"use client"
import { useRecordsStore } from "@/store/recordsStore"
import { useCurrentUserStore } from "@/store/currentUserStore"
import { Button } from "./ui/button"
import { Trash } from "lucide-react"
import { format } from "date-fns"

const ListTransaction = ({end=undefined}: {end: number | undefined}) => {
  const { items, removeItemFromRecords } = useRecordsStore()
  const { currentUser } = useCurrentUserStore()
  return (
    <div className='w-full h-[480px] flex flex-col gap-4 p-4 overflow-y-auto'>
      {items
        .slice(0, end)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .filter(
          (item) =>
            currentUser?.name === "User" ||
            item.user_name === "User" ||
            item.user_name === currentUser?.name,
        )
        .map((item, index) => (
          <div
            key={item.id}
            className='text-xl flex items-center justify-between border-b-2 border-primary/40 pb-2'
          >
            <p>{index + 1}.</p>
            <p>{format(new Date(item.date), "dd.MM.yyyy")}</p>
            <p>{item.user_name}</p>
            <p>{item.amount.toFixed(2)}</p>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => removeItemFromRecords(item.id)}
              className='cursor-pointer h-10 w-10'
            >
              <Trash />
            </Button>
          </div>
        ))}
      
    </div>
  )
}

export default ListTransaction
