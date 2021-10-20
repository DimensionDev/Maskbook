import DashboardRouterContainer from './Container'
import { ThemeProvider, Theme } from '@mui/material'
const navTheme = (theme: Theme): Theme => theme

export interface DashboardNavRouterProps {
    children?: React.ReactNode
}

export default function DashboardNavRouter(props: DashboardNavRouterProps) {
    return (
        <DashboardRouterContainer title="Mask" compact>
            <ThemeProvider theme={navTheme}>{props.children}</ThemeProvider>
        </DashboardRouterContainer>
    )
}
