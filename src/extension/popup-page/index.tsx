import '../../social-network-provider/popup-page/index'
import '../../setup.ui'
import React, { useState } from 'react'

import { ThemeProvider, makeStyles, useTheme } from '@material-ui/core/styles'
import { Button, useMediaQuery, Paper } from '@material-ui/core'
import { MaskbookLightTheme, MaskbookDarkTheme } from '../../utils/theme'
import { SSRRenderer } from '../../utils/SSRRenderer'
import { appearanceSettings, Appearance } from '../../components/shared-settings/settings'
import { ChooseIdentity } from '../../components/shared/ChooseIdentity'
import { getActivatedUI } from '../../social-network/ui'
import { I18nextProvider } from 'react-i18next'
import { useI18N } from '../../utils/i18n-next-ui'
import i18nNextInstance from '../../utils/i18n-next'
import { useValueRef } from '../../utils/hooks/useValueRef'

const useStyles = makeStyles((theme) => ({
    button: {
        margin: theme.spacing(1, 0),
        whiteSpace: 'nowrap',
    },
    container: {
        display: 'flex',
        flexDirection: 'column',
        padding: theme.spacing(0, 2),
        borderRadius: 0,
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

function Popup() {
    const { t } = useI18N()
    const classes = useStyles()
    const theme = useTheme()

    const ui = getActivatedUI()
    const myIdentities = useValueRef(ui.myIdentitiesRef)
    const [showIdentitySelector, setShowIdentitySelector] = useState(false)
    React.useEffect(() => {
        if (ui.networkIdentifier !== 'localhost' && myIdentities.length > 1) setShowIdentitySelector(true)
    }, [myIdentities, setShowIdentitySelector, ui.networkIdentifier])

    return (
        <>
            <style>{`body {
                overflow-x: hidden;
                margin: 0 auto;
                width: 30em;
                max-width: 100%;
            }`}</style>
            <Paper className={classes.container}>
                {showIdentitySelector ? <ChooseIdentity /> : null}
                <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    onClick={(e) => browser.runtime.openOptionsPage()}>
                    {t('popup_enter_dashboard')}
                </Button>
            </Paper>
        </>
    )
}

function PopupWithProvider() {
    const preferDarkScheme = useMediaQuery('(prefers-color-scheme: dark)')
    const appearance = useValueRef(appearanceSettings)
    return (
        <ThemeProvider
            theme={
                (preferDarkScheme && appearance === Appearance.default) || appearance === Appearance.dark
                    ? MaskbookDarkTheme
                    : MaskbookLightTheme
            }>
            <I18nextProvider i18n={i18nNextInstance}>
                <Popup />
            </I18nextProvider>
        </ThemeProvider>
    )
}

SSRRenderer(<PopupWithProvider />)
