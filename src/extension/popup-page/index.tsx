import '../../social-network-provider/popup-page/index'
import '../../setup.ui'
import React from 'react'

import { ThemeProvider, makeStyles } from '@material-ui/core/styles'
import { Button, useMediaQuery, Paper, Divider, Typography } from '@material-ui/core'
import TuneIcon from '@material-ui/icons/Tune'
import PlayCircleIcon from '@material-ui/icons/PlayCircleFilled'
import { MaskbookLightTheme, MaskbookDarkTheme } from '../../utils/theme'
import { SSRRenderer } from '../../utils/SSRRenderer'
import { appearanceSettings, Appearance } from '../../components/shared-settings/settings'
import { ChooseIdentity } from '../../components/shared/ChooseIdentity'
import { getActivatedUI } from '../../social-network/ui'
import { I18nextProvider } from 'react-i18next'
import { useI18N } from '../../utils/i18n-next-ui'
import i18nNextInstance from '../../utils/i18n-next'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { getUrl } from '../../utils/utils'

const useStyles = makeStyles((theme) => ({
    container: {
        userSelect: 'none',
        lineHeight: 1.75,
        padding: 20,
        borderRadius: 0,
    },
    logo: {
        display: 'block',
        width: 218,
        height: 50,
        margin: '16px auto 28px',
        pointerEvents: 'none',
    },
    title: {
        fontSize: 20,
        fontWeight: 500,
    },
    divider: {
        marginBottom: 20,
    },
    button: {
        fontSize: 16,
        fontWeight: 500,
        whiteSpace: 'nowrap',
    },
}))

function Popup() {
    const { t } = useI18N()
    const classes = useStyles()

    const ui = getActivatedUI()
    const myIdentities = useValueRef(ui.myIdentitiesRef)
    const openOptionsPage = () => browser.runtime.openOptionsPage()

    return (
        <>
            <style>{`body {
                overflow-x: hidden;
                margin: 0 auto;
                width: 340px;
                max-width: 100%;
                background-color: transparent;
            }`}</style>
            <Paper className={classes.container}>
                {myIdentities.length === 0 ? (
                    <img className={classes.logo} src={getUrl('MB--ComboCircle--Blue.svg')} />
                ) : (
                    <>
                        <Typography className={classes.title}>{t('popup_switch_account')}</Typography>
                        <ChooseIdentity />
                    </>
                )}
                <Divider className={classes.divider} />
                {ui.networkIdentifier !== 'localhost' && myIdentities.length === 0 ? (
                    <Button
                        className={classes.button}
                        variant="text"
                        color="primary"
                        startIcon={<PlayCircleIcon />}
                        onClick={openOptionsPage}>
                        {t('popup_setup_first_persona')}
                    </Button>
                ) : (
                    <Button
                        className={classes.button}
                        variant="text"
                        color="primary"
                        startIcon={<TuneIcon />}
                        onClick={openOptionsPage}>
                        {t('popup_enter_dashboard')}
                    </Button>
                )}
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
