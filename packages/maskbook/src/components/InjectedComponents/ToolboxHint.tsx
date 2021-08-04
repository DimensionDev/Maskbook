import { makeStyles, MenuItem, MenuItemProps, Typography } from '@material-ui/core'
import classNames from 'classnames'
import {
    useAccount,
    useChainColor,
    useChainDetailed,
    useChainIdValid,
    useWallet,
    formatEthereumAddress,
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
import { useCallback } from 'react'
import { MaskMessage } from '../../utils/messages'
import { RedPacketPluginID } from '../../plugins/RedPacket/constants'
import { ITO_PluginID } from '../../plugins/ITO/constants'
import { FileServicePluginID } from '../../plugins/FileService/constants'
import { PLUGIN_ID as TransakPluginID } from '../../plugins/Transak/constants'
import { PLUGIN_IDENTIFIER as TraderPluginID } from '../../plugins/Trader/constants'
import { useControlledDialog } from '../../plugins/Collectible/SNSAdaptor/useControlledDialog'
import { useRemoteControlledDialog, useStylesExtends } from '@masknet/shared'
import { PluginTransakMessages } from '../../plugins/Transak/messages'
import { PluginTraderMessages } from '../../plugins/Trader/messages'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { Flags } from '../../utils/flags'
import { ClaimAllDialog } from '../../plugins/ITO/SNSAdaptor/ClaimAllDialog'
import { WalletIcon } from '../shared/WalletIcon'
import { useI18N } from '../../utils'
import { currentPluginEnabledStatus } from '../../settings/settings'
import { base as ITO_Plugin } from '../../plugins/ITO/base'
import { base as RedPacket_Plugin } from '../../plugins/RedPacket/base'
import Services from '../../extension/service'
import { forwardRef, useRef } from 'react'
import { safeUnreachable } from '@dimensiondev/kit'
import { usePluginI18NField } from '../../plugin-infra/I18NFieldRender'

const useStyles = makeStyles((theme) => ({
    paper: {
        borderRadius: 4,
        transform: 'translateY(-150px) !important',
        boxShadow: `${
            theme.palette.mode === 'dark'
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
        [theme.breakpoints.down('lg')]: {
            transform: 'translateX(0px)',
        },
        '&:hover': {
            '& $title': {
                color: theme.palette.primary.main,
            },
            '& $icon': {
                color: theme.palette.primary.main,
            },
        },
    },
    button: {
        display: 'flex',
        padding: '12px 26px 12px 14px',
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        [theme.breakpoints.down('lg')]: {
            transform: 'translateX(0px)',
            padding: 14,
        },
    },
    title: {
        display: 'flex',
        alignItems: 'center',
        color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(15, 20, 25)',
        fontWeight: 700,
        fontSize: 20,
        marginLeft: 22,
        lineHeight: 1.35,
        [theme.breakpoints.down('lg')]: {
            display: 'none',
        },
    },
    menuItem: {},
    text: {
        color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(15, 20, 25)',
        marginLeft: 22,
    },
    iconWrapper: {
        position: 'relative',
        height: 24,
        width: 24,
    },
    icon: {
        color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(15, 20, 25)',
        width: 24,
        height: 24,
        fontSize: 24,
    },
    mask: {
        color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(15, 20, 25)',
        width: 22,
        height: 22,
        fontSize: 22,
    },
    chainIcon: {
        fontSize: 18,
        width: 18,
        height: 18,
        marginLeft: theme.spacing(0.5),
    },
}))

interface ToolboxHintProps extends withClasses<never> {}
export function ToolboxHint(props: ToolboxHintProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    const account = useAccount()
    const selectedWallet = useWallet()
    const chainColor = useChainColor()
    const chainIdValid = useChainIdValid()
    const chainDetailed = useChainDetailed()
    const operatingSupportedChainMapping = useActivatedPluginSNSAdaptorWithOperatingChainSupportedMet()

    //#region Encrypted message
    const openEncryptedMessage = useCallback(
        () => MaskMessage.events.compositionUpdated.sendToLocal({ reason: 'timeline', open: true }),
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

    //#region Red packet
    const redPacketPluginEnabled = currentPluginEnabledStatus['plugin:' + RedPacketPluginID].value
    const openRedPacket = useCallback(() => {
        openEncryptedMessage()
        setTimeout(() => {
            MaskMessage.events.activatePluginCompositionEntry.sendToLocal(RedPacketPluginID)
        })
    }, [openEncryptedMessage])
    //#endregion

    //#region File Service
    const openFileService = useCallback(() => {
        openEncryptedMessage()
        setTimeout(() => {
            MaskMessage.events.activatePluginCompositionEntry.sendToLocal(FileServicePluginID)
        })
    }, [openEncryptedMessage])
    //#endregion

    //#region ITO
    const itoPluginEnabled = currentPluginEnabledStatus['plugin:' + ITO_PluginID].value
    const openITO = useCallback(() => {
        openEncryptedMessage()
        setTimeout(() => {
            MaskMessage.events.activatePluginCompositionEntry.sendToLocal(ITO_PluginID)
        })
    }, [openEncryptedMessage])
    //#endregion

    //#region Buy currency
    const transakPluginEnabled = currentPluginEnabledStatus['plugin:' + TransakPluginID].value
    const { setDialog: setBuyDialog } = useRemoteControlledDialog(PluginTransakMessages.buyTokenDialogUpdated)
    const openBuyCurrency = useCallback(() => {
        setBuyDialog({
            open: true,
            address: account,
        })
    }, [])
    //#endregion

    //#region Swap
    const swapPluginEnabled = currentPluginEnabledStatus['plugin:' + TraderPluginID].value
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
        { ...ToolIconURLs.encryptedmsg, onClick: openEncryptedMessage },
        {
            ...ToolIconURLs.redpacket,
            onClick: openRedPacket,
            hide: !(operatingSupportedChainMapping[RedPacket_Plugin.ID] && redPacketPluginEnabled),
        },
        {
            ...ToolIconURLs.markets,
            onClick: openITO,
            hide: !(operatingSupportedChainMapping[ITO_Plugin.ID] && itoPluginEnabled),
        },
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
            hide: operatingSupportedChainMapping[ITO_Plugin.ID],
        },
    ]

    const pluginI18N = usePluginI18NField()
    for (const plugin of useActivatedPluginsSNSAdaptor()) {
        if (!plugin.ToolbarEntry) continue
        const { image, label, onClick: onClickRaw, priority, useShouldDisplay } = plugin.ToolbarEntry

        let onClick: () => void
        if (onClickRaw === 'openCompositionEntry') {
            onClick = () => {
                openEncryptedMessage()
                setTimeout(() => MaskMessage.events.activatePluginCompositionEntry.sendToLocal(plugin.ID))
            }
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
        })
    }
    console.log(items)

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

    const pluginAutoOpenCheck = async () => {
        const pluginId = await Services.Storage.getStorage('openPlugin')
        if (pluginId) {
            switch (pluginId) {
                case FileServicePluginID:
                    openFileService()
                    break
                case ITO_PluginID:
                    openITO()
                    break
                case RedPacketPluginID:
                    openRedPacket()
                    break
            }
            Services.Storage.setStorage('openPlugin', null)
        }
    }

    setTimeout(pluginAutoOpenCheck, 2000)

    return (
        <>
            <div className={classes.wrapper} onClick={openMenu}>
                <div className={classes.button}>
                    <MaskbookSharpIconOfSize classes={{ root: classes.icon }} size={22} />
                    <Typography className={classes.title}>Mask Network</Typography>
                </div>
            </div>
            {menu}

            <div className={classes.wrapper} onClick={isWalletValid ? openWalletStatusDialog : openSelectWalletDialog}>
                <div className={classes.button}>
                    {isWalletValid ? <WalletIcon /> : <WalletSharp classes={{ root: classes.icon }} size={24} />}

                    <Typography className={classes.title}>
                        {account
                            ? chainIdValid
                                ? formatEthereumAddress(account, 4)
                                : t('plugin_wallet_wrong_network')
                            : t('plugin_wallet_on_connect')}
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
    const classes = useStyles()
    const shouldDisplay = useRef(useShouldDisplay || (() => true)).current() && !hide

    if (!shouldDisplay) return null

    return (
        <MenuItem ref={ref} {...rest}>
            <Image src={image} width={19} height={19} />
            <Typography className={classes.text}>{label}</Typography>
        </MenuItem>
    )
})
