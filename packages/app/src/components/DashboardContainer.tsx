export interface DashboardContainerProps {
    children: React.ReactNode
}

export function DashboardContainer(props: DashboardContainerProps) {
    const { children } = props
    return <div className="xl:pl-72">{children}</div>
}
