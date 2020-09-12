import '../../social-network-provider/popup-page/index'
import '../../setup.ui'
import React, { useMemo, useCallback } from 'react'

import { ThemeProvider, makeStyles, Theme, withStyles } from '@material-ui/core/styles'
import { Button, useMediaQuery, Paper, Divider, Typography } from '@material-ui/core'
import TuneIcon from '@material-ui/icons/Tune'
import PlayCircleIcon from '@material-ui/icons/PlayCircleFilled'
import { MaskbookLightTheme, MaskbookDarkTheme } from '../../utils/theme'
import { SSRRenderer } from '../../utils/SSRRenderer'
import { appearanceSettings, Appearance } from '../../settings/settings'
import { ChooseIdentity } from '../../components/shared/ChooseIdentity'
import { getActivatedUI } from '../../social-network/ui'
import { I18nextProvider } from 'react-i18next'
import { useI18N } from '../../utils/i18n-next-ui'
import i18nNextInstance from '../../utils/i18n-next'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { getUrl } from '../../utils/utils'
import { useWallets } from '../../plugins/shared/useWallet'
import { ChooseWallet } from '../../components/shared/ChooseWallet'

const GlobalCss = withStyles({
    '@global': {
        body: {
            overflowX: 'hidden',
            margin: '0 auto',
            width: 340,
            minHeight: 180,
            maxWidth: '100%',
            backgroundColor: 'transparent',
        },
    },
})(() => null)

const useStyles = makeStyles((theme: Theme) => ({
    container: {
        lineHeight: 1.75,
        padding: 20,
        borderRadius: 0,
        boxShadow: 'none',
        userSelect: 'none',
    },
    logo: {
        display: 'block',
        width: 218,
        height: 50,
        margin: '16px auto 28px',
        pointerEvents: 'none',
    },
    title: {
        fontSize: 16,
        fontWeight: 500,
        marginTop: theme.spacing(2),
        '&:first-child': {
            marginTop: 0,
        },
    },
    divider: {
        marginBottom: theme.spacing(2),
    },
    button: {
        fontSize: 16,
        fontWeight: 500,
        whiteSpace: 'nowrap',
    },
}))

function PopupUI() {
    const { t } = useI18N()
    const classes = useStyles()

    const ui = getActivatedUI()
    const identities = useValueRef(ui.myIdentitiesRef)
    const { data: wallets = [] } = useWallets()

    const onEnter = useCallback((event: React.MouseEvent) => {
        if (event.shiftKey) {
            browser.tabs.create({
                active: true,
                url: browser.runtime.getURL('/debug.html'),
            })
        } else {
            browser.runtime.openOptionsPage()
        }
    }, [])

    return (
        <Paper className={classes.container}>
            {ui.networkIdentifier === 'localhost' ? (
                <img className={classes.logo} src={getUrl('MB--ComboCircle--Blue.svg')} />
            ) : null}
            {ui.networkIdentifier === 'localhost' || identities.length === 0 ? null : (
                <>
                    <Typography className={classes.title}>{t('popup_current_persona')}</Typography>
                    <ChooseIdentity identities={identities} />
                </>
            )}
            {ui.networkIdentifier === 'localhost' || wallets.length === 0 ? null : (
                <>
                    <Typography className={classes.title}>{t('popup_current_wallet')}</Typography>
                    <ChooseWallet wallets={wallets} />
                </>
            )}
            <Divider className={classes.divider} />
            {ui.networkIdentifier !== 'localhost' && identities.length === 0 ? (
                <Button className={classes.button} variant="text" startIcon={<PlayCircleIcon />} onClick={onEnter}>
                    {t('popup_setup_first_persona')}
                </Button>
            ) : (
                <Button className={classes.button} variant="text" startIcon={<TuneIcon />} onClick={onEnter}>
                    {t('popup_enter_dashboard')}
                </Button>
            )}
        </Paper>
    )
}

function Popup() {
    const preferDarkScheme = useMediaQuery('(prefers-color-scheme: dark)')
    const appearance = useValueRef(appearanceSettings)
    const theme = useMemo(
        () => ({
            ...((preferDarkScheme && appearance === Appearance.default) || appearance === Appearance.dark
                ? MaskbookDarkTheme
                : MaskbookLightTheme),
        }),
        [preferDarkScheme, appearance],
    )
    return (
        <ThemeProvider theme={theme}>
            <I18nextProvider i18n={i18nNextInstance}>
                <GlobalCss />
                <PopupUI />
            </I18nextProvider>
        </ThemeProvider>
    )
}

SSRRenderer(<Popup />)
