import { CircularProgress, MenuItem, MenuItemProps, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import classNames from 'classnames'
import {
    useAccount,
    useChainColor,
    useChainDetailed,
    useChainIdValid,
    useWallet,
    formatEthereumAddress,
    TransactionStatusType,
} from '@masknet/web3-shared'
import {
    useActivatedPluginSNSAdaptorWithOperatingChainSupportedMet,
    useActivatedPluginsSNSAdaptor,
} from '@masknet/plugin-infra'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import { MaskbookSharpIconOfSize, WalletSharp } from '../../resources/MaskbookIcon'
import { ToolIconURLs } from '../../resources/tool-icon'
import { Image } from '../shared/Image'
import { useMenu } from '../../utils/hooks/useMenu'
import { forwardRef, useRef, useCallback } from 'react'
import { MaskMessage } from '../../utils/messages'
import { PLUGIN_ID as TransakPluginID } from '../../plugins/Transak/constants'
import { PLUGIN_IDENTIFIER as TraderPluginID } from '../../plugins/Trader/constants'
import { useControlledDialog } from '../../utils/hooks/useControlledDialog'
import { useRemoteControlledDialog, useStylesExtends } from '@masknet/shared'
import { PluginTransakMessages } from '../../plugins/Transak/messages'
import { PluginTraderMessages } from '../../plugins/Trader/messages'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { Flags } from '../../utils/flags'
import { ClaimAllDialog } from '../../plugins/ITO/SNSAdaptor/ClaimAllDialog'
import { WalletIcon } from '../shared/WalletIcon'
import { hasNativeAPI, nativeAPI, useI18N } from '../../utils'
import { safeUnreachable } from '@dimensiondev/kit'
import { usePluginI18NField } from '../../plugin-infra/I18NFieldRender'
import { useRecentTransactions } from '../../plugins/Wallet/hooks/useRecentTransactions'

const useStyles = makeStyles()(({ palette, breakpoints, spacing }) => {
    const isDark = palette.mode === 'dark'
    return {
        paper: {
            borderRadius: 4,
            transform: 'translateY(-150px) !important',
            boxShadow: `${
                isDark
                    ? 'rgba(255, 255, 255, 0.2) 0px 0px 15px, rgba(255, 255, 255, 0.15) 0px 0px 3px 1px'
                    : 'rgba(101, 119, 134, 0.2) 0px 0px 15px, rgba(101, 119, 134, 0.15) 0px 0px 3px 1px'
            }`,
            backgroundImage: 'none',
        },
        menu: {
            paddingTop: 0,
            paddingBottom: 0,
        },
        wrapper: {
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            cursor: 'pointer',
            [breakpoints.down('lg')]: {
                transform: 'translateX(0px)',
            },
            '&:hover': {
                '& $title': {
                    color: palette.primary.main,
                },
                '& $icon': {
                    color: palette.primary.main,
                },
            },
        },
        button: {
            display: 'flex',
            padding: '12px 26px 12px 14px',
            borderRadius: 50,
            justifyContent: 'center',
            alignItems: 'center',
            [breakpoints.down('lg')]: {
                transform: 'translateX(0px)',
                padding: 14,
            },
        },
        title: {
            display: 'flex',
            alignItems: 'center',
            color: isDark ? palette.text.primary : 'rgb(15, 20, 25)',
            fontSize: 20,
            marginLeft: 22,
            lineHeight: 1.35,
            [breakpoints.down('lg')]: {
                display: 'none',
            },
        },
        menuItem: {},
        text: {
            color: isDark ? palette.text.primary : 'rgb(15, 20, 25)',
            marginLeft: 22,
        },
        iconWrapper: {
            position: 'relative',
            height: 24,
            width: 24,
        },
        icon: {
            color: isDark ? palette.text.primary : 'rgb(15, 20, 25)',
            width: 24,
            height: 24,
            fontSize: 24,
        },
        mask: {
            color: isDark ? palette.text.primary : 'rgb(15, 20, 25)',
            width: 22,
            height: 22,
            fontSize: 22,
        },
        chainIcon: {
            fontSize: 18,
            width: 18,
            height: 18,
            marginLeft: spacing(0.5),
        },
    }
})

interface ToolboxHintProps extends withClasses<'wrapper' | 'menuItem' | 'title' | 'text' | 'button' | 'icon'> {}

export function ToolboxHint(props: ToolboxHintProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const account = useAccount()
    const selectedWallet = useWallet()
    const chainColor = useChainColor()
    const chainIdValid = useChainIdValid()
    const chainDetailed = useChainDetailed()
    const operatingSupportedChainMapping = useActivatedPluginSNSAdaptorWithOperatingChainSupportedMet()

    //#region recent pending transactions
    const { value: pendingTransactions = [] } = useRecentTransactions(TransactionStatusType.NOT_DEPEND)
    //#endregion

    //#region Encrypted message
    const openEncryptedMessage = useCallback(
        (id?: string) =>
            MaskMessage.events.requestComposition.sendToLocal({
                reason: 'timeline',
                open: true,
                options: {
                    startupPlugin: id,
                },
            }),
        [],
    )
    //#endregion

    //#region Wallet
    const { openDialog: openWalletStatusDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletStatusDialogUpdated,
    )
    const { openDialog: openSelectWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    //#endregion

    //#region Buy currency
    const transakPluginEnabled = useActivatedPluginsSNSAdaptor().find((x) => x.ID === TransakPluginID)
    const { setDialog: setBuyDialog } = useRemoteControlledDialog(PluginTransakMessages.buyTokenDialogUpdated)
    const openBuyCurrency = useCallback(() => {
        setBuyDialog({
            open: true,
            address: account,
        })
    }, [])
    //#endregion

    //#region Swap
    const swapPluginEnabled = useActivatedPluginsSNSAdaptor().find((x) => x.ID === TraderPluginID)
    const { openDialog: openSwapDialog } = useRemoteControlledDialog(PluginTraderMessages.swapDialogUpdated)
    //#endregion

    //#region Claim All ITO
    const {
        open: isClaimAllDialogOpen,
        onOpen: onClaimAllDialogOpen,
        onClose: onClaimAllDialogClose,
    } = useControlledDialog()
    //#endregion

    const items: ToolboxItemDescriptor[] = [
        { ...ToolIconURLs.encryptedmsg, onClick: () => openEncryptedMessage() },
        {
            ...ToolIconURLs.token,
            onClick: openBuyCurrency,
            hide: !(account && Flags.transak_enabled && transakPluginEnabled),
        },
        {
            ...ToolIconURLs.swap,
            onClick: openSwapDialog,
            hide: !(chainIdValid && swapPluginEnabled),
        },
        {
            ...ToolIconURLs.claim,
            onClick: onClaimAllDialogOpen,
            hide: !account,
        },
    ]

    const pluginI18N = usePluginI18NField()
    useActivatedPluginsSNSAdaptor().forEach((plugin) => {
        if (!plugin.ToolbarEntry) return
        const { image, label, onClick: onClickRaw, priority, useShouldDisplay } = plugin.ToolbarEntry

        let onClick: () => void
        if (onClickRaw === 'openCompositionEntry') {
            onClick = () => openEncryptedMessage(plugin.ID)
        } else {
            safeUnreachable(onClickRaw)
            onClick = () => {}
        }

        items.push({
            onClick,
            image,
            label: typeof label === 'string' ? label : pluginI18N(plugin.ID, label),
            priority,
            useShouldDisplay,
            hide: !operatingSupportedChainMapping[plugin.ID],
        })
    })

    const [menu, openMenu] = useMenu(
        items
            .filter((x) => x.hide !== true)
            .sort((a, b) => b.priority - a.priority)
            .map((desc) => <ToolboxItem className={classes.menuItem} {...desc} />),
        false,
        {
            paperProps: {
                className: classNames(classes.paper),
            },
            menuListProps: {
                className: classNames(classes.menu),
            },
        },
    )

    const isWalletValid = !!account && selectedWallet && chainIdValid

    function renderButtonText() {
        if (!account) return t('plugin_wallet_on_connect')
        if (!chainIdValid) return t('plugin_wallet_wrong_network')
        if (pendingTransactions.length <= 0) return formatEthereumAddress(account, 4)
        return (
            <>
                <span>
                    {t('plugin_wallet_pending_transactions', {
                        count: pendingTransactions.length,
                    })}
                </span>
                <CircularProgress sx={{ marginLeft: 1.5 }} thickness={6} size={20} color="inherit" />
            </>
        )
    }

    return (
        <>
            <div className={classes.wrapper} onClick={openMenu}>
                <div className={classes.button}>
                    <MaskbookSharpIconOfSize classes={{ root: classes.icon }} size={22} />
                    <Typography className={classes.title}>Mask Network</Typography>
                </div>
            </div>
            {menu}

            <div
                className={classes.wrapper}
                onClick={() => {
                    hasNativeAPI
                        ? nativeAPI?.api.misc_openCreateWalletView()
                        : isWalletValid
                        ? openWalletStatusDialog()
                        : openSelectWalletDialog()
                }}>
                <div className={classes.button}>
                    {isWalletValid ? <WalletIcon /> : <WalletSharp classes={{ root: classes.icon }} size={24} />}

                    <Typography className={classes.title}>
                        {renderButtonText()}
                        {account && chainIdValid && chainDetailed?.network !== 'mainnet' ? (
                            <FiberManualRecordIcon
                                className={classes.chainIcon}
                                style={{
                                    color: chainColor,
                                }}
                            />
                        ) : null}
                    </Typography>
                </div>
            </div>
            {isClaimAllDialogOpen ? (
                <ClaimAllDialog open={isClaimAllDialogOpen} onClose={onClaimAllDialogClose} />
            ) : null}
        </>
    )
}

interface ToolboxItemDescriptor {
    onClick: () => void
    image: string
    label: string
    hide?: boolean
    priority: number
    useShouldDisplay?(): boolean
}
// TODO: this should be rendered in the ErrorBoundary
const ToolboxItem = forwardRef<any, MenuItemProps & ToolboxItemDescriptor>((props, ref) => {
    const { image, label, hide, priority, useShouldDisplay, ...rest } = props
    const { classes } = useStyles()
    const shouldDisplay = useRef(useShouldDisplay || (() => true)).current() && !hide

    if (!shouldDisplay) return null

    return (
        <MenuItem ref={ref} {...rest}>
            <Image src={image} width={19} height={19} />
            <Typography className={classes.text}>{label}</Typography>
        </MenuItem>
    )
})
