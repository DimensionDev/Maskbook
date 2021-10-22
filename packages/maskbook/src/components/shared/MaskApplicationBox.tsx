import { Typography } from '@mui/material'
import { useCallback } from 'react'
import { makeStyles } from '@masknet/theme'
import { getMaskColor } from '@masknet/theme'
import { MaskMessages } from '../../utils/messages'
import { useControlledDialog } from '../../utils/hooks/useControlledDialog'
import { RedPacketPluginID } from '../../plugins/RedPacket/constants'
import { FileServicePluginID } from '../../plugins/FileService/constants'
import { ITO_PluginID } from '../../plugins/ITO/constants'
import { ClaimAllDialog } from '../../plugins/ITO/SNSAdaptor/ClaimAllDialog'

const useStyles = makeStyles()((theme) => ({
    applicationBox: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: getMaskColor(theme).twitterBackground,
        borderRadius: '8px',
        cursor: 'pointer',
        height: 100,
        '&:hover': {
            transform: 'translateX(2.5px) translateY(-2px)',
            boxShadow: theme.palette.mode === 'light' ? '0px 12px 28px rgba(0, 0, 0, 0.1)' : 'none',
        },
    },
    applicationWrapper: {
        display: 'grid',
        gridTemplateColumns: '123px 123px 123px 123px',
        gridTemplateRows: '100px',
        rowGap: 12,
        justifyContent: 'space-between',
        height: 324,
    },
    applicationImg: {
        width: 36,
        height: 36,
        marginBottom: 10,
    },
}))

interface MaskApplicationBoxProps {}

export function MaskApplicationBox({}: MaskApplicationBoxProps) {
    const { classes } = useStyles()
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

    //#region Claim All ITO
    const {
        open: isClaimAllDialogOpen,
        onOpen: onClaimAllDialogOpen,
        onClose: onClaimAllDialogClose,
    } = useControlledDialog()
    //#endregion

    return (
        <>
            <section className={classes.applicationWrapper}>
                {[
                    {
                        title: 'Lucky Drop',
                        img: new URL('./assets/lucky_drop.png', import.meta.url).toString(),
                        onClick: useCallback(() => {
                            openEncryptedMessage(RedPacketPluginID)
                        }, []),
                    },
                    {
                        title: 'File service',
                        img: new URL('./assets/files.png', import.meta.url).toString(),
                        onClick: useCallback(() => {
                            openEncryptedMessage(FileServicePluginID)
                        }, []),
                    },
                    {
                        title: 'ITO',
                        img: new URL('./assets/token.png', import.meta.url).toString(),
                        onClick: useCallback(() => {
                            openEncryptedMessage(ITO_PluginID)
                        }, []),
                    },
                    {
                        title: 'Claim',
                        img: new URL('./assets/gift.png', import.meta.url).toString(),
                        onClick: onClaimAllDialogOpen,
                    },
                    {
                        title: 'Mask Bridge',
                        img: new URL('./assets/bridge.png', import.meta.url).toString(),
                    },
                    {
                        title: 'Mask Box',
                        img: new URL('./assets/mask_box.png', import.meta.url).toString(),
                    },
                    {
                        title: 'Swap',
                        img: new URL('./assets/swap.png', import.meta.url).toString(),
                    },
                    {
                        title: 'Fiat on/off ramp',
                        img: new URL('./assets/fiat_ramp.png', import.meta.url).toString(),
                    },
                    {
                        title: 'NFTs',
                        img: new URL('./assets/nft.png', import.meta.url).toString(),
                    },
                    {
                        title: 'Investment',
                        img: new URL('./assets/investment.png', import.meta.url).toString(),
                    },
                    {
                        title: 'Saving',
                        img: new URL('./assets/saving.png', import.meta.url).toString(),
                    },
                    {
                        title: 'Alternative',
                        img: new URL('./assets/more.png', import.meta.url).toString(),
                    },
                ].map(({ title, img, onClick }, i) => (
                    <div className={classes.applicationBox} onClick={onClick} key={i.toString()}>
                        <img src={img} className={classes.applicationImg} />
                        <Typography color="textPrimary">{title}</Typography>
                    </div>
                ))}
            </section>
            {isClaimAllDialogOpen ? (
                <ClaimAllDialog open={isClaimAllDialogOpen} onClose={onClaimAllDialogClose} />
            ) : null}
        </>
    )
}
