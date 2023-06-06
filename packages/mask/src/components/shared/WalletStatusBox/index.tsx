import { useCopyToClipboard } from 'react-use'
import { Button, Link, Typography, useTheme } from '@mui/material'
import { getMaskColor, makeStyles } from '@masknet/theme'
import { Sniffings } from '@masknet/shared-base'
import {
    useChainContext,
    useNetworkDescriptor,
    useProviderDescriptor,
    useReverseAddress,
    useNativeToken,
    useWallet,
    useWeb3Connection,
    useBalance,
    useChainIdValid,
    useWeb3Others,
} from '@masknet/web3-hooks-base'
import { FormattedAddress, useSnackbarCallback, WalletIcon , SelectProviderDialog } from '@masknet/shared'
import { ProviderType } from '@masknet/web3-shared-evm'
import { formatBalance } from '@masknet/web3-shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { delay } from '@masknet/kit'
import { Icons } from '@masknet/icons'
import { WalletMessages } from '@masknet/plugin-wallet'
import { useI18N } from '../../../utils/index.js'
import { usePendingTransactions } from './usePendingTransactions.js'

const useStyles = makeStyles<{
    contentBackground?: string
    textColor?: string
    disableChange?: boolean
    withinRiskWarningDialog?: boolean
}>()((theme, { contentBackground, disableChange, withinRiskWarningDialog, textColor }) => ({
    currentAccount: {
        padding: theme.spacing(0, 1.5),
        marginBottom: withinRiskWarningDialog ? '7px' : theme.spacing(2),
        display: 'flex',
        background:
            contentBackground ??
            (Sniffings.is_dashboard_page ? getMaskColor(theme).primaryBackground2 : theme.palette.background.default),
        borderRadius: 8,
        alignItems: 'center',
        height: disableChange ? 60 : 82,
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
        color: !Sniffings.is_dashboard_page ? theme.palette.maskColor.dark : textColor,
        fontWeight: 700,
        marginRight: 5,
        lineHeight: '18px',
    },
    balance: {
        color: !Sniffings.is_dashboard_page ? theme.palette.maskColor.dark : textColor,
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
    link: {
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
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
        color: Sniffings.is_dashboard_page ? textColor : theme.palette.maskColor.dark,
    },
    linkIcon: {
        color: Sniffings.is_dashboard_page ? textColor : theme.palette.maskColor?.dark,
    },
    statusBox: {
        position: 'relative',
    },
}))
export interface WalletStatusBox {
    disableChange?: boolean
    withinRiskWarningDialog?: boolean
    showPendingTransaction?: boolean
    closeDialog?: () => void
}
export function WalletStatusBox(props: WalletStatusBox) {
    const { t } = useI18N()

    const providerDescriptor = useProviderDescriptor<'all'>()
    const theme = useTheme()
    const { classes, cx } = useStyles({
        contentBackground: providerDescriptor?.backgroundGradient ?? theme.palette.maskColor.publicBg,
        disableChange: props.disableChange,
        withinRiskWarningDialog: props.withinRiskWarningDialog,
        textColor:
            providerDescriptor?.type === ProviderType.MaskWallet
                ? theme.palette.maskColor.dark
                : theme.palette.text.primary,
    })

    const Web3 = useWeb3Connection()
    const Others = useWeb3Others()
    const { account, chainId } = useChainContext()

    const chainIdValid = useChainIdValid()
    const wallet = useWallet()
    const { value: balance = '0', loading: loadingBalance } = useBalance()
    const { value: nativeToken, loading: loadingNativeToken } = useNativeToken()
    const networkDescriptor = useNetworkDescriptor()
    const { data: domain } = useReverseAddress(undefined, account)

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
    const { closeDialog: closeWalletStatusDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletStatusDialogUpdated,
    )
    // #endregion

    const { summary: pendingSummary, transactionList } = usePendingTransactions()

    if (!Others.isValidAddress(account)) {
        return (
            <section className={classes.connectButtonWrapper}>
                <Button
                    className={cx(classes.actionButton)}
                    color="primary"
                    variant="contained"
                    size="small"
                    onClick={() => SelectProviderDialog.open()}>
                    {t('plugin_wallet_on_connect')}
                </Button>
            </section>
        )
    }

    return (
        <>
            <section
                className={cx(
                    classes.statusBox,
                    classes.currentAccount,
                    Sniffings.is_dashboard_page ? classes.dashboardBackground : '',
                )}>
                <WalletIcon
                    size={30}
                    badgeSize={12}
                    mainIcon={providerDescriptor?.icon}
                    badgeIcon={chainIdValid ? networkDescriptor?.icon : undefined}
                />
                <div className={classes.accountInfo}>
                    {ProviderType.MaskWallet === providerDescriptor?.type ? (
                        <Typography className={classes.accountName}>{wallet?.name}</Typography>
                    ) : null}
                    <div className={classes.infoRow}>
                        <Typography className={classes.accountName}>
                            {domain ? (
                                Others.formatDomainName(domain)
                            ) : (
                                <FormattedAddress address={account} size={4} formatter={Others.formatAddress} />
                            )}
                        </Typography>
                        <Link
                            className={classes.link}
                            underline="none"
                            component="button"
                            title={t('wallet_status_button_copy_address')}
                            onClick={onCopy}>
                            <Icons.Copy className={cx(classes.icon, classes.copyIcon)} />
                        </Link>
                        {chainIdValid ? (
                            <Link
                                className={classes.link}
                                href={Others.explorerResolver.addressLink(chainId, account) ?? ''}
                                target="_blank"
                                title={t('plugin_wallet_view_on_explorer')}
                                rel="noopener noreferrer">
                                <Icons.LinkOut className={cx(classes.icon, classes.linkIcon)} />
                            </Link>
                        ) : null}
                    </div>

                    {props.withinRiskWarningDialog ? null : (
                        <div className={classes.infoRow}>
                            <Typography className={classes.balance}>
                                {loadingNativeToken || loadingBalance
                                    ? '-'
                                    : `${formatBalance(balance, nativeToken?.decimals, 3)} ${nativeToken?.symbol}`}
                            </Typography>
                        </div>
                    )}
                </div>

                {!props.disableChange && (
                    <section>
                        <Button
                            className={cx(classes.actionButton)}
                            variant="contained"
                            size="small"
                            onClick={async () => {
                                props.closeDialog?.()
                                // TODO: remove this after global dialog be implement
                                await delay(500)
                                closeWalletStatusDialog()
                                await Web3.disconnect()
                            }}>
                            {t('plugin_wallet_disconnect')}
                        </Button>
                        <Button
                            className={cx(classes.actionButton)}
                            variant="contained"
                            size="small"
                            onClick={() => {
                                SelectProviderDialog.open()
                                props.closeDialog?.()
                            }}>
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
    )
}
