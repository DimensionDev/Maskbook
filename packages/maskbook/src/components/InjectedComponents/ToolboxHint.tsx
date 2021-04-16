import { makeStyles, Typography, MenuItem } from '@material-ui/core'
import { MaskbookSharpIconOfSize } from '../../resources/MaskbookIcon'
import { ToolIconURLs } from '../../resources/tool-icon'
import { Image } from '../shared/Image'
import { useMenu } from '../../utils/hooks/useMenu'
import { useCallback } from 'react'
import { MaskMessage } from '../../utils/messages'
import { RedPacketCompositionEntry } from '../../plugins/RedPacket/define'
import { FileServiceCompositionEntry } from '../../plugins/FileService/UI-define'
import { ITO_CompositionEntry } from '../../plugins/ITO/define'
import { useAccount } from '../../web3/hooks/useAccount'
import { useRemoteControlledDialog } from '../../utils/hooks/useRemoteControlledDialog'
import { PluginTransakMessages } from '../../plugins/Transak/messages'
import { Flags } from '../../utils/flags'
import { useStylesExtends } from '../custom-ui-helper'
import classNames from 'classnames'
import { useWallet } from '../../plugins/Wallet/hooks/useWallet'
import { ProviderIcon } from '../shared/ProviderIcon'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { currentSelectedWalletProviderSettings } from '../../plugins/Wallet/settings'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { useEtherTokenBalance } from '../../web3/hooks/useEtherTokenBalance'
import { formatBalance } from '../../plugins/Wallet/formatter'
import BigNumber from 'bignumber.js'
import { AccountBalanceWallet } from '@material-ui/icons'

const useStyles = makeStyles((theme) => ({
    paper: {
        borderRadius: 4,
        boxShadow: `${
            theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.2) 0px 0px 15px, rgba(255, 255, 255, 0.15) 0px 0px 3px 1px'
                : 'rgba(101, 119, 134, 0.2) 0px 0px 15px, rgba(101, 119, 134, 0.15) 0px 0px 3px 1px'
        }`,
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
            '& $balance': {
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
        color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(15, 20, 25)',
        fontWeight: 700,
        fontSize: 20,
        marginLeft: 22,
        lineHeight: 1.35,
        [theme.breakpoints.down('lg')]: {
            display: 'none',
        },
    },
    balance: {
        color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(15, 20, 25)',
        fontWeight: 700,
        fontSize: 16,
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
    icon: {
        color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(15, 20, 25)',
        width: 24,
        height: 24,
        fontSize: 24,
    },
    wallet: {
        display: 'block',
    },
}))

interface ToolboxHintProps extends withClasses<never> {}
export function ToolboxHint(props: ToolboxHintProps) {
    const classes = useStylesExtends(useStyles(), props)
    const account = useAccount()
    const selectedWallet = useWallet()
    const selectedWalletProvider = useValueRef(currentSelectedWalletProviderSettings)
    const { value: balance = '0' } = useEtherTokenBalance(account)
    //#region Encrypted message
    const openEncryptedMessage = useCallback(
        () => MaskMessage.events.compositionUpdated.sendToLocal({ reason: 'timeline', open: true }),
        [],
    )
    //#endregion

    //#region Wallet
    const [, setSelectWalletDialogOpen] = useRemoteControlledDialog(WalletMessages.events.walletStatusDialogUpdated)
    const [, setSelectProviderDialogOpen] = useRemoteControlledDialog(WalletMessages.events.selectProviderDialogUpdated)
    const openWallet = useCallback(() => {
        if (selectedWallet) {
            setSelectWalletDialogOpen({
                open: true,
            })
        } else {
            setSelectProviderDialogOpen({
                open: true,
            })
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
    const [, setBuyDialogOpen] = useRemoteControlledDialog(PluginTransakMessages.events.buyTokenDialogUpdated)
    const openBuyCurrency = useCallback(() => {
        setBuyDialogOpen({
            open: true,
            address: account,
        })
    }, [])
    //#endregion

    // Todo: add a swap dialog

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
                    <MaskbookSharpIconOfSize classes={{ root: classes.icon }} size={24} />
                    <Typography className={classes.title}>Mask Network</Typography>
                </div>
            </div>
            {menu}

            <div className={classes.wrapper} onClick={openWallet}>
                <div className={classes.button}>
                    {selectedWallet ? (
                        <ProviderIcon
                            classes={{ icon: classes.icon }}
                            size={24}
                            providerType={selectedWalletProvider}
                        />
                    ) : (
                        <AccountBalanceWallet classes={{ root: classes.icon }} />
                    )}
                    <div className={classes.wallet}>
                        <Typography className={classes.title}>{selectedWallet?.name ?? 'Wallet'}</Typography>
                        {balance !== '0' ? (
                            <Typography className={classes.balance}>
                                balance: {formatBalance(new BigNumber(balance), 18, 4)}
                            </Typography>
                        ) : null}
                    </div>
                </div>
            </div>
        </>
    )
}
