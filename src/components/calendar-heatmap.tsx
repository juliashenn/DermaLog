"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

// type utilities
type UnionKeys<T> = T extends T ? keyof T : never
type Expand<T> = T extends T ? { [K in keyof T]: T[K] } : never
type OneOf<T extends {}[]> = {
  [K in keyof T]: Expand<
    T[K] & Partial<Record<Exclude<UnionKeys<T[number]>, keyof T[K]>, never>>
  >
}[number]

// types
export type Classname = string
export type WeightedDateEntry = {
  date: Date
  weight: number
}

interface IDatesPerVariant {
  datesPerVariant: Date[][]
}
interface IWeightedDatesEntry {
  weightedDates: WeightedDateEntry[]
}

type VariantDatesInput = OneOf<[IDatesPerVariant, IWeightedDatesEntry]>

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  variantClassnames: Classname[]
} & VariantDatesInput

/// utlity functions
function useModifers(
  variantClassnames: Classname[],
  datesPerVariant: Date[][]
): [Record<string, Date[]>, Record<string, string>] {
  const noOfVariants = variantClassnames.length

  const variantLabels = [...Array(noOfVariants)].map(
    (_, idx) => `__variant${idx}`
  )

  const modifiers = variantLabels.reduce((acc, key, index) => {
    acc[key] = datesPerVariant[index]
    return acc
  }, {} as Record<string, Date[]>)

  const modifiersClassNames = variantLabels.reduce((acc, key, index) => {
    acc[key] = variantClassnames[index]
    return acc
  }, {} as Record<string, string>)

  return [modifiers, modifiersClassNames]
}

function categorizeDatesPerVariant(
  weightedDates: WeightedDateEntry[],
  noOfVariants: number
) {
  const sortedEntries = weightedDates.sort((a, b) => a.weight - b.weight)

  const categorizedRecord = [...Array(noOfVariants)].map(() => [] as Date[])

  const minNumber = sortedEntries[0].weight
  const maxNumber = sortedEntries[sortedEntries.length - 1].weight
  const range = minNumber == maxNumber ? 1 : (maxNumber - minNumber) / noOfVariants;

  sortedEntries.forEach((entry) => {
    const category = Math.min(
      Math.floor((entry.weight - minNumber) / range),
      noOfVariants - 1
    )
    categorizedRecord[category].push(entry.date)
  })

  return categorizedRecord
}

function CalendarHeatmap({
  variantClassnames,
  datesPerVariant,
  weightedDates,
  className,
  classNames,
  showOutsideDays = true,
  month: controlledMonth,
  onMonthChange,
  ...props
}: CalendarProps) {
  const noOfVariants = variantClassnames.length

  // Use internal state for month navigation
  const [displayMonth, setDisplayMonth] = React.useState<Date>(() => 
    controlledMonth || new Date()
  )

  // Update internal state when controlled month changes
  React.useEffect(() => {
    if (controlledMonth) {
      setDisplayMonth(controlledMonth)
    }
  }, [controlledMonth])

  weightedDates = weightedDates ?? []
  datesPerVariant =
    datesPerVariant ?? categorizeDatesPerVariant(weightedDates, noOfVariants)

  const [modifiers, modifiersClassNames] = useModifers(
    variantClassnames,
    datesPerVariant
  )

  // Handle month changes
  const handleMonthChange = React.useCallback((newMonth: Date) => {
    setDisplayMonth(newMonth)
    onMonthChange?.(newMonth)
  }, [onMonthChange])

  return (
    <DayPicker
      month={displayMonth}
      onMonthChange={handleMonthChange}
      numberOfMonths={1}
      modifiers={modifiers}
      modifiersClassNames={modifiersClassNames}
      showOutsideDays={showOutsideDays}
      className={cn("p-3 relative", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4 relative",

        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-center",

        nav: "flex justify-center items-center space-x-46 absolute top-4 right-1/5 w-full z-10",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 flex items-center justify-center"
        ),
        nav_button_previous: "",
        nav_button_next: "",

        table: "w-full",
        weekdays: "flex justify-center",
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",

        week: "flex justify-center w-full mt-2",
        cell:
          "flex justify-center items-center h-9 w-9 text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),

        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: (props) => {
          if (props.orientation === "left") {
            return <ChevronLeft className="h-4 w-4" {...props} />
          }
          return <ChevronRight className="h-4 w-4" {...props} />
        },
      }}
      {...props}
    />
  )
}
CalendarHeatmap.displayName = "CalendarHeatmap"

export { CalendarHeatmap }