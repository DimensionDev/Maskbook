import {
    useAccount,
    useChainId,
    useNetworkDescriptor,
    useProviderDescriptor,
    useReverseAddress,
    useWeb3State,
    NetworkPluginID,
} from '@masknet/plugin-infra/web3'
import { useBalance, useNativeTokenDetailed, ProviderType } from '@masknet/web3-shared-evm'
import { FormattedAddress, useSnackbarCallback, WalletIcon } from '@masknet/shared'
import { isDashboardPage } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { getMaskColor, makeStyles } from '@masknet/theme'
import { Button, Link, Typography } from '@mui/material'
import classNames from 'classnames'
import { Copy } from 'react-feather'
import { LinkOutIcon } from '@masknet/icons'
import { useCopyToClipboard } from 'react-use'
import { WalletMessages } from '../../../plugins/Wallet/messages'
import { useI18N } from '../../../utils'
import { usePendingTransactions } from './usePendingTransactions'

const useStyles = makeStyles<{ isDashboard: boolean; contentBackground?: string }>()(
    (theme, { isDashboard, contentBackground }) => ({
        content: {
            padding: theme.spacing(2, 3, 3),
        },
        currentAccount: {
            padding: theme.spacing(1.5),
            marginBottom: theme.spacing(2),
            display: 'flex',
            background:
                contentBackground ??
                (isDashboard ? getMaskColor(theme).primaryBackground2 : theme.palette.background.default),
            borderRadius: 8,
            alignItems: 'center',
        },
        accountInfo: {
            fontSize: 16,
            flexGrow: 1,
            marginLeft: theme.spacing(1.5),
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
            color: theme.palette.text.primary,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
        },
        twitterProviderBorder: {
            width: 14,
            height: 14,
        },
        connectButtonWrapper: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: theme.spacing(2, 0),
        },
        linkIcon: {
            fill: 'none',
            width: 16,
            height: 16,
            marginLeft: theme.spacing(0.5),
        },
        statusBox: {
            position: 'relative',
        },
    }),
)
interface WalletStatusBox {
    isDashboard?: boolean
    disableChange?: boolean
    showPendingTransaction?: boolean
}
export function WalletStatusBox(props: WalletStatusBox) {
    const { t } = useI18N()

    const isDashboard = isDashboardPage()
    const providerDescriptor = useProviderDescriptor()
    const { classes } = useStyles({ isDashboard, contentBackground: providerDescriptor?.backgroundGradient })
    const chainId = useChainId()
    const account = useAccount()
    const { value: balance = '0' } = useBalance()
    const { value: nativeToken } = useNativeTokenDetailed()

    const networkDescriptor = useNetworkDescriptor()
    const { Utils } = useWeb3State() ?? {}
    const { value: domain } = useReverseAddress(account)

    // #region copy addr to clipboard
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
    // #endregion

    // #region change provider
    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    // #endregion

    const { summary: pendingSummary, transactionList } = usePendingTransactions()

    return account ? (
        <>
            <section className={classNames(classes.statusBox, classes.currentAccount)}>
                <WalletIcon
                    size={30}
                    badgeSize={12}
                    mainIcon={providerDescriptor?.icon}
                    badgeIcon={networkDescriptor?.icon}
                />
                <div className={classes.accountInfo}>
                    {[ProviderType.MaskWallet, 'Phantom', 'Blocto'].includes(providerDescriptor?.type ?? '') ? (
                        <Typography className={classes.accountName}>{providerDescriptor?.name}</Typography>
                    ) : null}
                    <div className={classes.infoRow}>
                        <Typography className={classes.accountName}>
                            {domain && Utils?.formatDomainName ? (
                                Utils.formatDomainName(domain)
                            ) : (
                                <FormattedAddress address={account} size={4} formatter={Utils?.formatAddress} />
                            )}
                        </Typography>
                        <Link
                            className={classes.link}
                            underline="none"
                            component="button"
                            title={t('wallet_status_button_copy_address')}
                            onClick={onCopy}>
                            <Copy size={14} />
                        </Link>
                        <Link
                            className={classes.link}
                            href={Utils?.resolveAddressLink?.(chainId, account) ?? ''}
                            target="_blank"
                            title={t('plugin_wallet_view_on_explorer')}
                            rel="noopener noreferrer">
                            <LinkOutIcon className={classes.linkIcon} />
                        </Link>
                    </div>
                    {networkDescriptor?.networkSupporterPluginID === NetworkPluginID.PLUGIN_EVM ? (
                        <div className={classes.infoRow}>
                            <Typography className={classes.accountName}>
                                {Utils?.formatBalance?.(balance, nativeToken?.decimals, 3)} {nativeToken?.symbol}
                            </Typography>
                        </div>
                    ) : null}
                </div>

                {!props.disableChange && (
                    <section>
                        <Button
                            className={classNames(classes.actionButton)}
                            variant="contained"
                            size="small"
                            onClick={openSelectProviderDialog}>
                            {t('wallet_status_button_change')}
                        </Button>
                    </section>
                )}
            </section>
            {props.showPendingTransaction ? (
                <div>
                    {pendingSummary}
                    {transactionList}
                </div>
            ) : null}
        </>
    ) : (
        <section className={classes.connectButtonWrapper}>
            <Button
                className={classNames(classes.actionButton)}
                color="primary"
                variant="contained"
                size="small"
                onClick={openSelectProviderDialog}>
                {t('plugin_wallet_on_connect')}
            </Button>
        </section>
    )
}
