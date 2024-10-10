import { ActionButton, makeStyles, usePortalShadowRoot } from '@masknet/theme'
import { Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import { useCallback } from 'react'
import { useFungibleToken } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { Icons } from '@masknet/icons'
import { ImageIcon } from '@masknet/shared'
import { share } from '@masknet/plugin-infra/content-script/context'
import { Trans, msg } from '@lingui/macro'
import { useLingui } from '@lingui/react'

const useStyles = makeStyles()((theme) => ({
    paper: {
        margin: 0,
        width: 420,
        backgroundColor: theme.palette.maskColor.bottom,
    },
    title: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.maskColor.modalTitleBg,
        fontSize: 18,
        lineHeight: '24px',
        fontWeight: 700,
    },
    close: {
        position: 'absolute',
        left: 16,
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '34px 16px 50px',
        backgroundColor: theme.palette.maskColor.bottom,
    },
    actions: {
        padding: '0px 16px 16px',
        backgroundColor: theme.palette.maskColor.bottom,
    },
    symbol: {
        fontSize: 20,
        lineHeight: '24px',
        fontWeight: 700,
        marginTop: 10,
    },
    congratulations: {
        fontSize: 20,
        lineHeight: '24px',
        fontWeight: 700,
        color: theme.palette.maskColor.success,
        marginTop: 34,
    },
    tips: {
        fontSize: 16,
        lineHeight: '20px',
        color: theme.palette.maskColor.second,
        marginTop: 14,
    },
    icon: {
        objectFit: 'contain',
    },
}))

interface Props {
    open: boolean
    onClose(): void
    amount?: string
    tokenAddress?: string
}
export function ClaimSuccessDialog({ open, onClose, amount, tokenAddress }: Props) {
    const { _ } = useLingui()
    const { classes } = useStyles()

    const { data: tokenDetail } = useFungibleToken(NetworkPluginID.PLUGIN_EVM, tokenAddress)

    const onShare = useCallback(() => {
        if (!amount || !tokenDetail) return

        share?.(
            _(msg`I just claimed airdrop with ${amount} ${tokenDetail.symbol} on Mask Network extension. Follow @realMaskNetwork to check if you are eligible to claim. 
 Install https://mask.io to explore more airdrop activities.`),
        )
    }, [amount, tokenDetail?.symbol])

    return usePortalShadowRoot((container) => (
        <Dialog container={container} open={open} onClose={onClose} classes={{ paper: classes.paper }}>
            <DialogTitle className={classes.title}>
                <Icons.Close className={classes.close} onClick={onClose} />
                <Trans>Claim</Trans>
            </DialogTitle>
            <DialogContent className={classes.content} style={{ paddingTop: 34 }}>
                <ImageIcon icon={tokenDetail?.logoURL} size={90} className={classes.icon} />
                <Typography className={classes.symbol}>
                    {amount} {tokenDetail?.symbol}
                </Typography>
                <Typography className={classes.congratulations}>
                    <Trans>Congratulations!</Trans>
                </Typography>
                {amount && tokenDetail ?
                    <Typography className={classes.tips}>
                        <Trans>
                            Claimed {amount} ${tokenDetail.symbol} successfully.
                        </Trans>
                    </Typography>
                :   null}
            </DialogContent>
            <DialogActions className={classes.actions}>
                <ActionButton fullWidth onClick={onShare}>
                    <Trans>Share</Trans>
                </ActionButton>
            </DialogActions>
        </Dialog>
    ))
}
