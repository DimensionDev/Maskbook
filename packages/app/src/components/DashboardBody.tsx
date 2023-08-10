import { memo } from "react"

export interface DashboardBodyProps {
    borderless?: boolean
    children?: React.ReactNode
}

export const DashboardBody = memo<DashboardBodyProps>(({ children, borderless = false }) => {
    if (borderless) {

    }
    return (<div className="bg-white dark:bg-black p-5 pt-0">
        {
            borderless ? children : <div className="border rounded-lg border-line-light dark:border-neutral-800 overflow-hidden">
                {children}
            </div>
        }
    </div>)
})