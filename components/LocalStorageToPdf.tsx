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

// Types
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

  // Load records from localStorage
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
        // Zustand persist stores data in { state: { items: [] }, version: 0 }
        if (parsed && parsed.state && Array.isArray(parsed.state.items)) {
          parsedItems = parsed.state.items
        } else if (Array.isArray(parsed)) {
          // Fallback if stored differently
          parsedItems = parsed
        }
      } catch (e) {
        console.error("Failed to parse records", e)
        setError("Błąd formatu danych w localStorage")
        return
      }

      setItems(parsedItems)

      // Extract unique users
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

  // Filter items when selection or items change
  useEffect(() => {
    if (!dataLoaded) return

    let filtered = [...items]

    if (selectedUser !== "all") {
      filtered = filtered.filter((item) => item.user_name === selectedUser)
    }

    // Sort by date (oldest first)
    filtered.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    )

    setFilteredItems(filtered)
  }, [items, selectedUser, dataLoaded])

  // Initial load
  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  // Generate PDF
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

      // Helper function to add new page if needed
      const checkNewPage = (requiredSpace: number) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          doc.addPage()
          yPosition = margin
        }
      }

      // Calculate total
      const total = filteredItems.reduce((sum, item) => sum + item.amount, 0)

      // Title
      doc.setFontSize(18)
      doc.setFont("helvetica", "bold")
      doc.text(title, margin, yPosition)
      yPosition += 10

      // Timestamp & Context
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

      // Separator line
      doc.setDrawColor(200)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10

      // Table Header
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("Lp.", margin, yPosition)
      doc.text("Data", margin + 15, yPosition)
      doc.text("Użytkownik", margin + 50, yPosition)
      doc.text("Kwota", margin + 120, yPosition)

      yPosition += 5
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10

      // List Items
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")

      filteredItems.forEach((item, index) => {
        checkNewPage(10)
        const dateStr = format(new Date(item.date), "dd.MM.yyyy")

        doc.text(`${index + 1}.`, margin, yPosition)
        doc.text(dateStr, margin + 15, yPosition)
        doc.text(item.user_name, margin + 50, yPosition)
        doc.text(`${item.amount.toFixed(2)} PLN`, margin + 120, yPosition)

        yPosition += 8
      })

      // Summary
      checkNewPage(20)
      yPosition += 5
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text(`Suma całkowita: ${total.toFixed(2)} PLN`, margin, yPosition)

      // Footer
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
    <div className='w-full max-w-4xl mx-auto p-6 space-y-6'>
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
          {/* Alerts */}
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
              {/* Controls */}
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

              {/* Data Preview */}
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
                            className='flex justify-between border-b border-border/50 pb-1 last:border-0 hover:bg-muted/80 px-2 py-1 rounded'
                          >
                            <span>
                              {i + 1}.{" "}
                              {format(new Date(item.date), "dd.MM.yyyy")} -{" "}
                              {item.user_name}
                            </span>
                            <span className='font-semibold'>
                              {item.amount.toFixed(2)} PLN
                            </span>
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

                {/* Footer / Summary */}
                <div className='flex justify-between items-center p-4 border rounded-lg bg-card'>
                  <div className='font-bold text-lg'>
                    Suma:{" "}
                    {filteredItems
                      .reduce((acc, curr) => acc + curr.amount, 0)
                      .toFixed(2)}{" "}
                    PLN
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
