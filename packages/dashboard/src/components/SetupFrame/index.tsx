import { memo, useState, type PropsWithChildren, useEffect } from 'react'
import { Box, Grid, Typography, useTheme } from '@mui/material'
import { Icons } from '@masknet/icons'
import Spline from '@splinetool/react-spline'
import { Welcome } from '../../assets/index.js'
import { useDashboardI18N } from '../../locales/i18n_generated.js'
import { LoadingBase } from '@masknet/theme'
import { delay } from '@masknet/kit'

interface SetupFrameProps extends PropsWithChildren {
    hiddenSpline?: boolean
}

export const SetupFrame = memo<SetupFrameProps>(function SetupFrame({ children, hiddenSpline }) {
    const theme = useTheme()
    const t = useDashboardI18N()
    const [loading, setLoading] = useState(true)
    const [scene, setScene] = useState(Welcome.toString())

    /**
     * When resizing the window, the height of the react-spline component does not immediately adapt to the current window height.
     * Instead, it continuously decreases. The code is used to solve this problem.
     */
    useEffect(() => {
        const onResize = async () => {
            setScene('')
            await delay(200)
            setScene(Welcome.toString())
        }

        window.addEventListener('resize', onResize)
        return () => {
            window.removeEventListener('resize', onResize)
        }
    }, [])

    return (
        <Grid container sx={{ minHeight: '100vh', backgroundColor: (theme) => theme.palette.maskColor.bottom }}>
            <Grid item xs={8} paddingY={16} paddingLeft="20%" paddingRight={8} minHeight="896px">
                <header>
                    <Icons.MaskSquare width={168} height={48} />
                </header>

                <Box sx={{ paddingTop: 4.5, height: '100%', position: 'relative', paddingBottom: '116px' }}>
                    {children}
                </Box>
            </Grid>
            <Grid item xs={4} position="relative">
                {!hiddenSpline ? (
                    <>
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
                        <Spline style={{ maxHeight: '100%' }} scene={scene} onLoad={() => setLoading(false)} />
                    </>
                ) : null}
                {loading && !hiddenSpline ? (
                    <Box position="absolute" top="calc(50% - 18px)" left="calc(50% - 18px)">
                        <LoadingBase size={36} />
                    </Box>
                ) : null}
            </Grid>
        </Grid>
    )
})

interface SetupFrameControllerProps extends PropsWithChildren {}
export const SetupFrameController = memo<SetupFrameControllerProps>(function SetupFrameController({ children }) {
    return (
        <Box position="absolute" bottom="0" width="100%">
            {children}
        </Box>
    )
})
