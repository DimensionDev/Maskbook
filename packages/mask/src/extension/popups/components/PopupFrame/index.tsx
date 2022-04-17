import { memo } from 'react'
import { useMatch } from 'react-router-dom'
import { Box, GlobalStyles, Paper } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { PopupRoutes } from '@masknet/shared-base'
import { useMyPersonas } from '../../../../components/DataSource/useMyPersonas'
import { InitialPlaceholder } from '../InitialPlaceholder'

function GlobalCss() {
    return (
        <GlobalStyles
            styles={{
                body: {
                    minWidth: 350,
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
}

const useStyles = makeStyles()((theme) => ({
    container: {
        height: '100%',
        minHeight: 560,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
    },
}))

export interface PopupFrameProps extends React.PropsWithChildren<{}> {}

export const PopupFrame = memo<PopupFrameProps>((props) => {
    const { classes } = useStyles()
    const personas = useMyPersonas()

    const matchRecovery = [useMatch(PopupRoutes.WalletRecovered), useMatch(PopupRoutes.Unlock)].some(Boolean)

    return (
        <>
            <GlobalCss />
            <Paper elevation={0} style={{ height: '100vh', overflowY: 'auto', minHeight: 560, borderRadius: 0 }}>
                <Box className={classes.container}>
                    {personas.length === 0 && !matchRecovery ? <InitialPlaceholder /> : props.children}
                </Box>
            </Paper>
        </>
    )
})
