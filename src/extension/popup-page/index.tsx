import '../../social-network-provider/popup-page/index'
import '../../setup.ui'
import React, { useState } from 'react'

import { ThemeProvider } from '@material-ui/styles'
import { MaskbookLightTheme } from '../../utils/theme'
import { makeStyles } from '@material-ui/core/styles'
import { Button, List } from '@material-ui/core'
import { SSRRenderer } from '../../utils/SSRRenderer'
import { debugModeSetting } from '../../components/shared-settings/settings'
import { useSettingsUI } from '../../components/shared-settings/createSettings'
import { ChooseIdentity } from '../../components/shared/ChooseIdentity'
import { getActivatedUI } from '../../social-network/ui'
import { useAsync } from '../../utils/components/AsyncComponent'
import { getUrl } from '../../utils/utils'
import { geti18nString } from '../../utils/i18n'

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

    const [showIdentitySelector, setShowIdentitySelector] = useState(false)
    setTimeout(() => {
        if (getActivatedUI().networkIdentifier !== 'localhost') setShowIdentitySelector(true)
    })

    return (
        <ThemeProvider theme={MaskbookLightTheme}>
            <style>{`body {
                overflow-x: hidden;
                margin: 0 auto;
                width: 30em;
                max-width: 100%;
            }`}</style>
            <main className={classes.container}>
                <img className={classes.logo} src={getUrl('/maskbook.svg')} />
                {showIdentitySelector ? <ChooseIdentity /> : null}
                <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    onClick={e => browser.runtime.openOptionsPage()}>
                    {geti18nString('popup_enter_dashboard')}
                </Button>
                <List>{useSettingsUI(debugModeSetting)}</List>
            </main>
        </ThemeProvider>
    )
}
