"use client"
import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: { label?: React.ReactNode; icon?: React.ComponentType; color?: string; theme?: Record<keyof typeof THEMES, string> }
}

type ChartContextProps = { config: ChartConfig }
const ChartContext = React.createContext<ChartContextProps | null>(null)
function useChart(){ const c=React.useContext(ChartContext); if(!c) throw new Error("useChart in ChartContainer"); return c }

const ChartContainer = React.forwardRef<HTMLDivElement, React.ComponentProps<"div"> & { config: ChartConfig; id?: string }>(
  ({ id, className, children, config, ...props }, ref) => {
    const uniqueId = React.useId()
    const chartId = `chart-${id || uniqueId.replace(/:/g,"")}`
    return (
      <ChartContext.Provider value={{ config }}>
        <div data-chart={chartId} ref={ref} className={cn("[&_.recharts-cartesian-grid_h_line]:stroke-[#E5E2DC] [&_.recharts-cartesian-grid_v_line]:stroke-[#E5E2DC] flex justify-center text-xs", className)} {...props}>
          <RechartsPrimitive.ResponsiveContainer>{children as any}</RechartsPrimitive.ResponsiveContainer>
        </div>
      </ChartContext.Provider>
    )
  }
)
ChartContainer.displayName="Chart"

const ChartTooltip = RechartsPrimitive.Tooltip
const ChartTooltipContent = React.forwardRef<HTMLDivElement, any>(({ active, payload, className, hideLabel, label, indicator="dot", ...props }, ref)=>{
  if(!active || !payload?.length) return null
  return <div ref={ref} className={cn("rounded-xl border border-[#E5E2DC] bg-white px-3 py-2 shadow-md text-xs", className)}><div>{label}</div><div>{payload.map((p:any)=><div key={p.dataKey}>{p.value}</div>)}</div></div>
})
ChartTooltipContent.displayName="ChartTooltipContent"
const ChartLegend = RechartsPrimitive.Legend
const ChartLegendContent = React.forwardRef<HTMLDivElement, any>(({ className, ...props }, ref)=><div ref={ref} className={cn("flex items-center justify-center gap-4", className)} {...props}/>)
ChartLegendContent.displayName="ChartLegendContent"
export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent }
