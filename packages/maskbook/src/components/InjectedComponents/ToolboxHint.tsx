import { makeStyles, MenuItem, Typography } from '@material-ui/core'
import classNames from 'classnames'
import {
    useAccount,
    useChainColor,
    useChainDetailed,
    useChainIdValid,
    useWallet,
    formatEthereumAddress,
} from '@masknet/web3-shared'
import { useActivatedPluginSNSAdaptorWithOperatingChainSupportedMet } from '@masknet/plugin-infra'
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
import { useControlledDialog } from '../../plugins/Collectible/SNSAdaptor/useControlledDialog'
import { useRemoteControlledDialog, useStylesExtends } from '@masknet/shared'
import { PluginTransakMessages } from '../../plugins/Transak/messages'
import { PluginTraderMessages } from '../../plugins/Trader/messages'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { Flags } from '../../utils/flags'
import { ClaimAllDialog } from '../../plugins/ITO/SNSAdaptor/ClaimAllDialog'
import { WalletIcon } from '../shared/WalletIcon'
import { useI18N } from '../../utils'
import { base as ITO_Plugin } from '../../plugins/ITO/base'
import { base as RedPacket_Plugin } from '../../plugins/RedPacket/base'

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
    const openITO = useCallback(() => {
        openEncryptedMessage()
        setTimeout(() => {
            MaskMessage.events.activatePluginCompositionEntry.sendToLocal(ITO_PluginID)
        })
    }, [openEncryptedMessage])
    //#endregion

    //#region Buy currency
    const { setDialog: setBuyDialog } = useRemoteControlledDialog(PluginTransakMessages.buyTokenDialogUpdated)
    const openBuyCurrency = useCallback(() => {
        setBuyDialog({
            open: true,
            address: account,
        })
    }, [])
    //#endregion

    //#region Swap
    const { openDialog: openSwapDialog } = useRemoteControlledDialog(PluginTraderMessages.swapDialogUpdated)
    //#endregion

    //#region Claim All ITO
    const {
        open: isClaimAllDialogOpen,
        onOpen: onClaimAllDialogOpen,
        onClose: onClaimAllDialogClose,
    } = useControlledDialog()
    //#endregion

    const [menu, openMenu] = useMenu(
        [
            <MenuItem onClick={openEncryptedMessage} className={classes.menuItem}>
                <Image src={ToolIconURLs.encryptedmsg.image} width={19} height={19} />
                <Typography className={classes.text}>{ToolIconURLs.encryptedmsg.text}</Typography>
            </MenuItem>,
            operatingSupportedChainMapping[RedPacket_Plugin.ID] ? (
                <MenuItem onClick={openRedPacket} className={classes.menuItem}>
                    <Image src={ToolIconURLs.redpacket.image} width={19} height={19} />
                    <Typography className={classes.text}>{ToolIconURLs.redpacket.text}</Typography>
                </MenuItem>
            ) : null,
            <MenuItem onClick={openFileService} className={classes.menuItem}>
                <Image src={ToolIconURLs.files.image} width={19} height={19} />
                <Typography className={classes.text}>{ToolIconURLs.files.text}</Typography>
            </MenuItem>,
            operatingSupportedChainMapping[ITO_Plugin.ID] ? (
                <MenuItem onClick={openITO} className={classes.menuItem}>
                    <Image src={ToolIconURLs.markets.image} width={19} height={19} />
                    <Typography className={classes.text}>{ToolIconURLs.markets.text}</Typography>
                </MenuItem>
            ) : null,
            account && Flags.transak_enabled ? (
                <MenuItem onClick={openBuyCurrency} className={classes.menuItem}>
                    <Image src={ToolIconURLs.token.image} width={19} height={19} />
                    <Typography className={classes.text}>{ToolIconURLs.token.text}</Typography>
                </MenuItem>
            ) : null,
            chainIdValid ? (
                <MenuItem onClick={openSwapDialog} className={classes.menuItem}>
                    <Image src={ToolIconURLs.swap.image} width={19} height={19} />
                    <Typography className={classes.text}>{ToolIconURLs.swap.text}</Typography>
                </MenuItem>
            ) : null,
            operatingSupportedChainMapping[ITO_Plugin.ID] ? (
                <MenuItem onClick={onClaimAllDialogOpen} className={classes.menuItem}>
                    <Image src={ToolIconURLs.claim.image} width={19} height={19} />
                    <Typography className={classes.text}>{ToolIconURLs.claim.text}</Typography>
                </MenuItem>
            ) : null,
        ],
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
