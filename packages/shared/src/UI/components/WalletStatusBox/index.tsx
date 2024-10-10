import { Button, Link, Typography, useTheme, ThemeProvider } from '@mui/material'
import { MaskColors, MaskLightTheme, getMaskColor, makeStyles } from '@masknet/theme'
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
    useWeb3Utils,
} from '@masknet/web3-hooks-base'
import { FormattedAddress, WalletIcon, SelectProviderModal, WalletStatusModal, CopyButton } from '@masknet/shared'
import { ProviderType } from '@masknet/web3-shared-evm'
import { formatBalance } from '@masknet/web3-shared-base'
import { delay } from '@masknet/kit'
import { Icons } from '@masknet/icons'
import { usePendingTransactions } from './usePendingTransactions.js'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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
    const { _ } = useLingui()
    const providerDescriptor = useProviderDescriptor<'all'>()
    const theme = useTheme()
    const { classes, cx } = useStyles({
        contentBackground: providerDescriptor?.backgroundGradient ?? theme.palette.maskColor.publicBg,
        disableChange: props.disableChange,
        withinRiskWarningDialog: props.withinRiskWarningDialog,
        textColor:
            providerDescriptor?.type === ProviderType.MaskWallet ?
                theme.palette.maskColor.dark
            :   theme.palette.text.primary,
    })

    const Web3 = useWeb3Connection()
    const Utils = useWeb3Utils()
    const { account, chainId } = useChainContext()

    const chainIdValid = useChainIdValid()
    const wallet = useWallet()
    const { data: balance = '0', isPending: loadingBalance } = useBalance()
    const { data: nativeToken, isPending: loadingNativeToken } = useNativeToken()
    const networkDescriptor = useNetworkDescriptor()
    const { data: domain } = useReverseAddress(undefined, account)
    const { summary: pendingSummary, transactionList } = usePendingTransactions()

    if (!Utils.isValidAddress(account)) {
        return (
            <section className={classes.connectButtonWrapper}>
                <Button
                    className={cx(classes.actionButton)}
                    color="primary"
                    variant="contained"
                    size="small"
                    onClick={() => SelectProviderModal.open()}>
                    <Trans>Connect Wallet</Trans>
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
                    {ProviderType.MaskWallet === providerDescriptor?.type ?
                        <Typography className={classes.accountName}>{wallet?.name}</Typography>
                    :   null}
                    <div className={classes.infoRow}>
                        <Typography className={classes.accountName}>
                            {domain ?
                                Utils.formatDomainName(domain)
                            :   <FormattedAddress address={account} size={4} formatter={Utils.formatAddress} />}
                        </Typography>
                        <ThemeProvider theme={MaskLightTheme}>
                            <CopyButton
                                className={cx(classes.icon, classes.copyIcon)}
                                color={MaskColors.light.maskColor.dark}
                                size={17.5}
                                text={account}
                            />
                        </ThemeProvider>
                        {chainIdValid ?
                            <Link
                                className={classes.link}
                                href={Utils.explorerResolver.addressLink(chainId, account) ?? ''}
                                target="_blank"
                                title={_(msg`View on Explorer`)}
                                rel="noopener noreferrer">
                                <Icons.LinkOut className={cx(classes.icon, classes.linkIcon)} />
                            </Link>
                        :   null}
                    </div>

                    {props.withinRiskWarningDialog ? null : (
                        <div className={classes.infoRow}>
                            <Typography className={classes.balance}>
                                {loadingNativeToken || loadingBalance ?
                                    '-'
                                :   `${formatBalance(balance, nativeToken?.decimals, {
                                        significant: 3,
                                    })} ${nativeToken?.symbol}`
                                }
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
                                WalletStatusModal.close()
                                await Web3.disconnect()
                            }}>
                            <Trans>Disconnect</Trans>
                        </Button>
                        <Button
                            className={cx(classes.actionButton)}
                            variant="contained"
                            size="small"
                            onClick={() => {
                                SelectProviderModal.open()
                                props.closeDialog?.()
                            }}>
                            <Trans>Change</Trans>
                        </Button>
                    </section>
                )}
            </section>
            {props.showPendingTransaction ?
                <div>
                    {pendingSummary}
                    {transactionList}
                </div>
            :   null}
        </>
    )
}
