import React from 'react'

import { ThemeProvider } from '@material-ui/styles'
import { MaskbookLightTheme } from '../../utils/theme'
import { makeStyles } from '@material-ui/core/styles'
import { Button, ListItem, ListItemText, ListItemSecondaryAction, Switch, List } from '@material-ui/core'
import '../../setup.ui'
import { SSRRenderer } from '../../utils/SSRRenderer'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { debugModeSetting } from '../../components/shared-settings/debugMode'

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
                <List>
                    <ListItem>
                        <ListItemText
                            id="settings-debug"
                            primary="Enable debug mode"
                            secondary="Enable this will display additional information on the Maskbook UI to help debugging"
                        />
                        <ListItemSecondaryAction>
                            <Switch
                                inputProps={{ 'aria-labelledby': 'settings-debug' }}
                                edge="end"
                                checked={debugOn}
                                onChange={(e, newValue) => (debugModeSetting.value = newValue)}
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                </List>
            </main>
        </ThemeProvider>
    )
}
