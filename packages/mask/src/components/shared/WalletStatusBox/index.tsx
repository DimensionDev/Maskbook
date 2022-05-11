import {
    useAccount,
    useChainId,
    useNetworkDescriptor,
    useProviderDescriptor,
    useProviderType,
    useReverseAddress,
    useWallet,
    useWeb3State,
} from '@masknet/plugin-infra/web3'
import { FormattedAddress, useSnackbarCallback, WalletIcon } from '@masknet/shared'
import { isDashboardPage } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { getMaskColor, makeStyles } from '@masknet/theme'
import { ProviderType } from '@masknet/web3-shared-evm'
import { Button, Link, Typography } from '@mui/material'
import classNames from 'classnames'
import { Copy, ExternalLink } from 'react-feather'
import { useCopyToClipboard } from 'react-use'
import { WalletMessages } from '../../../plugins/Wallet/messages'
import { useI18N } from '../../../utils'
import { usePendingTransactions } from './usePendingTransactions'

const useStyles = makeStyles<{ isDashboard: boolean }>()((theme, { isDashboard }) => ({
    content: {
        padding: theme.spacing(2, 3, 3),
    },
    currentAccount: {
        padding: theme.spacing(1.5),
        marginBottom: theme.spacing(2),
        display: 'flex',
        backgroundColor: isDashboard ? getMaskColor(theme).primaryBackground2 : theme.palette.background.default,
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
    domain: {
        fontSize: 16,
        lineHeight: '18px',
        marginLeft: 6,
        padding: 4,
        borderRadius: 8,
        backgroundColor: '#ffffff',
        color: theme.palette.common.black,
    },
    statusBox: {
        position: 'relative',
    },
}))
interface WalletStatusBox {
    isDashboard?: boolean
    disableChange?: boolean
    showPendingTransaction?: boolean
}
export function WalletStatusBox(props: WalletStatusBox) {
    const { t } = useI18N()

    const isDashboard = isDashboardPage()
    const { classes } = useStyles({ isDashboard })
    const chainId = useChainId()
    const account = useAccount()
    const wallet = useWallet()
    const providerType = useProviderType()
    const providerDescriptor = useProviderDescriptor()
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
            <section
                className={classNames(
                    classes.statusBox,
                    classes.currentAccount,
                    props.isDashboard ? classes.dashboardBackground : '',
                )}>
                <WalletIcon
                    size={48}
                    badgeSize={16}
                    networkIcon={providerDescriptor?.icon} // switch providerIcon and networkIcon to meet design
                    providerIcon={networkDescriptor?.icon}
                />
                <div className={classes.accountInfo}>
                    <div className={classes.infoRow} style={{ marginBottom: 6 }}>
                        {providerType !== ProviderType.MaskWallet ? (
                            <Typography className={classes.accountName}>
                                {domain && Utils?.formatDomainName
                                    ? Utils.formatDomainName(domain)
                                    : providerDescriptor?.name}
                            </Typography>
                        ) : (
                            <>
                                <Typography className={classes.accountName}>
                                    {wallet?.name ?? providerDescriptor?.name}
                                </Typography>
                                {domain && Utils?.formatDomainName ? (
                                    <Typography className={classes.domain}>{Utils.formatDomainName(domain)}</Typography>
                                ) : null}
                            </>
                        )}
                    </div>
                    <div className={classes.infoRow}>
                        <Typography className={classes.address} variant="body2" title={account}>
                            <FormattedAddress address={account} size={4} formatter={Utils?.formatAddress} />
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
