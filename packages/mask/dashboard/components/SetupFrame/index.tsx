import { Icons } from '@masknet/icons'
import { LoadingBase, makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { lazy, memo, Suspense, useState, type PropsWithChildren } from 'react'
import { Outlet } from 'react-router-dom'
import { Welcome } from '../../assets/index.js'

const Spline = lazy(() => import('./spline.js'))
interface SetupFrameProps {
    hiddenSpline?: boolean
}

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        overflow: 'auto',
        minHeight: '100vh',
        backgroundColor: theme.vars.palette.maskColor.bottom,
    },
    content: {
        background: theme.vars.palette.maskColor.bottom,
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
            <Box className={classes.sidebar} sx={{ position: 'relative' }}>
                {hiddenSpline ? null : (
                    <div style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: '#d2deff' }}>
                        <Box
                            sx={{
                                position: 'absolute',
                                marginTop: 21.5,
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                            }}>
                            <Typography
                                color={theme.vars.palette.maskColor.publicMain}
                                sx={{
                                    fontSize: 36,
                                    fontWeight: 700,
                                    lineHeight: 1.2,
                                    display: 'flex',
                                    width: '70%',
                                    justifyContent: 'center',
                                }}>
                                {/* Don't translate this slogan */}
                                The Web3 identity for everyone
                            </Typography>
                        </Box>

                        <Suspense>
                            <Spline scene={Welcome} onLoad={() => setLoading(false)} />
                        </Suspense>
                    </div>
                )}
                {loading && !hiddenSpline ?
                    <Box sx={{ position: 'absolute', top: 'calc(50% - 18px)', left: 'calc(50% - 18px)' }}>
                        <LoadingBase size={36} />
                    </Box>
                :   null}
            </Box>
        </Box>
    )
})

interface SetupFrameControllerProps extends PropsWithChildren {}
export const SetupFrameController = memo<SetupFrameControllerProps>(function SetupFrameController({ children }) {
    return <Box sx={{ marginTop: 'auto', py: 3 }}>{children}</Box>
})
