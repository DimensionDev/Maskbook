import '../../setup.ui'
import React from 'react'

import { ThemeProvider } from '@material-ui/styles'
import { MaskbookLightTheme } from '../../utils/theme'
import { makeStyles } from '@material-ui/core/styles'
import { Button, List } from '@material-ui/core'
import { SSRRenderer } from '../../utils/SSRRenderer'
import { debugModeSetting } from '../../components/shared-settings/settings'
import { useSettingsUI } from '../../components/shared-settings/createSettings'

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
        height: '32px',
        margin: '20px auto',
    },
    input: {
        display: 'none',
    },
}))

SSRRenderer(<Popup />)
export function Popup() {
    const classes = useStyles()

    return (
        <ThemeProvider theme={MaskbookLightTheme}>
            <style>{`body {
                overflow-x: hidden;
                margin: 0 auto;
                width: 30em;
                max-width: 100%;
            }`}</style>
            <main className={classes.container}>
                <img className={classes.logo} src="https://dimensiondev.github.io/Maskbook-VI/MB--Text--Blue.svg" />
                <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    onClick={e => browser.runtime.openOptionsPage()}>
                    Options
                </Button>
                <List>{useSettingsUI(debugModeSetting)}</List>
            </main>
        </ThemeProvider>
    )
}
