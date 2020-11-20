import DashboardRouterContainer from './Container'
import { ThemeProvider, Theme } from '@material-ui/core'
import { merge, cloneDeep } from 'lodash-es'

const navTheme = (theme: Theme): Theme =>
    merge(cloneDeep(theme), {
        overrides: {},
    })

export interface DashboardNavRouterProps {
    children?: React.ReactNode
}

export default function DashboardNavRouter(props: DashboardNavRouterProps) {
    return (
        <DashboardRouterContainer title="Maskbook" compact>
            <ThemeProvider theme={navTheme}>{props.children}</ThemeProvider>
        </DashboardRouterContainer>
    )
}
