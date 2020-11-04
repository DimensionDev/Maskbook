import React from 'react'
import DashboardRouterContainer from './Container'
import { ThemeProvider, Theme, Drawer, IconButton } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
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
        <DashboardRouterContainer
            title="Maskbook"
            compact
            leftIcons={[
                <IconButton onClick={() => window.close()}>
                    <CloseIcon />
                </IconButton>,
            ]}>
            <ThemeProvider theme={navTheme}>{props.children}</ThemeProvider>
        </DashboardRouterContainer>
    )
}
