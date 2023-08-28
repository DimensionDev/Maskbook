import { memo, useState, type PropsWithChildren } from 'react'
import { Box, Typography } from '@mui/material'
import { Icons } from '@masknet/icons'
import Spline from '@splinetool/react-spline'
import { Welcome } from '../../assets/index.js'
import { useDashboardI18N } from '../../locales/i18n_generated.js'
import { LoadingBase, makeStyles } from '@masknet/theme'

interface SetupFrameProps extends PropsWithChildren {
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
        minWidth: 'clamp(720px, 66.6667%, 720px)',
        boxSizing: 'content-box',
        paddingTop: '12.5vh',
        paddingBottom: '12.5vh',
        paddingRight: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        [theme.breakpoints.up('lg')]: {
            paddingLeft: '20%',
        },
        [theme.breakpoints.down('lg')]: {
            paddingLeft: 40,
            paddingRight: 40,
        },
    },
    sidebar: {
        // 1024*0.3=307.2
        minWidth: 'clamp(307px, 33.333%, 33.333%)',
        flexShrink: 0,
    },
}))

export const SetupFrame = memo<SetupFrameProps>(function SetupFrame({ children, hiddenSpline }) {
    const { classes, theme } = useStyles()
    const t = useDashboardI18N()
    const [loading, setLoading] = useState(true)

    return (
        <Box className={classes.container}>
            <Box className={classes.content}>
                <header>
                    <Icons.MaskSquare width={168} height={48} />
                </header>

                <Box sx={{ paddingTop: 4.5, flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</Box>
            </Box>
            <Box className={classes.sidebar} position="relative">
                {!hiddenSpline ? (
                    <div style={{ position: 'absolute', width: '100%', height: '100%' }}>
                        <Box position="absolute" marginTop={21.5} width="100%" display="flex" justifyContent="center">
                            <Typography
                                fontSize={36}
                                fontWeight={700}
                                lineHeight={1.2}
                                color={theme.palette.maskColor.publicMain}
                                display="flex"
                                width="70%"
                                justifyContent="center">
                                {t.persona_setup_identity_tips()}
                            </Typography>
                        </Box>

                        <Spline scene={Welcome.toString()} onLoad={() => setLoading(false)} />
                    </div>
                ) : null}
                {loading && !hiddenSpline ? (
                    <Box position="absolute" top="calc(50% - 18px)" left="calc(50% - 18px)">
                        <LoadingBase size={36} />
                    </Box>
                ) : null}
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
