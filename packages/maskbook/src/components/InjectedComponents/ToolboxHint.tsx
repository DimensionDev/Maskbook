import { makeStyles, Typography, MenuItem } from '@material-ui/core'
import { formatEthereumAddress } from '@dimensiondev/maskbook-shared'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import { MaskbookSharpIconOfSize, WalletSharp } from '../../resources/MaskbookIcon'
import { ToolIconURLs } from '../../resources/tool-icon'
import { Image } from '../shared/Image'
import { useMenu } from '../../utils/hooks/useMenu'
import { useCallback } from 'react'
import { MaskMessage } from '../../utils/messages'
import { RedPacketCompositionEntry } from '../../plugins/RedPacket/define'
import { FileServiceCompositionEntry } from '../../plugins/FileService/UI-define'
import { ITO_CompositionEntry } from '../../plugins/ITO/define'
import { useControlledDialog } from '../../plugins/Collectible/UI/useControlledDialog'
import { useAccount } from '../../web3/hooks/useAccount'
import { useRemoteControlledDialog } from '../../utils/hooks/useRemoteControlledDialog'
import { PluginTransakMessages } from '../../plugins/Transak/messages'
import { PluginTraderMessages } from '../../plugins/Trader/messages'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { Flags } from '../../utils/flags'
import { useStylesExtends } from '../custom-ui-helper'
import classNames from 'classnames'
import { useWallet } from '../../plugins/Wallet/hooks/useWallet'
import { ClaimAllDialog } from '../../plugins/ITO/UI/ClaimAllDialog'
import { ChainState } from '../../web3/state/useChainState'
import { ProviderIcon } from '../shared/ProviderIcon'
import { NetworkIcon } from '../shared/NetworkIcon'
import { useValueRef } from '../../utils/hooks/useValueRef'
import {
    currentSelectedWalletProviderSettings,
    currentSelectedWalletNetworkSettings,
} from '../../plugins/Wallet/settings'
import { useChainId } from '../../web3/hooks/useChainId'
import { ChainId } from '../../web3/types'
import { resolveChainColor } from '../../web3/pipes'

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
    networkIcon: {
        position: 'absolute',
        right: -2,
        bottom: -2,
        backgroundColor: '#F7F9FA',
        height: 10,
        width: 10,
        borderRadius: '50%',
        boxShadow: `0 0 0 2px #F7F9FA`,
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
    const classes = useStylesExtends(useStyles(), props)
    const account = useAccount()
    const selectedWallet = useWallet()
    const chainId = useChainId()
    const selectedWalletProvider = useValueRef(currentSelectedWalletProviderSettings)
    const selectedNetwork = useValueRef(currentSelectedWalletNetworkSettings)

    //#region Encrypted message
    const openEncryptedMessage = useCallback(
        () => MaskMessage.events.compositionUpdated.sendToLocal({ reason: 'timeline', open: true }),
        [],
    )
    //#endregion

    //#region Wallet
    const { openDialog: openSelectWalletDialog } = useRemoteControlledDialog(
        WalletMessages.events.walletStatusDialogUpdated,
    )

    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    const openWallet = useCallback(() => {
        if (selectedWallet) {
            openSelectWalletDialog()
        } else {
            openSelectProviderDialog()
        }
    }, [])
    //#endregion

    //#region Red packet
    const openRedPacket = useCallback(() => {
        openEncryptedMessage()
        setTimeout(() => {
            RedPacketCompositionEntry.onClick()
        })
    }, [openEncryptedMessage])
    //#endregion

    //#region File Service
    const openFileService = useCallback(() => {
        openEncryptedMessage()
        setTimeout(() => {
            FileServiceCompositionEntry.onClick()
        })
    }, [openEncryptedMessage])
    //#endregion

    //#region ITO
    const openITO = useCallback(() => {
        openEncryptedMessage()
        setTimeout(() => {
            ITO_CompositionEntry.onClick()
        })
    }, [openEncryptedMessage])
    //#endregion

    //#region Buy currency
    const { setDialog: setBuyDialog } = useRemoteControlledDialog(PluginTransakMessages.events.buyTokenDialogUpdated)
    const openBuyCurrency = useCallback(() => {
        setBuyDialog({
            open: true,
            address: account,
        })
    }, [])
    //#endregion

    //#region Swap
    const { openDialog: openSwapDialog } = useRemoteControlledDialog(PluginTraderMessages.events.swapDialogUpdated)
    //#endregion

    //#region Claim All ITO
    const {
        open: isClaimAllDialogOpen,
        onOpen: onClaimAllDialogOpen,
        onClose: onClaimAllDialogClose,
    } = useControlledDialog()
    //#endregion

    const { openDialog: openCreateImportDialog } = useRemoteControlledDialog(
        WalletMessages.events.createImportWalletDialogUpdated,
    )

    const [menu, openMenu] = useMenu(
        [
            <MenuItem onClick={openEncryptedMessage} className={classes.menuItem}>
                <Image src={ToolIconURLs.encryptedmsg.image} width={19} height={19} />
                <Typography className={classes.text}>{ToolIconURLs.encryptedmsg.text}</Typography>
            </MenuItem>,
            <MenuItem onClick={openRedPacket} className={classes.menuItem}>
                <Image src={ToolIconURLs.redpacket.image} width={19} height={19} />
                <Typography className={classes.text}>{ToolIconURLs.redpacket.text}</Typography>
            </MenuItem>,
            <MenuItem onClick={openFileService} className={classes.menuItem}>
                <Image src={ToolIconURLs.files.image} width={19} height={19} />
                <Typography className={classes.text}>{ToolIconURLs.files.text}</Typography>
            </MenuItem>,
            <MenuItem onClick={openITO} className={classes.menuItem}>
                <Image src={ToolIconURLs.markets.image} width={19} height={19} />
                <Typography className={classes.text}>{ToolIconURLs.markets.text}</Typography>
            </MenuItem>,
            account && Flags.transak_enabled ? (
                <MenuItem onClick={openBuyCurrency} className={classes.menuItem}>
                    <Image src={ToolIconURLs.token.image} width={19} height={19} />
                    <Typography className={classes.text}>{ToolIconURLs.token.text}</Typography>
                </MenuItem>
            ) : null,
            <MenuItem onClick={openSwapDialog} className={classes.menuItem}>
                <Image src={ToolIconURLs.swap.image} width={19} height={19} />
                <Typography className={classes.text}>{ToolIconURLs.swap.text}</Typography>
            </MenuItem>,
            <MenuItem onClick={onClaimAllDialogOpen} className={classes.menuItem}>
                <Image src={ToolIconURLs.claim.image} width={19} height={19} />
                <Typography className={classes.text}>{ToolIconURLs.claim.text}</Typography>
            </MenuItem>,
            <MenuItem onClick={openCreateImportDialog} className={classes.menuItem}>
                <Image src={ToolIconURLs.claim.image} width={19} height={19} />
                <Typography className={classes.text}>create and import</Typography>
            </MenuItem>,
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

    return (
        <>
            <div className={classes.wrapper} onClick={openMenu}>
                <div className={classes.button}>
                    <MaskbookSharpIconOfSize classes={{ root: classes.icon }} size={22} />
                    <Typography className={classes.title}>Mask Network</Typography>
                </div>
            </div>
            {menu}

            <div className={classes.wrapper} onClick={openWallet}>
                <div className={classes.button}>
                    {selectedWallet ? (
                        <div className={classes.iconWrapper}>
                            <ProviderIcon
                                classes={{ icon: classes.icon }}
                                size={24}
                                providerType={selectedWalletProvider}
                            />
                            <NetworkIcon
                                size={14}
                                classes={{ icon: classes.networkIcon }}
                                networkType={selectedNetwork}
                            />
                        </div>
                    ) : (
                        <WalletSharp classes={{ root: classes.icon }} size={24} />
                    )}

                    <Typography className={classes.title}>
                        {account ? formatEthereumAddress(account, 4) : 'Connect Wallet'}
                        {chainId !== ChainId.Mainnet && selectedWallet ? (
                            <FiberManualRecordIcon
                                className={classes.chainIcon}
                                style={{
                                    color: resolveChainColor(chainId),
                                }}
                            />
                        ) : null}
                    </Typography>
                </div>
            </div>
            {isClaimAllDialogOpen ? (
                <ChainState.Provider>
                    <ClaimAllDialog open={isClaimAllDialogOpen} onClose={onClaimAllDialogClose} />
                </ChainState.Provider>
            ) : null}
        </>
    )
}
