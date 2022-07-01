import {
    useAccount,
    useChainId,
    useNetworkDescriptor,
    useProviderDescriptor,
    useReverseAddress,
    useNativeToken,
    useWallet,
    useWeb3State,
    useWeb3Connection,
    useBalance,
} from '@masknet/plugin-infra/web3'
import { FormattedAddress, useSnackbarCallback, WalletIcon } from '@masknet/shared'
import { ProviderType } from '@masknet/web3-shared-evm'
import { isDashboardPage } from '@masknet/shared-base'
import { formatBalance } from '@masknet/web3-shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { getMaskColor, makeStyles } from '@masknet/theme'
import { Button, Link, Typography } from '@mui/material'
import classNames from 'classnames'
import { LinkOut as LinkOutIcon, Copy as CopyIcon } from '@masknet/icons'
import { useCopyToClipboard } from 'react-use'
import { WalletMessages } from '../../../plugins/Wallet/messages'
import { useI18N } from '../../../utils'
import { usePendingTransactions } from './usePendingTransactions'

const useStyles = makeStyles<{ contentBackground?: string }>()((theme, { contentBackground }) => ({
    content: {
        padding: theme.spacing(2, 3, 3),
    },
    currentAccount: {
        padding: theme.spacing(0, 1.5),
        marginBottom: theme.spacing(2),
        display: 'flex',
        background:
            contentBackground ??
            (isDashboardPage() ? getMaskColor(theme).primaryBackground2 : theme.palette.background.default),
        borderRadius: 8,
        alignItems: 'center',
        height: 82,
    },
    dashboardBackground: {
        background: theme.palette.background.default,
    },
    accountInfo: {
        fontSize: 16,
        flexGrow: 1,
        marginLeft: theme.spacing(1.5),
    },
    accountName: {
        color: theme.palette.maskColor.dark,
        fontWeight: 700,
        fontSize: 14,
        marginRight: 5,
        lineHeight: '18px',
    },
    balance: {
        color: theme.palette.maskColor.dark,
        fontSize: 14,
        paddingTop: 2,
        lineHeight: '18px',
    },
    infoRow: {
        display: 'flex',
        alignItems: 'center',
    },
    actionButton: {
        fontSize: 12,
        color: 'white',
        backgroundColor: theme.palette.maskColor.dark,
        marginLeft: theme.spacing(1),
        padding: theme.spacing(1, 2),
        '&:hover': {
            backgroundColor: theme.palette.maskColor.dark,
        },
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
    icon: {
        width: 17.5,
        height: 17.5,
        marginRight: theme.spacing(0.5),
    },
    copyIcon: {
        fill: isDashboardPage() ? theme.palette.text.primary : theme.palette.maskColor.dark,
    },
    linkIcon: {
        fill: isDashboardPage() ? theme.palette.text.primary : theme.palette.maskColor?.dark,
    },
    statusBox: {
        position: 'relative',
    },
}))
interface WalletStatusBox {
    disableChange?: boolean
    showPendingTransaction?: boolean
    closeDialog?: () => void
}
export function WalletStatusBox(props: WalletStatusBox) {
    const { t } = useI18N()

    const providerDescriptor = useProviderDescriptor<'all'>()
    const { classes } = useStyles({
        contentBackground: providerDescriptor?.backgroundGradient,
    })
    const connection = useWeb3Connection()
    const chainId = useChainId()
    const account = useAccount()
    const wallet = useWallet()
    const { value: balance = '0', loading: loadingBalance } = useBalance()
    const { value: nativeToken, loading: loadingNativeToken } = useNativeToken()
    const networkDescriptor = useNetworkDescriptor()
    const { Others } = useWeb3State()
    const { value: domain } = useReverseAddress(undefined, account)

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

    const { closeDialog: closeWalletStatusDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletStatusDialogUpdated,
    )
    // #endregion

    const { summary: pendingSummary, transactionList } = usePendingTransactions()

    return account ? (
        <>
            <section
                className={classNames(
                    classes.statusBox,
                    classes.currentAccount,
                    isDashboardPage() ? classes.dashboardBackground : '',
                )}>
                <WalletIcon
                    size={30}
                    badgeSize={12}
                    mainIcon={providerDescriptor?.icon}
                    badgeIcon={networkDescriptor?.icon}
                />
                <div className={classes.accountInfo}>
                    {ProviderType.MaskWallet === providerDescriptor?.type ? (
                        <Typography className={classes.accountName}>{wallet?.name}</Typography>
                    ) : null}
                    <div className={classes.infoRow}>
                        <Typography className={classes.accountName}>
                            {domain && Others?.formatDomainName ? (
                                Others.formatDomainName(domain)
                            ) : (
                                <FormattedAddress address={account} size={4} formatter={Others?.formatAddress} />
                            )}
                        </Typography>
                        <Link
                            className={classes.link}
                            underline="none"
                            component="button"
                            title={t('wallet_status_button_copy_address')}
                            onClick={onCopy}>
                            <CopyIcon className={classNames(classes.icon, classes.copyIcon)} />
                        </Link>
                        <Link
                            className={classes.link}
                            href={Others?.explorerResolver.addressLink?.(chainId, account) ?? ''}
                            target="_blank"
                            title={t('plugin_wallet_view_on_explorer')}
                            rel="noopener noreferrer">
                            <LinkOutIcon className={classNames(classes.icon, classes.linkIcon)} />
                        </Link>
                    </div>

                    <div className={classes.infoRow}>
                        <Typography className={classes.balance}>
                            {loadingNativeToken || loadingBalance
                                ? '-'
                                : `${formatBalance(balance, nativeToken?.decimals, 3)} ${nativeToken?.symbol}`}
                        </Typography>
                    </div>
                </div>

                {!props.disableChange && (
                    <section>
                        <Button
                            className={classNames(classes.actionButton)}
                            variant="contained"
                            size="small"
                            onClick={async () => {
                                props.closeDialog?.()
                                closeWalletStatusDialog()
                                await connection.disconnect()
                                openSelectProviderDialog()
                            }}>
                            {t('plugin_wallet_disconnect')}
                        </Button>
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
