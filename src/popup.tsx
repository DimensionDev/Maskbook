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
            <main>
                <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    onClick={e => browser.runtime.openOptionsPage()}>
                    Open options
                </Button>
            </main>
        </ThemeProvider>
    )
}
