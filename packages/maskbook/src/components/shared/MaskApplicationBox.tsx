import { Typography } from '@mui/material'
import { useCallback } from 'react'
import { makeStyles } from '@masknet/theme'
import { getMaskColor } from '@masknet/theme'
import { MaskMessages } from '../../utils/messages'
import { RedPacketPluginID } from '../../plugins/RedPacket/constants'

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
            boxShadow: `0px 12px 28px ${
                theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.02)'
            }`,
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

interface MaskApplicationBoxProps {
    closeDialog?: () => void
}

export function MaskApplicationBox({ closeDialog }: MaskApplicationBoxProps) {
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
    return (
        <section className={classes.applicationWrapper}>
            {[
                {
                    title: 'Lucky Drop',
                    img: new URL('./assets/lucky_drop.png', import.meta.url).toString(),
                    onClick: useCallback(() => {
                        openEncryptedMessage(RedPacketPluginID)
                        closeDialog?.()
                    }, []),
                },
                {
                    title: 'File service',
                    img: new URL('./assets/files.png', import.meta.url).toString(),
                },
                {
                    title: 'ITO',
                    img: new URL('./assets/token.png', import.meta.url).toString(),
                },
                {
                    title: 'Claim',
                    img: new URL('./assets/gift.png', import.meta.url).toString(),
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
            ].map(({ title, img, onClick }) => (
                <div className={classes.applicationBox} onClick={onClick}>
                    <img src={img} className={classes.applicationImg} />
                    <Typography>{title}</Typography>
                </div>
            ))}
        </section>
    )
}
