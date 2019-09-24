import '../../setup.ui'
import React from 'react'

import { ThemeProvider } from '@material-ui/styles'
import { MaskbookLightTheme } from '../../utils/theme'
import { makeStyles } from '@material-ui/core/styles'
import { Button, ListItem, ListItemText, ListItemSecondaryAction, Switch, List } from '@material-ui/core'
import { SSRRenderer } from '../../utils/SSRRenderer'
import { useValueRef } from '../../utils/hooks/useValueRef'
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
    const debugOn = useValueRef(debugModeSetting)

    return (
        <ThemeProvider theme={MaskbookLightTheme}>
            <style>{`
    body {
        overflow-x: hidden;
        margin: 0 auto;
        min-width: 30em;
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
