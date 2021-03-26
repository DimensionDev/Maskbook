import { Button, makeStyles, Typography, MenuItem } from '@material-ui/core'
import { MaskbookSharpIcon } from '../../resources/MaskbookIcon'
import { ToolIconURLs } from '../../resources/tool-icon'
import { Image } from '../shared/Image'
import { BreakdownDialog } from './BreakdownDialog'
import { useMenu } from '../../utils/hooks/useMenu'
import { useChainId } from '../../web3/hooks/useChainState'
import { useConstant } from '../../web3/hooks/useConstant'
import { CONSTANTS } from '../../web3/constants'
import { createERC20Token } from '../../web3/helpers'
import { useERC20TokenBalance } from '../../web3/hooks/useERC20TokenBalance'
import { useMemo, useState, useCallback } from 'react'
import { MaskMessage } from '../../utils/messages'
import { RedPacketCompositionEntry } from '../../plugins/RedPacket/define'
import { FileServiceCompositionEntry } from '../../plugins/FileService/UI-define'
import { ITO_CompositionEntry } from '../../plugins/ITO/define'
import { useAccount } from '../../web3/hooks/useAccount'
import { useRemoteControlledDialog } from '../../utils/hooks/useRemoteControlledDialog'
import { PluginTransakMessages } from '../../plugins/Transak/messages'
import { Flags } from '../../utils/flags'

const useStyles = makeStyles((theme) => ({
    wrapper: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        padding: '12px 26px 12px 12px',
        cursor: 'pointer',
        [theme.breakpoints.down('lg')]: {
            transform: 'translateX(-6px)',
            padding: 12,
        },
        '&:hover': {
            '& $text': {
                color: theme.palette.primary.main,
            },
            '& $icon': {
                color: theme.palette.primary.main,
            },
        },
    },
    text: {
        color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(15, 20, 25)',
        fontWeight: 700,
        fontSize: 20,
        marginLeft: 22,
        [theme.breakpoints.down('lg')]: {
            display: 'none',
        },
    },
    icon: {
        color: theme.palette.mode === 'dark' ? 'rgb(255, 255, 255)' : 'rgb(15, 20, 25)',
    },
}))

export function ToolboxHint() {
    const classes = useStyles()
    const account = useAccount()

    //#region Airdrop
    const chainId = useChainId()
    const MASK_ADDRESS = useConstant(CONSTANTS, 'MASK_ADDRESS')
    const maskToken = useMemo(() => createERC20Token(chainId, MASK_ADDRESS, 18, 'Mask Network', 'MASK'), [
        chainId,
        MASK_ADDRESS,
    ])

    const {
        value: maskBalance = '0',
        error: maskBalanceError,
        loading: maskBalanceLoading,
        retry: maskBalanceRetry,
    } = useERC20TokenBalance(MASK_ADDRESS)

    const [breakdownDialogOpen, setBreakdownDialogOpen] = useState(false)

    const openAirdrop = useCallback(() => {
        if (maskBalanceError) maskBalanceRetry()
        setBreakdownDialogOpen(true)
    }, [maskBalanceError, maskBalanceRetry])

    const onBreakdownDialogClose = useCallback(() => {
        setBreakdownDialogOpen(false)
    }, [])
    //#endregion

    //#region Encrypted message
    const openEncryptedMessage = useCallback(
        () => MaskMessage.events.compositionUpdated.sendToLocal({ reason: 'timeline', open: true }),
        [],
    )
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
        <>
            <MenuItem onClick={openEncryptedMessage}>
                <Image src={ToolIconURLs.encryptedmsg.image} width={24} height={24} />
                <Typography className={classes.text}>{ToolIconURLs.encryptedmsg.text}</Typography>
            </MenuItem>
            <MenuItem onClick={openRedPacket}>
                <Image src={ToolIconURLs.redpacket.image} width={24} height={24} />
                <Typography className={classes.text}>{ToolIconURLs.redpacket.text}</Typography>
            </MenuItem>
            <MenuItem onClick={openFileService}>
                <Image src={ToolIconURLs.files.image} width={24} height={24} />
                <Typography className={classes.text}>{ToolIconURLs.files.text}</Typography>
            </MenuItem>
            <MenuItem onClick={openITO}>
                <Image src={ToolIconURLs.markets.image} width={24} height={24} />
                <Typography className={classes.text}>{ToolIconURLs.markets.text}</Typography>
            </MenuItem>
            {account && Flags.transak_enabled ? (
                <MenuItem onClick={openBuyCurrency}>
                    <Image src={ToolIconURLs.token.image} width={24} height={24} />
                    <Typography className={classes.text}>{ToolIconURLs.token.text}</Typography>
                </MenuItem>
            ) : null}
            {Flags.airdrop_enabled ? (
                <MenuItem onClick={openAirdrop}>
                    <Image src={ToolIconURLs.airdrop.image} width={24} height={24} />
                    <Typography className={classes.text}>{ToolIconURLs.airdrop.text}</Typography>
                </MenuItem>
            ) : null}
        </>,
    )

    return (
        <>
            <Button className={classes.wrapper} onClick={openMenu}>
                <MaskbookSharpIcon classes={{ root: classes.icon }} />
                <Typography className={classes.text}>Mask</Typography>
            </Button>
            {menu}
            {maskToken ? (
                <BreakdownDialog
                    open={breakdownDialogOpen}
                    token={maskToken}
                    balance={maskBalance}
                    onUpdateBalance={maskBalanceRetry}
                    onClose={onBreakdownDialogClose}
                />
            ) : null}
        </>
    )
}
