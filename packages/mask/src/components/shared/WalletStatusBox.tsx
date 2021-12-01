import { useCallback } from 'react'
import { useCopyToClipboard } from 'react-use'
import { Copy, ExternalLink } from 'react-feather'
import classNames from 'classnames'
import { ProviderType } from '@masknet/web3-shared-evm'
import { Button, Link, Typography } from '@mui/material'
import { getMaskColor, makeStyles } from '@masknet/theme'
import {
    useAccount,
    useWeb3State,
    useChainId,
    useNetworkDescriptor,
    useProviderDescriptor,
    useProviderType,
    useReverseAddress,
} from '@masknet/plugin-infra'
import { FormattedAddress, useRemoteControlledDialog, useSnackbarCallback, WalletIcon } from '@masknet/shared'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { useI18N } from '../../utils'
import Services from '../../extension/service'

const useStyles = makeStyles()((theme) => ({
    content: {
        padding: theme.spacing(2, 3, 3),
    },
    currentAccount: {
        padding: theme.spacing(1.5),
        marginBottom: theme.spacing(2),
        display: 'flex',
        backgroundColor: getMaskColor(theme).twitterBackground,
        borderRadius: 8,
        alignItems: 'center',
    },
    dashboardBackground: {
        background: theme.palette.background.default,
    },
    accountInfo: {
        fontSize: 16,
        flexGrow: 1,
        marginLeft: theme.spacing(1),
    },
    accountName: {
        fontSize: 16,
        marginRight: 6,
        marginBottom: 6,
    },
    infoRow: {
        display: 'flex',
        alignItems: 'center',
    },
    actionButton: {
        fontSize: 12,
        marginLeft: theme.spacing(1),
        padding: theme.spacing(1, 2),
    },
    address: {
        fontSize: 16,
        marginRight: theme.spacing(1),
        display: 'inline-block',
    },
    link: {
        color: theme.palette.text.primary,
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
    },
    linkIcon: {
        marginRight: theme.spacing(1),
    },
    dashboardProvider: {
        border: `1px solid ${theme.palette.background.default}`,
    },
    twitterProviderBorder: {
        border: `1px solid ${getMaskColor(theme).twitterBackground}`,
        width: 14,
        height: 14,
    },
    connectButtonWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: theme.spacing(2, 0),
    },
}))
interface WalletStatusBox {
    isDashboard?: boolean
}
export function WalletStatusBox(props: WalletStatusBox) {
    const { t } = useI18N()
    const { classes } = useStyles()

    const chainId = useChainId()
    const account = useAccount()

    const providerType = useProviderType()
    const providerDescriptor = useProviderDescriptor()
    const networkDescriptor = useNetworkDescriptor()
    const { Utils } = useWeb3State() ?? {}

    const { value: domain } = useReverseAddress(account)

    //#region copy addr to clipboard
    const [, copyToClipboard] = useCopyToClipboard()
    const onCopy = useSnackbarCallback(
        async (ev: React.MouseEvent<HTMLAnchorElement>) => {
            ev.stopPropagation()
            copyToClipboard(account)
        },
        [],
        undefined,
        undefined,
        undefined,
        t('copy_success_of_wallet_addr'),
    )
    //#endregion

    //#region change provider
    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    //#endregion

    //#region walletconnect
    const { setDialog: setWalletConnectDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletConnectQRCodeDialogUpdated,
    )
    //#endregion

    const onDisconnect = useCallback(async () => {
        if (providerType !== ProviderType.WalletConnect) return
        setWalletConnectDialog({
            open: true,
            uri: await Services.Ethereum.createConnectionURI(),
        })
    }, [providerType, setWalletConnectDialog])

    const onChange = useCallback(() => {
        openSelectProviderDialog()
    }, [openSelectProviderDialog])

    return account ? (
        <section className={classNames(classes.currentAccount, props.isDashboard ? classes.dashboardBackground : '')}>
            <WalletIcon
                classes={{
                    providerIcon: props.isDashboard ? classes.dashboardProvider : classes.twitterProviderBorder,
                }}
                size={48}
                badgeSize={16}
                networkIcon={providerDescriptor?.icon} // switch providerIcon and networkIcon to meet design
                providerIcon={networkDescriptor?.icon}
            />
            <div className={classes.accountInfo}>
                <div className={classes.infoRow}>
                    <Typography className={classes.accountName}>{providerDescriptor?.name}</Typography>
                </div>
                <div className={classes.infoRow}>
                    <Typography className={classes.address} variant="body2">
                        {domain ? (
                            domain
                        ) : (
                            <FormattedAddress address={account} size={9} formatter={Utils?.formatAddress} />
                        )}
                    </Typography>
                    <Link
                        className={classes.link}
                        underline="none"
                        component="button"
                        title={t('wallet_status_button_copy_address')}
                        onClick={onCopy}>
                        <Copy className={classes.linkIcon} size={14} />
                    </Link>
                    <Link
                        className={classes.link}
                        href={Utils?.resolveAddressLink?.(chainId, account) ?? ''}
                        target="_blank"
                        title={t('plugin_wallet_view_on_explorer')}
                        rel="noopener noreferrer">
                        <ExternalLink className={classes.linkIcon} size={14} />
                    </Link>
                </div>
            </div>
            <section>
                {providerType === ProviderType.WalletConnect ? (
                    <Button
                        className={classes.actionButton}
                        color="primary"
                        size="small"
                        variant="contained"
                        onClick={onDisconnect}>
                        {t('wallet_status_button_disconnect')}
                    </Button>
                ) : null}
                <Button
                    className={classNames(classes.actionButton)}
                    color="primary"
                    variant="contained"
                    size="small"
                    onClick={onChange}>
                    {t('wallet_status_button_change')}
                </Button>
            </section>
        </section>
    ) : (
        <section className={classes.connectButtonWrapper}>
            <Button
                className={classNames(classes.actionButton)}
                color="primary"
                variant="contained"
                size="small"
                onClick={onChange}>
                {t('plugin_wallet_on_connect')}
            </Button>
        </section>
    )
}
