import { useCallback } from 'react'
import { useCopyToClipboard } from 'react-use'
import { Copy, ExternalLink } from 'react-feather'
import classNames from 'classnames'
import { ProviderType } from '@masknet/web3-shared-evm'
import { Button, Link, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import {
    useAccount,
    useWeb3State,
    useChainId,
    useNetworkDescriptor,
    useProviderDescriptor,
    useProviderType,
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
        padding: theme.spacing(2, 3),
        marginBottom: theme.spacing(2),
        display: 'flex',
        backgroundColor: theme.palette.background.paper,
        borderRadius: 8,
        alignItems: 'center',
    },
    accountInfo: {
        fontSize: 16,
        flexGrow: 1,
        marginLeft: theme.spacing(1),
    },
    accountName: {
        fontSize: 16,
        marginRight: 6,
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
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        color: theme.palette.text.primary,
    },
    linkIcon: {
        marginRight: theme.spacing(1),
    },
    networkIcon: {},
    providerIcon: {},
    connectButtonWrapper: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: theme.spacing(2, 0),
    },
}))

export function WalletStatusBox() {
    const { t } = useI18N()
    const { classes } = useStyles()

    const chainId = useChainId()
    const account = useAccount()

    const providerType = useProviderType()
    const providerDescriptor = useProviderDescriptor()
    const networkDescriptor = useNetworkDescriptor()
    const { Utils } = useWeb3State() ?? {}

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
        <section className={classes.currentAccount}>
            <WalletIcon
                size={40}
                badgeSize={18}
                networkIcon={networkDescriptor?.icon}
                providerIcon={providerDescriptor?.icon}
                classes={{
                    networkIcon: classes.networkIcon,
                    providerIcon: classes.providerIcon,
                }}
            />
            <div className={classes.accountInfo}>
                <div className={classes.infoRow}>
                    <Typography className={classes.accountName}>{providerDescriptor?.name}</Typography>
                </div>
                <div className={classes.infoRow}>
                    <Typography className={classes.address} variant="body2">
                        <FormattedAddress address={account} size={9} formatter={Utils?.formatAddress} />
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
