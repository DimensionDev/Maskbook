export interface DashboardHeaderProps {
    title: string
}

export function DashboardHeader(props: DashboardHeaderProps) {
    const { title } = props
    return (
        <header className="flex items-center justify-between px-4 sm:px-6 sm:py-6 lg:py-8 lg:px-8">
            <h1 className="text-3xl font-semibold leading-7 dark:text-white text-black">{title}</h1>
        </header>
    )
}
