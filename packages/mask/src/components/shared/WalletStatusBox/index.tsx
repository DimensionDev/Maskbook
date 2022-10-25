import classNames from 'classnames'
import { useCopyToClipboard, useCopyToClipboard } from 'react-use'
import {
    useChainContext,
    useNetworkDescriptor,
    useProviderDescriptor,
    useReverseAddress,
    useNativeToken,
    useWallet,
    useWeb3State,
    useWeb3Connection,
    useBalance,
    useChainIdValid,
    useNetworkContext,
} from '@masknet/web3-hooks-base'
import { FormattedAddress, useGlobalDialogController, useSnackbarCallback, WalletIcon } from '@masknet/shared'
import { ProviderType } from '@masknet/web3-shared-evm'
import { isDashboardPage, GlobalDialogRoutes } from '@masknet/shared-base'
import { formatBalance } from '@masknet/web3-shared-base'
import { getMaskColor, makeStyles } from '@masknet/theme'
import { Button, DialogContent, Link, Typography, useTheme } from '@mui/material'
import { Icons } from '@masknet/icons'
import { useI18N } from '../../../utils/index.js'
import { usePendingTransactions } from './usePendingTransactions.js'
import { useCallback } from 'react'

const useStyles = makeStyles<{
    contentBackground?: string
    disableChange?: boolean
    withinRiskWarningDialog?: boolean
    textColor?: string
}>()((theme, { contentBackground, disableChange, withinRiskWarningDialog, textColor }) => ({
    currentAccount: {
        padding: theme.spacing(0, 1.5),
        marginBottom: withinRiskWarningDialog ? '7px' : theme.spacing(2),
        display: 'flex',
        background:
            contentBackground ??
            (isDashboardPage() ? getMaskColor(theme).primaryBackground2 : theme.palette.background.default),
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
        color: !isDashboardPage() ? theme.palette.maskColor.dark : textColor,
        fontWeight: 700,
        marginRight: 5,
        lineHeight: '18px',
    },
    balance: {
        color: !isDashboardPage() ? theme.palette.maskColor.dark : textColor,
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
        color: isDashboardPage() ? textColor : theme.palette.maskColor.dark,
    },
    linkIcon: {
        color: isDashboardPage() ? textColor : theme.palette.maskColor?.dark,
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
    const { classes } = useStyles({
        contentBackground: providerDescriptor?.backgroundGradient,
        disableChange: props.disableChange,
        withinRiskWarningDialog: props.withinRiskWarningDialog,
        textColor:
            providerDescriptor?.type === ProviderType.MaskWallet
                ? theme.palette.text.primary
                : theme.palette.maskColor.dark,
    })

    const connection = useWeb3Connection()
    const { pluginID } = useNetworkContext()
    const { account, chainId, ...rest } = useChainContext()

    console.log('DEBUG: useChainContext')
    console.log({
        pluginID,
        account,
        chainId,
        ...rest,
    })

    const chainIdValid = useChainIdValid()
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
    const { openGlobalDialog } = useGlobalDialogController()

    const openSelectProviderDialog = useCallback(() => {
        openGlobalDialog(GlobalDialogRoutes.SelectProvider)
    }, [openGlobalDialog])
    // #endregion

    const { summary: pendingSummary, transactionList } = usePendingTransactions()

    if (!Others?.isValidAddress(account)) {
        return (
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

    return (
        <DialogContent>
            {account ? (
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
                            badgeIcon={chainIdValid ? networkDescriptor?.icon : undefined}
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
                                        <FormattedAddress
                                            address={account}
                                            size={4}
                                            formatter={Others?.formatAddress}
                                        />
                                    )}
                                </Typography>
                                <Link
                                    className={classes.link}
                                    underline="none"
                                    component="button"
                                    title={t('wallet_status_button_copy_address')}
                                    onClick={onCopy}>
                                    <Icons.Copy className={classNames(classes.icon, classes.copyIcon)} />
                                </Link>
                                {chainIdValid ? (
                                    <Link
                                        className={classes.link}
                                        href={Others?.explorerResolver.addressLink?.(chainId, account) ?? ''}
                                        target="_blank"
                                        title={t('plugin_wallet_view_on_explorer')}
                                        rel="noopener noreferrer">
                                        <Icons.LinkOut className={classNames(classes.icon, classes.linkIcon)} />
                                    </Link>
                                ) : null}
                            </div>

                            {props.withinRiskWarningDialog ? null : (
                                <div className={classes.infoRow}>
                                    <Typography className={classes.balance}>
                                        {loadingNativeToken || loadingBalance
                                            ? '-'
                                            : `${formatBalance(balance, nativeToken?.decimals, 3)} ${
                                                  nativeToken?.symbol
                                              }`}
                                    </Typography>
                                </div>
                            )}
                        </div>

                        {!props.disableChange && (
                            <section>
                                <Button
                                    className={classNames(classes.actionButton)}
                                    variant="contained"
                                    size="small"
                                    onClick={async () => {
                                        props.closeDialog?.()
                                        // closeWalletStatusDialog()
                                        await connection?.disconnect()
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
            )}
        </DialogContent>
    )
}
