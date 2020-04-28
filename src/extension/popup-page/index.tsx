import '../../social-network-provider/popup-page/index'
import '../../setup.ui'
import React, { useState } from 'react'

import { ThemeProvider } from '@material-ui/styles'
import { MaskbookLightTheme } from '../../utils/theme'
import { makeStyles } from '@material-ui/core/styles'
import { Button, List } from '@material-ui/core'
import { SSRRenderer } from '../../utils/SSRRenderer'
import { debugModeSetting, disableOpenNewTabInBackgroundSettings } from '../../components/shared-settings/settings'
import { SettingsUI } from '../../components/shared-settings/useSettingsUI'
import { ChooseIdentity } from '../../components/shared/ChooseIdentity'
import { getActivatedUI } from '../../social-network/ui'
import { getUrl } from '../../utils/utils'
import { I18nextProvider } from 'react-i18next'
import { useI18N } from '../../utils/i18n-next-ui'
import i18nNextInstance from '../../utils/i18n-next'

const useStyles = makeStyles((theme) => ({
    button: {
        margin: theme.spacing(1, 0),
        whiteSpace: 'nowrap',
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        padding: theme.spacing(0, 2),
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

const useSettingsUIStyles = makeStyles((theme) => ({
    secondaryAction: {
        paddingRight: theme.spacing(6),
    },
}))

SSRRenderer(
    <ThemeProvider theme={MaskbookLightTheme}>
        <I18nextProvider i18n={i18nNextInstance}>
            <Popup />
        </I18nextProvider>
    </ThemeProvider>,
)
export function Popup() {
    const { t } = useI18N()
    const classes = useStyles()
    const settingsUIClasses = useSettingsUIStyles()

    const [showIdentitySelector, setShowIdentitySelector] = useState(false)
    React.useEffect(() => {
        if (getActivatedUI().networkIdentifier !== 'localhost') setShowIdentitySelector(true)
    }, [setShowIdentitySelector])

    return (
        <>
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
                    onClick={(e) => browser.runtime.openOptionsPage()}>
                    {t('popup_enter_dashboard')}
                </Button>
                <List>
                    <SettingsUI classes={settingsUIClasses} value={debugModeSetting} />
                    <SettingsUI classes={settingsUIClasses} value={steganographyModeSetting} />
                    <SettingsUI classes={settingsUIClasses} value={disableOpenNewTabInBackgroundSettings} />
                </List>
            </main>
        </>
    )
}
