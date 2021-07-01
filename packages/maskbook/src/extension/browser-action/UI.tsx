import { useCallback, memo } from 'react'
import { noop } from 'lodash-es'
import { useAsyncRetry } from 'react-use'
import { makeStyles, Theme, withStyles } from '@material-ui/core/styles'
import { Button, Paper, Typography, Box } from '@material-ui/core'
import { useI18N, delay, Flags } from '../../utils'
import { useRemoteControlledDialog } from '@masknet/shared'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { ChooseIdentity } from '../../components/shared/ChooseIdentity'
import { activatedSocialNetworkUI } from '../../social-network'
import { MaskUIRoot } from '../../UIRoot'
import { useMyIdentities } from '../../components/DataSource/useActivatedUI'
import { hasSNSAdaptorPermission, requestSNSAdaptorPermission } from '../../social-network/utils/permissions'

const GlobalCss = withStyles({
    '@global': {
        body: {
            overflowX: 'hidden',
            margin: '0 auto',
            width: 340,
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
        borderRadius: '0 !important',
        userSelect: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    header: {
        margin: theme.spacing(2, 0, 1),
        '&:first-child': {
            marginTop: 0,
        },
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
    },
    description: {},
    divider: {
        marginBottom: theme.spacing(2),
    },
    button: {
        fontSize: 16,
        fontWeight: 500,
        whiteSpace: 'nowrap',
    },
}))

function BrowserActionUI() {
    const { t } = useI18N()
    const classes = useStyles()

    const ui = activatedSocialNetworkUI
    const identities = useMyIdentities()

    const { value: hasPermission = true, retry: checkPermission } = useAsyncRetry(
        hasSNSAdaptorPermission.bind(null, ui),
    )

    const onEnter = useCallback((event: React.MouseEvent) => {
        if (event.shiftKey) {
            browser.tabs.create({
                active: true,
                url: browser.runtime.getURL('/debug.html'),
            })
        } else if (process.env.NODE_ENV === 'development' && event.ctrlKey) {
            browser.tabs.create({
                active: true,
                url: browser.runtime.getURL('/next.html'),
            })
        } else {
            browser.runtime.openOptionsPage()
        }
    }, [])

    const { openDialog: openSelectProviderDailog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
        noop,
        'activated',
    )
    const onConnect = useCallback(async () => {
        openSelectProviderDailog()
        await delay(200)
        window.close()
    }, [openSelectProviderDailog])

    const Trademark = memo(() => {
        if (ui.networkIdentifier !== 'localhost') {
            return null
        }
        const src =
            process.env.NODE_ENV === 'production'
                ? new URL('./MB--ComboCircle--Blue.svg', import.meta.url)
                : new URL('./MB--ComboCircle--Nightly.svg', import.meta.url)
        return <img className={classes.logo} src={src.toString()} />
    })

    return (
        <Paper className={classes.container} elevation={0}>
            <Trademark />
            {hasPermission === false ? (
                <>
                    <Box
                        className={classes.header}
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}>
                        <Typography className={classes.title}>{t('browser_action_notifications')}</Typography>
                    </Box>
                    <Typography className={classes.description} color="textSecondary" variant="body2">
                        {t('browser_action_notifications_description', {
                            sns: ui.networkIdentifier,
                        })}
                    </Typography>
                    <Box
                        sx={{
                            display: 'flex',
                        }}>
                        <Button
                            className={classes.button}
                            variant="text"
                            onClick={() => {
                                if (Flags.no_web_extension_dynamic_permission_request) return
                                requestSNSAdaptorPermission(ui).then(checkPermission)
                            }}>
                            {t('browser_action_request_permission')}
                        </Button>
                    </Box>
                </>
            ) : null}
            {ui.networkIdentifier === 'localhost' || identities.length === 0 ? null : (
                <>
                    <Box
                        className={classes.header}
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}>
                        <Typography className={classes.title}>{t('browser_action_current_persona')}</Typography>
                    </Box>
                    <ChooseIdentity identities={identities} />
                </>
            )}
            <Box
                sx={{
                    display: 'flex',
                }}>
                {ui.networkIdentifier !== 'localhost' && identities.length === 0 ? (
                    <Button className={classes.button} variant="text" onClick={onEnter}>
                        {t('browser_action_setup_first_persona')}
                    </Button>
                ) : (
                    <Button className={classes.button} variant="text" onClick={onEnter}>
                        {t('browser_action_enter_dashboard')}
                    </Button>
                )}
                {ui.networkIdentifier === 'localhost' ? null : (
                    <Button className={classes.button} variant="text" onClick={onConnect}>
                        {t('browser_action_connect_wallet')}
                    </Button>
                )}
            </Box>
        </Paper>
    )
}

export function BrowserActionRoot() {
    return MaskUIRoot(
        <>
            <GlobalCss />
            <BrowserActionUI />
        </>,
    )
}
