import { CalendarHeatmap } from "@/components/calendar-heatmap";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

const HeatmapDatesWeight = [1, 1, 1, 1]

export function randomDate(start: Date, end: Date) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  )
}

export function currentMonthFirstDate() {
  const date = new Date()
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function currentMonthLastDate(month: number = 1) {
  const date = new Date()
  return new Date(date.getFullYear(), date.getMonth() + month, 0)
}

  export default function DashboardPage() {
  return (
    <div>
        <h1>new entry</h1>
        <div >
        <CalendarHeatmap
            month={currentMonthFirstDate()}
            variantClassnames={["text-white hover:text-white bg-blue-300 hover:bg-blue-300"]}
            weightedDates={HeatmapDatesWeight.map((wgt) => ({
                date: randomDate(currentMonthFirstDate(), currentMonthLastDate()),
                weight: wgt,
            }))}
        />
        </div>
    </div>
  );
}