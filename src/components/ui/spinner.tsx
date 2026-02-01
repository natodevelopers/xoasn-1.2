import { Ring } from 'ldrs/react'
import 'ldrs/react/Ring.css'

import { cn } from "@/lib/utils"

function Spinner({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("inline-flex", className)} {...props}>
      <Ring
        size="16"
        stroke="2"
        bgOpacity="0"
        speed="2"
        color="currentColor" 
      />
    </div>
  )
}

export { Spinner }
