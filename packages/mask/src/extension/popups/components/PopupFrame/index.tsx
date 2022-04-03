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
                    '-webkit-font-smoothing': 'subpixel-antialiased',
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
        minHeight: 550,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        padding: '0 10px',
        backgroundColor: theme.palette.primary.main,
        height: 50,
        display: 'flex',
        justifyContent: 'space-between',
    },
    left: {
        display: 'flex',
        alignItems: 'center',
    },
    right: {
        display: 'flex',
        paddingTop: 6,
    },
    nav: {
        width: 86,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        fontSize: 16,
        fontWeight: 500,
        color: theme.palette.primary.contrastText,
        textDecoration: 'none',
        borderRadius: '4px 4px 0px 0px',
    },
    active: {
        color: theme.palette.primary.main,
        cursor: 'inherit',
        backgroundColor: '#ffffff',
    },
}))

export interface PopupFrameProps extends React.PropsWithChildren<{}> {}

export const PopupFrame = memo<PopupFrameProps>((props) => {
    const { classes } = useStyles()
    const personas = useMyPersonas()

    const matchRecovery = [
        useMatch(PopupRoutes.WalletRecovered),
        useMatch(PopupRoutes.Unlock),
    ].some(Boolean)

    return (
        <>
            <GlobalCss />
            <Paper elevation={0} style={{ height: '100vh', overflowY: 'auto', minHeight: 600, borderRadius: 0 }}>
                <Box className={classes.container}>
                    {personas.length === 0 && !matchRecovery ? <InitialPlaceholder /> : props.children}
                </Box>
            </Paper>
        </>
    )
})
