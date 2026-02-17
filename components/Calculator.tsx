"use client"

import { useState } from "react"
import { Delete, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import DatePicker from "./DatePicker"
import { useRecordsStore } from "@/store/recordsStore"
import { useCurrentUserStore } from "@/store/currentUserStore"

export default function Calculator() {
  const [amount, setAmount] = useState("0.00")
  const [cardAmount, setCardAmount] = useState("")
  const [km, setKm] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const { addItemToRecords } = useRecordsStore()
  const { currentUser } = useCurrentUserStore()

  const handlePress = (key: string) => {
    if (key === "DEL") {
      if (
        amount.length === 1 ||
        (amount.length === 4 && amount.endsWith(".00") && !isTyping)
      ) {
        setAmount("0.00")
        setIsTyping(false)
      } else {
        setAmount((prev) => {
          const next = prev.slice(0, -1)
          return next.length === 0 ? "0" : next
        })
      }
      return
    }

    if (key === ".") {
      if (amount.includes(".")) return
      setAmount((prev) => prev + ".")
      setIsTyping(true)
      return
    }

    if (!isTyping) {
      setAmount(key)
      setIsTyping(true)
    } else {
      if (amount.includes(".")) {
        const [, decimal] = amount.split(".")
        if (decimal && decimal.length >= 2) return
      }
      setAmount((prev) => prev + key)
    }
  }

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "DEL"]

  return (
    <div className='w-full  mx-auto p-4 rounded-xl bg-card border shadow-sm'>
      <div className='flex items-center justify-between '>
        <span className='text-xs font-medium text-muted-foreground tracking-wider'>
          SZYBKIE DODAWANIE
        </span>

        <DatePicker date={date} setDate={setDate} />
      </div>

      <div className='flex items-baseline justify-center mb-2 gap-1'>
        <span className='text-2xl text-muted-foreground font-light mr-2'>
          PLN
        </span>
        <span
          className={cn(
            "text-3xl font-bold tracking-tight text-foreground transition-all",
            isTyping ? "scale-105" : "scale-100",
          )}
        >
          {amount}
        </span>
        <span className='w-0.5 h-10 bg-primary/50 animate-pulse ml-1 rounded-full' />
      </div>

      <div className='h-px w-full bg-border mb-6' />

      <div className='grid grid-cols-3 gap-3 mb-6'>
        {keys.map((key) => (
          <Button
            key={key}
            variant='secondary'
            className={cn(
              "h-14 text-xl font-medium transition-all active:scale-95",
              key === "DEL" &&
                "bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive",
            )}
            onClick={() => handlePress(key)}
          >
            {key === "DEL" ? <Delete className='h-6 w-6' /> : key}
          </Button>
        ))}
      </div>

      <div className='grid grid-cols-2 gap-4 mb-6'>
        <div className='space-y-2'>
          <Label htmlFor='card-amount'>Karta</Label>
          <Input
            id='card-amount'
            type='number'
            placeholder='0.00'
            value={cardAmount}
            onChange={(e) => setCardAmount(e.target.value)}
          />
        </div>
        <div className='space-y-2'>
          <Label htmlFor='km'>Kilometry</Label>
          <Input
            id='km'
            type='number'
            placeholder='0'
            value={km}
            onChange={(e) => setKm(e.target.value)}
          />
        </div>
      </div>

      <Button
        className='w-full h-14 text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98]'
        size='lg'
        onClick={() => {
          addItemToRecords({
            id: Date.now(),
            amount: parseFloat(amount),
            cardAmount: cardAmount ? parseFloat(cardAmount) : undefined,
            km: km ? parseFloat(km) : undefined,
            date: date || new Date(),
            user_name: currentUser?.name || "nieznany",
            fuelCost: km ? parseFloat(km) / 2 : undefined,
          })
          setAmount("0.00")
          setCardAmount("")
          setKm("")
          setIsTyping(false)
        }}
      >
        <Plus className='mr-2 h-5 w-5 stroke-3' />
        ZAPISZ PŁATNOŚĆ
      </Button>
    </div>
  )
}
