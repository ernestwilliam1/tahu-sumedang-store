import * as React from "react"
import { cn } from "@/lib/utils"
function Item({ className, ...props }: React.ComponentProps<"div">){ return <div data-slot="item" className={cn("group/item flex items-center border border-[#E5E2DC] bg-white p-4 rounded-xl hover:border-[#D6D3D1] transition", className)} {...props} /> }
function ItemMedia({ className, variant="default", ...props }: React.ComponentProps<"div"> & { variant?: "default"|"image"|"icon"}){
  return <div data-slot="item-media" data-variant={variant} className={cn("flex shrink-0 items-center justify-center gap-2", variant==="image"?"size-10 overflow-hidden rounded-lg border border-[#E5E2DC]":"", className)} {...props}/>
}
function ItemContent({ className, ...props }: React.ComponentProps<"div">){ return <div data-slot="item-content" className={cn("flex flex-1 flex-col gap-1 min-w-0", className)} {...props}/>}
function ItemTitle({ className, ...props }: React.ComponentProps<"div">){ return <div data-slot="item-title" className={cn("text-xs font-bold text-[#1C1917]", className)} {...props}/>}
function ItemDescription({ className, ...props }: React.ComponentProps<"p">){ return <p data-slot="item-description" className={cn("text-[11px] text-[#78716C]", className)} {...props}/>}
function ItemActions({ className, ...props }: React.ComponentProps<"div">){ return <div data-slot="item-actions" className={cn("flex items-center gap-2 shrink-0", className)} {...props}/>}
export { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription, ItemActions }
