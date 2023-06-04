import { memo, type PropsWithChildren } from 'react'
import { Box, Grid } from '@mui/material'
import { Icons } from '@masknet/icons'
import Spline from '@splinetool/react-spline'
import { Welcome } from '../../assets/index.js'

interface SetupFrameProps extends PropsWithChildren {
    hiddenSpline?: boolean
}

export const SetupFrame = memo<SetupFrameProps>(({ children, hiddenSpline }) => {
    return (
        <Grid container sx={{ minHeight: '100vh', backgroundColor: (theme) => theme.palette.maskColor.bottom }}>
            <Grid item xs={8} paddingY={16} paddingLeft="20%" paddingRight={8}>
                <header>
                    <Icons.MaskSquare width={168} height={48} />
                </header>

                <main style={{ paddingTop: 36, height: '100%', position: 'relative' }}>{children}</main>
            </Grid>
            <Grid item xs={4}>
                {!hiddenSpline ? <Spline scene={Welcome.toString()} /> : null}
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
