import { memo, useMemo, type PropsWithChildren, lazy, Suspense } from 'react'
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

const useStyles = makeStyles<{ hasNav: boolean }>()((theme, { hasNav }) => ({
    container: {
        height: '100%',
        minHeight: 600,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.maskColor.bottom,
        position: 'relative',
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
        position: 'absolute',
        bottom: 0,
        zIndex: 9999,
    },
}))

const PATTERNS = [PopupRoutes.Personas, PopupRoutes.Wallet, PopupRoutes.Friends, PopupRoutes.Settings]

const LoadMaskSDK = lazy(() => import('./LoadMaskSDK.js'))

export const PopupLayout = memo(function PopupLayout({ children }: PropsWithChildren<{}>) {
    const location = useLocation()
    const matched = PATTERNS.some((pattern) => matchPath(pattern, location.pathname))
    const outletContext = useMemo(() => ({ hasNavigator: matched }), [matched])

    const { classes } = useStyles({ hasNav: matched })

    return (
        <>
            {GlobalCss}
            <Paper elevation={0} sx={{ height: '100vh', overflowY: 'auto', minHeight: 600, borderRadius: 0 }}>
                <div className={classes.container} data-hide-scrollbar>
                    <div className={classes.body} data-hide-scrollbar>
                        {children ?? <Outlet context={outletContext} />}
                    </div>
                    <Suspense fallback={null}>{matched ? <LoadMaskSDK /> : null}</Suspense>
                    {matched ? <Navigator className={classes.navigator} /> : null}
                </div>
            </Paper>
        </>
    )
})
