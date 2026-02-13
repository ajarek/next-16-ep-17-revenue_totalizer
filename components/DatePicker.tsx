"use client"

import { format } from "date-fns"
import { pl } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const DatePicker = ({
  date,
  setDate,
}: {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          data-empty={!date}
          className='data-[empty=true]:text-muted-foreground w-[140px] justify-start text-left font-normal'
        >
          <CalendarIcon />
          {date ? format(date, "dd.MM.yyyy") : <span>Dzisiaj</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <Calendar
          locale={pl}
          mode='single'
          selected={date}
          onSelect={setDate}
        />
      </PopoverContent>
    </Popover>
  )
}

export default DatePicker
