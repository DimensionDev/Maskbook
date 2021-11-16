import {
    CircularProgress,
    MenuItem,
    MenuItemProps,
    ListItemButtonProps,
    ListItemIconProps,
    ListItemTextProps,
    TypographyProps,
    Typography as MuiTypography,
    ListItemButton as MuiListItemButton,
    ListItemIcon as MuiListItemIcon,
    ListItemText as MuiListItemText,
    Box,
} from '@mui/material'
import {
    useAccount,
    useChainColor,
    useChainDetailed,
    useChainIdValid,
    useWallet,
    TransactionStatusType,
    useChainId,
} from '@masknet/web3-shared-evm'
import {
    useActivatedPluginSNSAdaptor_withSupportOperateChain,
    useActivatedPluginsSNSAdaptor,
    useNetworkDescriptor,
    useProviderDescriptor,
    useWeb3State,
} from '@masknet/plugin-infra'
import { ToolIconURLs } from '../../resources/tool-icon'
import { Image } from '../shared/Image'
import { forwardRef, useRef, useCallback } from 'react'
import { MaskMessages } from '../../utils/messages'
import { PLUGIN_ID as TransakPluginID } from '../../plugins/Transak/constants'
import { PLUGIN_IDENTIFIER as TraderPluginID } from '../../plugins/Trader/constants'
import { useControlledDialog } from '../../utils/hooks/useControlledDialog'
import { useRemoteControlledDialog, WalletIcon } from '@masknet/shared'
import { PluginTransakMessages } from '../../plugins/Transak/messages'
import { PluginTraderMessages } from '../../plugins/Trader/messages'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { Flags } from '../../utils/flags'
import { activatedSocialNetworkUI } from '../../social-network'
import { ClaimAllDialog } from '../../plugins/ITO/SNSAdaptor/ClaimAllDialog'
import { hasNativeAPI, nativeAPI, useI18N, useMenu } from '../../utils'
import { safeUnreachable } from '@dimensiondev/kit'
import { usePluginI18NField } from '../../plugin-infra/I18NFieldRender'
import { useRecentTransactions } from '../../plugins/Wallet/hooks/useRecentTransactions'
import GuideStep from '../GuideStep'
import { MaskIcon, MaskSharpIconOfSize, WalletSharp } from '../../resources/MaskIcon'
import { makeStyles } from '@masknet/theme'
import classNames from 'classnames'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'

