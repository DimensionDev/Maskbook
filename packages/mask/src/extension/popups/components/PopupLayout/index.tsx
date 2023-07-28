// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import { PopupRoutes } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { GlobalStyles, Paper } from '@mui/material'
import { memo, type PropsWithChildren } from 'react'
import { matchPath, Outlet, useLocation } from 'react-router-dom'
import { Navigator } from '../Navigator/index.js'

const GlobalCss = (
    <GlobalStyles
        styles={{
            body: {
                width: 400,
                overflowX: 'hidden',
                margin: '0 auto !important',
                maxWidth: '100%',
                WebkitFontSmoothing: 'subpixel-antialiased',
                '&::-webkit-scrollbar': {
                    display: 'none',
                },
            },
        }}
    />
)

const useStyles = makeStyles()({
    container: {
        height: '100%',
        minHeight: 600,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
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
})

const PATTERNS = [
    PopupRoutes.Personas,
    PopupRoutes.Wallet,
    PopupRoutes.Unlock,
    PopupRoutes.WalletSettings,
    PopupRoutes.SetPaymentPassword,
    PopupRoutes.Friends,
]

export const PopupLayout = memo(function PopupLayout({ children }: PropsWithChildren<{}>) {
    const { classes } = useStyles()

    const location = useLocation()
    const matched = PATTERNS.some((pattern) => matchPath(pattern, location.pathname))

    return (
        <>
            {GlobalCss}
            <Paper elevation={0} style={{ height: '100vh', overflowY: 'auto', minHeight: 600, borderRadius: 0 }}>
                <div className={classes.container}>
                    <div className={classes.body}>{children ?? <Outlet />}</div>
                    {matched ? <Navigator className={classes.navigator} /> : null}
                </div>
            </Paper>
        </>
    )
})
