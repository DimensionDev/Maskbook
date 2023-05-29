import { memo, type PropsWithChildren } from 'react'
import { Box, Grid } from '@mui/material'
import { Icons } from '@masknet/icons'
import Spline from '@splinetool/react-spline'
import { Welcome } from '../../assets/index.js'

interface WelcomeFrameProps extends PropsWithChildren {
    controller: React.ReactNode
}

export const WelcomeFrame = memo<WelcomeFrameProps>(({ children, controller }) => {
    return (
        <Grid container sx={{ minHeight: '100vh' }}>
            <Grid
                item
                xs={8}
                paddingY={16}
                paddingLeft="20%"
                paddingRight={8}
                display="flex"
                flexDirection="column"
                justifyContent="space-between">
                <Box>
                    <header>
                        <Icons.MaskSquare width={168} height={48} />
                    </header>

                    <main style={{ paddingTop: 36 }}>{children}</main>
                </Box>
                <Box>{controller}</Box>
            </Grid>
            <Grid item xs={4}>
                <Spline scene={Welcome.toString()} />
            </Grid>
        </Grid>
    )
})