const useStyles = makeStyles()((theme) => ({
    font: {
        color: theme.palette.mode === 'dark' ? theme.palette.text.primary : 'rgb(15, 20, 25)',
    },
    paper: {
        borderRadius: 4,
        boxShadow:
            theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.2) 0px 0px 15px, rgba(255, 255, 255, 0.15) 0px 0px 3px 1px'
                : 'rgba(101, 119, 134, 0.2) 0px 0px 15px, rgba(101, 119, 134, 0.15) 0px 0px 3px 1px',
        backgroundImage: 'none',
    },
    menu: {
        paddingTop: 0,
        paddingBottom: 0,
    },
    menuItem: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },
    menuText: {
        marginLeft: 12,
        fontSize: 15,
        color: theme.palette.mode === 'dark' ? 'rgb(216, 216, 216)' : 'rgb(15, 20, 25)',
        paddingRight: theme.spacing(2),
    },
    chainIcon: {
        fontSize: 18,
        width: 18,
        height: 18,
        marginLeft: theme.spacing(0.5),
    },
}))
export interface ToolboxHintProps {
    Container?: React.ComponentType<React.PropsWithChildren<{}>>
    ListItemButton?: React.ComponentType<Pick<ListItemButtonProps, 'onClick' | 'children'>>
    ListItemText?: React.ComponentType<Pick<ListItemTextProps, 'primary'>>
    ListItemIcon?: React.ComponentType<Pick<ListItemIconProps, 'children'>>
    Typography?: React.ComponentType<Pick<TypographyProps, 'children' | 'className'>>
    icon?: 'mono' | 'colorful'
    iconSize?: number
    mini?: boolean
}
export function ToolboxHintUnstyled(props: ToolboxHintProps) {
    const { t } = useI18N()
    const {
        ListItemButton = MuiListItemButton,
        ListItemText = MuiListItemText,
        ListItemIcon = MuiListItemIcon,
        Container = 'div',
        Typography = MuiTypography,
        icon = 'mono',
        iconSize = 24,
        mini,
    } = props
    const { classes } = useStyles()
    const {
        openWallet,
        isWalletValid,
        ClaimDialogJSX,
        walletTitle,
        menu,
        openMenu,
        chainColor,
        shouldDisplayChainIndicator,
    } = useToolbox()

    const networkDescriptor = useNetworkDescriptor()
    const providerDescriptor = useProviderDescriptor()

    return (
        <>
            <GuideStep step={1} total={3} tip={t('user_guide_tip_1', { sns: activatedSocialNetworkUI.name })}>
                <Container>
                    <ListItemButton onClick={openMenu}>
                        <ListItemIcon>
                            {icon === 'mono' ? <MaskSharpIconOfSize size={iconSize} /> : <MaskIcon size={iconSize} />}
                        </ListItemIcon>
                        {mini ? null : (
                            <ListItemText primary={<Typography className={classes.font}>Mask Network</Typography>} />
                        )}
                    </ListItemButton>
                </Container>
            </GuideStep>
            {menu}
            <GuideStep step={2} total={3} tip={t('user_guide_tip_2')}>
                <Container>
                    <ListItemButton onClick={openWallet}>
                        <ListItemIcon>
                            {isWalletValid ? (
                                <WalletIcon
                                    size={iconSize}
                                    networkIcon={networkDescriptor?.icon}
                                    providerIcon={providerDescriptor?.icon}
                                />
                            ) : (
                                <WalletSharp size={iconSize} />
                            )}
                        </ListItemIcon>
                        {mini ? null : (
                            <ListItemText
                                primary={
                                    <Box
                                        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography className={classes.font}>{walletTitle}</Typography>
                                        {shouldDisplayChainIndicator ? (
                                            <FiberManualRecordIcon
                                                className={classes.chainIcon}
                                                style={{
                                                    color: chainColor,
                                                }}
                                            />
                                        ) : null}
                                    </Box>
                                }
                            />
                        )}
                    </ListItemButton>
                </Container>
            </GuideStep>
            {ClaimDialogJSX}
        </>
    )
}

function useToolbox() {
    const { classes } = useStyles()
    const { t } = useI18N()
    const account = useAccount()
    const chainId = useChainId()
    const selectedWallet = useWallet()
    const chainColor = useChainColor()
    const chainIdValid = useChainIdValid()
    const chainDetailed = useChainDetailed()
    const operatingSupportedChainMapping = useActivatedPluginSNSAdaptor_withSupportOperateChain(chainId)

    const { Utils } = useWeb3State()

    //#region recent pending transactions
    const { value: pendingTransactions = [] } = useRecentTransactions(TransactionStatusType.NOT_DEPEND)
    //#endregion

    //#region Encrypted message
    const openEncryptedMessage = useCallback(
        (id?: string) =>
            MaskMessages.events.requestComposition.sendToLocal({
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
    }, [account])
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
            .map((desc) => <ToolboxItem {...desc} />),
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
        if (pendingTransactions.length <= 0) return Utils?.formatAddress?.(account, 4) ?? account
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

    const openWallet = useCallback(() => {
        if (hasNativeAPI) return nativeAPI?.api.misc_openCreateWalletView()
        if (isWalletValid) return openWalletStatusDialog()
        else return openSelectWalletDialog()
    }, [openWalletStatusDialog, openSelectWalletDialog, hasNativeAPI, isWalletValid])

    const walletTitle = renderButtonText()

    const ClaimDialogJSX = isClaimAllDialogOpen ? (
        <ClaimAllDialog open={isClaimAllDialogOpen} onClose={onClaimAllDialogClose} />
    ) : null
    const shouldDisplayChainIndicator = account && chainIdValid && chainDetailed?.network !== 'mainnet'
    return {
        openWallet,
        isWalletValid,
        ClaimDialogJSX,
        walletTitle,
        menu,
        openMenu,
        shouldDisplayChainIndicator,
        chainColor,
    }
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
    const shouldDisplay = useRef(useShouldDisplay || (() => true)).current() && !hide
    const { classes } = useStyles()
    if (!shouldDisplay) return null

    return (
        <MenuItem className={classes.menuItem} ref={ref} {...rest}>
            <Image src={image} width={19} height={19} />
            <MuiTypography className={classes.menuText}>{label}</MuiTypography>
        </MenuItem>
    )
})
