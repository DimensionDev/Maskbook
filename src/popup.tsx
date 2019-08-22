import React from 'react'
import ReactDOM from 'react-dom'

import { ThemeProvider } from '@material-ui/styles'
import { MaskbookLightTheme } from './utils/theme'
import { geti18nString } from './utils/i18n'
import { makeStyles, useTheme, Theme, createStyles } from '@material-ui/core/styles'
import { Button } from '@material-ui/core'
import { uiSetup } from './setup'

uiSetup()
const useStyles = makeStyles(theme => ({
    button: {
        margin: theme.spacing(1),
        whiteSpace: 'nowrap',
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
    },
    logo: {
        width: 'auto',
        height: '54px',
        margin: '0 1rem -10px',
    },
    input: {
        display: 'none',
    },
}))

ReactDOM.render(<Popup />, document.getElementById('root')!)
function Popup() {
    const classes = useStyles()
    const theme = useTheme()

    return (
        <ThemeProvider theme={MaskbookLightTheme}>
            <style>{'body {overflow-x: hidden; margin: 0 auto;}'}</style>
            <main className={classes.container}>
                <img className={classes.logo} src="https://maskbook.com/img/maskbook--logotype-blue.png" />
                <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    onClick={e => browser.runtime.openOptionsPage()}>
                    Options
                </Button>
            </main>
        </ThemeProvider>
    )
}
