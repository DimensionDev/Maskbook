import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ActionButton, makeStyles, usePortalShadowRoot } from '@masknet/theme'
import { Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'
import { PluginClaimMessage } from '../../../message.js'
import { useCallback, useState } from 'react'
import { useFungibleToken } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { isValidAddress } from '@masknet/web3-shared-evm'
import { Icons } from '@masknet/icons'
import { ImageIcon } from '@masknet/shared'
import { useI18N } from '../../../locales/i18n_generated.js'
import { useSNSAdaptorContext } from '@masknet/plugin-infra/content-script'

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
    },
    actions: {
        padding: '0px 16px 16px',
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
}))

export function ClaimSuccessDialog() {
    const t = useI18N()
    const { classes } = useStyles()
    const [tokenAddress, setTokenAddress] = useState<string | undefined>()
    const [amount, setAmount] = useState<string | undefined>()

    const { share } = useSNSAdaptorContext()

    const { open, closeDialog } = useRemoteControlledDialog(PluginClaimMessage.claimSuccessDialogEvent, (ev) => {
        if (!ev.open) {
            setAmount(undefined)
            setTokenAddress(undefined)
            return
        }

        setAmount(ev.amount)

        if (isValidAddress(ev.token)) setTokenAddress(ev.token)
    })

    const tokenDetail = useFungibleToken(NetworkPluginID.PLUGIN_EVM, tokenAddress)

    const onShare = useCallback(() => {
        if (!amount || !tokenDetail.value) return

        share?.(t.share_text({ amount, symbol: tokenDetail.value?.symbol }))
    }, [share, amount, tokenDetail.value?.symbol])

    return usePortalShadowRoot((container) => (
        <Dialog container={container} open={open} onClose={closeDialog} classes={{ paper: classes.paper }}>
            <DialogTitle className={classes.title}>
                <Icons.Close className={classes.close} onClick={closeDialog} />
                {t.tips()}
            </DialogTitle>
            <DialogContent className={classes.content}>
                <ImageIcon icon={tokenDetail.value?.logoURL} size={90} />
                <Typography className={classes.symbol}>
                    {amount} {tokenDetail.value?.symbol}
                </Typography>
                <Typography className={classes.congratulations}>{t.congratulations()}</Typography>
                {amount && tokenDetail.value ? (
                    <Typography className={classes.tips}>
                        {t.claim_successfully_tips({ amount, symbol: tokenDetail.value.symbol })}
                    </Typography>
                ) : null}
            </DialogContent>
            <DialogActions className={classes.actions}>
                <ActionButton fullWidth onClick={onShare}>
                    {t.share()}
                </ActionButton>
            </DialogActions>
        </Dialog>
    ))
}
