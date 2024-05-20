import { lazy, memo, Suspense, useState, type PropsWithChildren } from 'react'
import { Box, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import { Welcome } from '../../assets/index.js'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { Outlet } from 'react-router-dom'

const Spline = lazy(() => import('./spline.js'))
interface SetupFrameProps {
    hiddenSpline?: boolean
}

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        overflow: 'auto',
        minHeight: '100vh',
        backgroundColor: theme.palette.maskColor.bottom,
    },
    content: {
        background: theme.palette.maskColor.bottom,
        minWidth: 720,
        width: 'clamp(720px, 66.6667%, 66.666%)',
        paddingTop: '12.5vh',
        paddingBottom: '12.5vh',
        marginRight: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        [theme.breakpoints.up('lg')]: {
            marginLeft: 'clamp(40px, calc(66.6667% - 720px), 20%)',
        },
        [theme.breakpoints.down('lg')]: {
            marginLeft: 40,
            marginRight: 40,
        },
    },
    sidebar: {
        // 1024*0.3=307.2
        minWidth: 'clamp(307px, 33.333%, 33.333%)',
        flexShrink: 0,
    },
}))

export const SetupFrame = memo<SetupFrameProps>(function SetupFrame({ hiddenSpline }) {
    const { classes, theme } = useStyles()
    const [loading, setLoading] = useState(true)

    return (
        <Box className={classes.container}>
            <Box className={classes.content}>
                <header>
                    <Icons.MaskSquare width={168} height={48} />
                </header>

                <Box sx={{ paddingTop: 4.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Outlet />
                </Box>
            </Box>
            <Box className={classes.sidebar} position="relative">
                {!hiddenSpline ?
                    <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: '#d2deff' }}>
                        <Box position="absolute" marginTop={21.5} width="100%" display="flex" justifyContent="center">
                            <Typography
                                fontSize={36}
                                fontWeight={700}
                                lineHeight={1.2}
                                color={theme.palette.maskColor.publicMain}
                                display="flex"
                                width="70%"
                                justifyContent="center">
                                {/* Don't translate this slogan */}
                                The Web3 identity for everyone
                            </Typography>
                        </Box>

                        <Suspense>
                            <Spline scene={Welcome} onLoad={() => setLoading(false)} />
                        </Suspense>
                    </div>
                :   null}
                {loading && !hiddenSpline ?
                    <Box position="absolute" top="calc(50% - 18px)" left="calc(50% - 18px)">
                        <LoadingBase size={36} />
                    </Box>
                :   null}
            </Box>
        </Box>
    )
})

interface SetupFrameControllerProps extends PropsWithChildren {}
export const SetupFrameController = memo<SetupFrameControllerProps>(function SetupFrameController({ children }) {
    return (
        <Box marginTop="auto" py={3}>
            {children}
        </Box>
    )
})
