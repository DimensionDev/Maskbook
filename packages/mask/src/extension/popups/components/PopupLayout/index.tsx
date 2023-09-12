// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import { memo, useMemo, type PropsWithChildren } from 'react'
import { matchPath, Outlet, useLocation } from 'react-router-dom'
import { PopupRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { GlobalStyles, Paper } from '@mui/material'
import { Navigator } from '../Navigator/index.js'

const GlobalCss = (
    <GlobalStyles
        styles={{
            body: {
                width: 400,
                minWidth: 400,
                minHeight: 600,
                overflowX: 'hidden',
                margin: '0 auto !important',
                maxWidth: '100%',
                WebkitFontSmoothing: 'subpixel-antialiased',
                '&::-webkit-scrollbar': {
                    display: 'none',
                },
            },
            '[data-hide-scrollbar]': {
                '&::-webkit-scrollbar': {
                    display: 'none',
                },
            },
        }}
    />
)

const useStyles = makeStyles()((theme) => ({
    container: {
        height: '100%',
        minHeight: 600,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.maskColor.bottom,
    },
    body: {
        flexGrow: 1,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
    },
    navigator: {
        flexShrink: 0,
        flexGrow: 0,
    },
}))

const PATTERNS = [
    PopupRoutes.Personas,
    PopupRoutes.Wallet,
    PopupRoutes.Unlock,
    PopupRoutes.SetPaymentPassword,
    PopupRoutes.Friends,
    PopupRoutes.Settings,
]

export const PopupLayout = memo(function PopupLayout({ children }: PropsWithChildren<{}>) {
    const { classes } = useStyles()

    const location = useLocation()
    const matched = PATTERNS.some((pattern) => matchPath(pattern, location.pathname))
    const outletContext = useMemo(() => ({ hasNavigator: matched }), [matched])

    return (
        <>
            {GlobalCss}
            <Paper elevation={0} sx={{ height: '100vh', overflowY: 'auto', minHeight: 600, borderRadius: 0 }}>
                <div className={classes.container}>
                    <div className={classes.body} data-hide-scrollbar>
                        {children ?? <Outlet context={outletContext} />}
                    </div>
                    {matched ? <Navigator className={classes.navigator} /> : null}
                </div>
            </Paper>
        </>
    )
})
