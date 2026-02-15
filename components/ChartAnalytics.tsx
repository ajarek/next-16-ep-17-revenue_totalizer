"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { useRecordsStore } from "@/store/recordsStore"
import { useCurrentUserStore } from "@/store/currentUserStore"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

export const description = "An interactive bar chart"

const chartConfig = {
  desktop: {
    label: "Kwota",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

const ChartAnalytics = () => {
  const items = useRecordsStore((state) => state.items)
  const currentUser = useCurrentUserStore((state) => state.currentUser)

  const records = React.useMemo(() => {
    return items.filter(
      (item) =>
        currentUser?.name === "User" ||
        item.user_name === "User" ||
        item.user_name === currentUser?.name,
    )
  }, [items, currentUser])

  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("desktop")

  const total = React.useMemo(
    () => ({
      desktop: records.reduce((acc, curr) => acc + curr.amount, 0),
    }),
    [records],
  )
  const chartData = React.useMemo(() => {
    // Group records by date and sum amounts
    const grouped = records.reduce(
      (acc, curr) => {
        const date = new Date(curr.date).toLocaleDateString("en-CA") // YYYY-MM-DD
        if (!acc[date]) {
          acc[date] = 0
        }
        acc[date] += curr.amount
        return acc
      },
      {} as Record<string, number>,
    )

    // Convert to array and sort by date
    return Object.entries(grouped)
      .map(([date, amount]) => ({
        date,
        desktop: amount,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [records])
  return (
    <Card className='w-full  py-8'>
      <CardHeader className='flex flex-col items-stretch border-b sm:flex-row'>
        <div className='flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3'>
          <CardTitle>Wykres przychodów</CardTitle>
          <CardDescription>
            Wyświetlanie sumy transakcji z podziałem na dni
          </CardDescription>
        </div>
        <div className='flex'>
          {["desktop"].map((key) => {
            const chart = key as keyof typeof chartConfig
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className='data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6'
                onClick={() => setActiveChart(chart)}
              >
                <span className='text-muted-foreground text-xs'>
                  {chartConfig[chart].label}
                </span>
                <span className='text-lg leading-none font-bold sm:text-3xl'>
                  {total[key as keyof typeof total].toLocaleString("pl-PL", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className='px-2 sm:p-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("pl-PL", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className='w-[150px]'
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("pl-PL", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  }}
                />
              }
            />
            <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default ChartAnalytics
