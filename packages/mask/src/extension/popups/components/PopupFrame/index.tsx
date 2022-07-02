// ! This file is used during SSR. DO NOT import new files that does not work in SSR

import { memo } from 'react'
import { Box, GlobalStyles, Paper } from '@mui/material'
import { makeStyles } from '@masknet/theme'

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

    return (
        <>
            <GlobalCss />
            <Paper elevation={0} style={{ height: '100vh', overflowY: 'auto', minHeight: 560, borderRadius: 0 }}>
                <Box className={classes.container}>{props.children}</Box>
            </Paper>
        </>
    )
})
