import '../../social-network-provider/popup-page/index'
import '../../setup.ui'
import React, { useMemo, useCallback } from 'react'

import { ThemeProvider, makeStyles, Theme, withStyles } from '@material-ui/core/styles'
import { Button, useMediaQuery, Paper, Divider, Typography, Box } from '@material-ui/core'
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
import { ChooseWallet } from '../../components/shared/ChooseWallet'
import { EthereumChainChip } from '../../components/shared/EthereumChainChip'
import { useChainId } from '../../web3/hooks/useChainId'
import { WalletMessageCenter, MaskbookWalletMessages } from '../../plugins/Wallet/messages'
import { useRemoteControlledDialog } from '../../utils/hooks/useRemoteControlledDialog'
import { useWallets } from '../../plugins/Wallet/hooks/useWallet'

const GlobalCss = withStyles({
    '@global': {
        body: {
            overflowX: 'hidden',
            margin: '0 auto',
            width: 340,
            minHeight: 180,
            maxWidth: '100%',
            backgroundColor: 'transparent',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
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
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    header: {
        margin: theme.spacing(2, 0),
        '&:first-child': {
            marginTop: 0,
        },
    },
    footer: {},
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
    const chainId = useChainId()

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

    const [, setOpen] = useRemoteControlledDialog<MaskbookWalletMessages, 'selectProviderDialogUpdated'>(
        WalletMessageCenter,
        'selectProviderDialogUpdated',
    )
    const onConnect = useCallback(async () => {
        setOpen({
            open: true,
        })
        setTimeout(() => window.close(), 100)
    }, [setOpen])

    return (
        <Paper className={classes.container}>
            {ui.networkIdentifier === 'localhost' ? (
                <img className={classes.logo} src={getUrl('MB--ComboCircle--Blue.svg')} />
            ) : null}
            {ui.networkIdentifier === 'localhost' || identities.length === 0 ? null : (
                <>
                    <Box className={classes.header} display="flex" justifyContent="space-between">
                        <Typography className={classes.title}>{t('popup_current_persona')}</Typography>
                    </Box>
                    <ChooseIdentity identities={identities} />
                </>
            )}

            {ui.networkIdentifier === 'localhost' || wallets.length === 0 ? null : (
                <>
                    <Box className={classes.header} display="flex" justifyContent="space-between">
                        <Typography className={classes.title}>{t('popup_current_wallet')}</Typography>
                        {chainId ? <EthereumChainChip chainId={chainId} /> : null}
                    </Box>
                    <ChooseWallet wallets={wallets} />
                </>
            )}

            <Divider className={classes.divider} />

            <Box className={classes.footer} display="flex">
                {ui.networkIdentifier !== 'localhost' && identities.length === 0 ? (
                    <Button className={classes.button} variant="text" onClick={onEnter}>
                        {t('popup_setup_first_persona')}
                    </Button>
                ) : (
                    <Button className={classes.button} variant="text" onClick={onEnter}>
                        {t('popup_enter_dashboard')}
                    </Button>
                )}
                {ui.networkIdentifier === 'localhost' ? null : (
                    <Button className={classes.button} variant="text" onClick={onConnect}>
                        {t('popup_connect_wallet')}
                    </Button>
                )}
            </Box>
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
