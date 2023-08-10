import { memo } from 'react'
import { classNames } from '../helpers/classNames.js'

export interface DashboardBodyProps {
    borderless?: boolean
    clipEdge?: boolean
    children?: React.ReactNode
}

export const DashboardBody = memo<DashboardBodyProps>(({ children, borderless = false, clipEdge = true }) => {
    return (
        <div className="bg-white dark:bg-black p-5 pt-0">
            {borderless ? (
                children
            ) : (
                <div
                    className={classNames('border rounded-lg border-line-light dark:border-neutral-800', {
                        'overflow-hidden': clipEdge,
                    })}>
                    {children}
                </div>
            )}
        </div>
    )
})
