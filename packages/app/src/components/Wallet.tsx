import { Icons } from '@masknet/icons'
import { CopyButton, FormattedAddress, SelectProviderModal, WalletIcon, WalletStatusModal } from '@masknet/shared'
import { Sniffings } from '@masknet/shared-base'
import { MaskLightTheme, makeStyles } from '@masknet/theme'
import {
    useBalance,
    useChainContext,
    useChainIdValid,
    useNativeToken,
    useNetworkDescriptor,
    useProviderDescriptor,
    useReverseAddress,
    useWallet,
    useWeb3Others,
} from '@masknet/web3-hooks-base'
import { formatBalance } from '@masknet/web3-shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
import { Link, ThemeProvider, Typography, useTheme } from '@mui/material'
import { memo } from 'react'

const useStyles = makeStyles<{
    contentBackground?: string
    textColor?: string
    disableChange?: boolean
    withinRiskWarningDialog?: boolean
}>()((theme, { contentBackground, disableChange, withinRiskWarningDialog, textColor }) => ({
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
    link: {
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
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
    walletItem: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        pointerEvents: 'auto',
    },
}))

interface WalletItemProps {
    disableChange?: boolean
    withinRiskWarningDialog?: boolean
    showPendingTransaction?: boolean
    closeDialog?: () => void
}
export const WalletItem = memo<WalletItemProps>((props) => {
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

    const Others = useWeb3Others()
    const { account, chainId } = useChainContext()

    const chainIdValid = useChainIdValid()
    const wallet = useWallet()
    const { data: balance = '0', isLoading: loadingBalance } = useBalance()
    const { data: nativeToken, isLoading: loadingNativeToken } = useNativeToken()
    const networkDescriptor = useNetworkDescriptor()
    const { data: domain } = useReverseAddress(undefined, account)

    return (
        <>
            {!account ? (
                <a
                    href="#"
                    className="flex items-center gap-x-4  py-3 text-sm font-semibold leading-6 text-white hover:text-white"
                    onClick={(ev) => {
                        ev.preventDefault()
                        ev.stopPropagation()

                        if (account) WalletStatusModal.open()
                        else SelectProviderModal.open()
                    }}>
                    <img
                        className="h-8 w-8 rounded-full bg-gray-800"
                        src="https://github.com/DimensionDev/Mask-VI/raw/master/assets/Logo/MB--Logo--Geo--ForceCircle--Blue.svg"
                        alt=""
                    />
                    <span className="sr-only">Your profile</span>
                    <span className="dark:text-white  text-black" aria-hidden="true">
                        {account ? Others.formatAddress(account, 4) : 'Connect Wallet'}
                    </span>
                </a>
            ) : (
                <div className={classes.walletItem} onClick={() => SelectProviderModal.open()}>
                    <WalletIcon
                        size={30}
                        badgeSize={12}
                        mainIcon={providerDescriptor?.icon}
                        badgeIcon={networkDescriptor?.icon}
                    />
                    <div className={classes.accountInfo}>
                        {ProviderType.MaskWallet === providerDescriptor?.type ? (
                            <Typography className={cx(classes.accountName, 'text-black dark:text-white')}>
                                {wallet?.name}
                            </Typography>
                        ) : null}
                        <div className={classes.infoRow}>
                            <Typography className={cx(classes.accountName, 'text-black dark:text-white')}>
                                {domain ? (
                                    Others.formatDomainName(domain)
                                ) : (
                                    <FormattedAddress address={account} size={4} formatter={Others.formatAddress} />
                                )}
                            </Typography>
                            <ThemeProvider theme={MaskLightTheme}>
                                <CopyButton
                                    className={cx(classes.icon, classes.copyIcon, 'text-black dark:text-white')}
                                    color="text-black dark:text-white"
                                    size={17.5}
                                    text={account}
                                />
                            </ThemeProvider>
                            {chainIdValid ? (
                                <Link
                                    className={classes.link}
                                    href={Others.explorerResolver.addressLink(chainId, account) ?? ''}
                                    target="_blank"
                                    title="View on Explorer"
                                    rel="noopener noreferrer">
                                    <Icons.LinkOut
                                        className={cx(classes.icon, classes.linkIcon, 'text-black dark:text-white')}
                                    />
                                </Link>
                            ) : null}
                        </div>

                        {props.withinRiskWarningDialog ? null : (
                            <div className={classes.infoRow}>
                                <Typography className={cx(classes.balance, 'text-black dark:text-white')}>
                                    {loadingNativeToken || loadingBalance
                                        ? '-'
                                        : `${formatBalance(balance, nativeToken?.decimals, 3)} ${nativeToken?.symbol}`}
                                </Typography>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
})
