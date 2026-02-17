"use client"

import { useState, useEffect, useCallback } from "react"
import jsPDF from "jspdf"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Download,
  FileText,
  AlertCircle,
  CheckCircle2,
  Info,
  RefreshCw,
} from "lucide-react"
import { format } from "date-fns"
import type { Record as TransactionRecord } from "@/types/typeRecord"

interface PdfExportOptions {
  title?: string
  includeTimestamp?: boolean
  fontSize?: number
}

export default function LocalStorageToPdf() {
  const [items, setItems] = useState<TransactionRecord[]>([])
  const [availableUsers, setAvailableUsers] = useState<string[]>([])
  const [selectedUser, setSelectedUser] = useState<string>("all")
  const [filteredItems, setFilteredItems] = useState<TransactionRecord[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

  const loadRecords = useCallback(() => {
    if (typeof window === "undefined") return

    try {
      const rawValue = window.localStorage.getItem("recordsStore")
      if (!rawValue) {
        setItems([])
        setAvailableUsers([])
        setFilteredItems([])
        setDataLoaded(true)
        return
      }

      let parsedItems: TransactionRecord[] = []
      try {
        const parsed = JSON.parse(rawValue)

        if (parsed && parsed.state && Array.isArray(parsed.state.items)) {
          parsedItems = parsed.state.items
        } else if (Array.isArray(parsed)) {
          parsedItems = parsed
        }
      } catch (e) {
        console.error("Failed to parse records", e)
        setError("Błąd formatu danych w localStorage")
        return
      }

      setItems(parsedItems)

      const users = Array.from(
        new Set(parsedItems.map((item) => item.user_name)),
      ).sort()
      setAvailableUsers(users)

      setDataLoaded(true)
      setError(null)
    } catch (err) {
      setError("Błąd podczas odczytywania danych")
      console.error(err)
      setDataLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!dataLoaded) return

    let filtered = [...items]

    if (selectedUser !== "all") {
      filtered = filtered.filter((item) => item.user_name === selectedUser)
    }

    filtered.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )

    setFilteredItems(filtered)
  }, [items, selectedUser, dataLoaded])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  const generatePdf = async (options: PdfExportOptions = {}) => {
    if (filteredItems.length === 0) {
      setError("Brak danych do eksportu dla wybranego użytkownika")
      return
    }

    setIsExporting(true)
    setError(null)

    try {
      const { title = "Raport Transakcji", includeTimestamp = true } = options

      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      let yPosition = margin

      const checkNewPage = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          doc.addPage()
          yPosition = margin
        }
      }

      const totalAmount = filteredItems.reduce(
        (sum, item) => sum + item.amount,
        0,
      )
      const totalCard = filteredItems.reduce(
        (sum, item) => sum + (item.cardAmount || 0),
        0,
      )
      const totalKm = filteredItems.reduce(
        (sum, item) => sum + (item.km || 0),
        0,
      )
      const totalFuel = filteredItems.reduce(
        (sum, item) => sum + (item.fuelCost || 0),
        0,
      )

      doc.setFontSize(18)
      doc.setFont("helvetica", "bold")
      doc.text(title, margin, yPosition)
      yPosition += 10

      if (includeTimestamp) {
        doc.setFontSize(10)
        doc.setFont("helvetica", "italic")
        const timestamp = new Date().toLocaleString("pl-PL")
        doc.text(`Wygenerowano: ${timestamp}`, margin, yPosition)
        doc.text(
          `Użytkownik: ${selectedUser === "all" ? "Wszyscy" : selectedUser}`,
          margin,
          yPosition + 6,
        )
        yPosition += 14
      }

      doc.setDrawColor(200)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10

      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")
      doc.text("Lp.", margin, yPosition)
      doc.text("Data", margin + 10, yPosition)
      doc.text("Użytkownik", margin + 35, yPosition)
      doc.text("Utarg", margin + 75, yPosition)
      doc.text("Karta", margin + 100, yPosition)
      doc.text("KM", margin + 125, yPosition)
      doc.text("Paliwo", margin + 145, yPosition)

      yPosition += 5
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      filteredItems.forEach((item, index) => {
        checkNewPage(10)
        const dateStr = format(new Date(item.date), "dd.MM.yyyy")

        doc.text(`${index + 1}.`, margin, yPosition)
        doc.text(dateStr, margin + 10, yPosition)
        doc.text(item.user_name.substring(0, 15), margin + 35, yPosition)
        doc.text(`${item.amount.toFixed(2)}`, margin + 75, yPosition)
        doc.text(
          `${(item.cardAmount || 0).toFixed(2)}`,
          margin + 100,
          yPosition,
        )
        doc.text(`${(item.km || 0).toFixed(1)}`, margin + 125, yPosition)
        doc.text(`${(item.fuelCost || 0).toFixed(2)}`, margin + 145, yPosition)

        yPosition += 8
      })

      checkNewPage(20)
      yPosition += 5
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text(`Suma Utarg: ${totalAmount.toFixed(2)} PLN`, margin, yPosition)
      yPosition += 5
      doc.text(`Suma Karta: ${totalCard.toFixed(2)} PLN`, margin, yPosition)
      yPosition += 5
      doc.text(`Suma KM: ${totalKm.toFixed(1)}`, margin, yPosition)
      yPosition += 5
      doc.text(`Suma Paliwo: ${totalFuel.toFixed(2)} PLN`, margin, yPosition)

      const totalPages = doc.getNumberOfPages()
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setFont("helvetica", "italic")
        doc.text(
          `Strona ${i} z ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" },
        )
      }

      const fileName = `raport_transakcji_${selectedUser}_${Date.now()}.pdf`
      doc.save(fileName)

      setSuccess(`Pomyślnie wyeksportowano raport do pliku "${fileName}"`)
      setTimeout(() => setSuccess(null), 5000)
    } catch (err) {
      setError("Błąd podczas generowania PDF")
      console.error(err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className='w-full max-w-6xl mx-auto  space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='h-6 w-6' />
            Eksport Transakcji do PDF
          </CardTitle>
          <CardDescription>
            Przeglądaj i eksportuj transakcje z systemu
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertTitle>Błąd</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className='border-green-500 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200'>
              <CheckCircle2 className='h-4 w-4 text-green-500' />
              <AlertTitle>Sukces</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {dataLoaded && items.length === 0 ? (
            <Alert>
              <Info className='h-4 w-4' />
              <AlertTitle>Brak danych</AlertTitle>
              <AlertDescription>
                Brak zapisanych transakcji w systemie.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className='flex flex-wrap gap-4 items-end'>
                <div className='space-y-2 w-full md:w-64'>
                  <Label htmlFor='user-select'>Filtr użytkownika</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger id='user-select'>
                      <SelectValue placeholder='Wybierz użytkownika...' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>Wszyscy użytkownicy</SelectItem>
                      {availableUsers.map((user) => (
                        <SelectItem key={user} value={user}>
                          {user}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={loadRecords}
                  variant='outline'
                  className='mb-[2px] ml-auto'
                >
                  <RefreshCw className='h-4 w-4 mr-2' />
                  Odśwież dane
                </Button>
              </div>

              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-lg font-semibold'>
                    Podgląd ({filteredItems.length} pozycji):
                  </h3>
                </div>

                <Card className='bg-muted/50'>
                  <ScrollArea className='h-64 rounded-md p-4'>
                    {filteredItems.length > 0 ? (
                      <div className='space-y-2 text-sm font-mono'>
                        {filteredItems.map((item, i) => (
                          <div
                            key={i}
                            className='flex flex-col border-b border-border/50 pb-2 last:border-0 hover:bg-muted/80 px-2 py-2 rounded gap-1'
                          >
                            <div className='flex justify-between items-center'>
                              <span>
                                {i + 1}.{" "}
                                {format(new Date(item.date), "dd.MM.yyyy")} -{" "}
                                {item.user_name}
                              </span>
                              <span className='font-semibold'>
                                {item.amount.toFixed(2)} PLN
                              </span>
                            </div>
                            <div className='flex justify-between text-xs text-muted-foreground pl-4 pr-1'>
                              <span>
                                Karta: {(item.cardAmount || 0).toFixed(2)}
                              </span>
                              <span>KM: {item.km || 0}</span>
                              <span>
                                Paliwo: {(item.fuelCost || 0).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className='text-center py-10 text-muted-foreground'>
                        Brak wyników dla wybranego filtru
                      </div>
                    )}
                  </ScrollArea>
                </Card>

                <div className='flex justify-between items-center p-4 border rounded-lg bg-card'>
                  <div className='text-sm space-y-1'>
                    <div>
                      Suma Utarg:{" "}
                      <span className='font-bold'>
                        {filteredItems
                          .reduce((acc, curr) => acc + curr.amount, 0)
                          .toFixed(2)}{" "}
                        PLN
                      </span>
                    </div>
                    <div>
                      Suma Karta:{" "}
                      <span className='font-bold'>
                        {filteredItems
                          .reduce(
                            (acc, curr) => acc + (curr.cardAmount || 0),
                            0,
                          )
                          .toFixed(2)}{" "}
                        PLN
                      </span>
                    </div>
                    <div>
                      Suma KM:{" "}
                      <span className='font-bold'>
                        {filteredItems
                          .reduce((acc, curr) => acc + (curr.km || 0), 0)
                          .toFixed(1)}
                      </span>
                    </div>
                    <div>
                      Suma Paliwo:{" "}
                      <span className='font-bold'>
                        {filteredItems
                          .reduce((acc, curr) => acc + (curr.fuelCost || 0), 0)
                          .toFixed(2)}{" "}
                        PLN
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => generatePdf()}
                    disabled={isExporting || filteredItems.length === 0}
                    className='flex items-center gap-2'
                  >
                    {isExporting ? (
                      <RefreshCw className='h-4 w-4 animate-spin' />
                    ) : (
                      <Download className='h-4 w-4' />
                    )}
                    Eksportuj do PDF
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
