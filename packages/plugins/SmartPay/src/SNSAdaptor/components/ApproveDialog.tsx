import { Icons } from '@masknet/icons'
import { useSharedI18N } from '@masknet/shared'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ActionButton, makeStyles, usePortalShadowRoot } from '@masknet/theme'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { ApproveStateType, useERC20TokenApproveCallback } from '@masknet/web3-hooks-evm'
import { ChainId, useSmartPayConstants } from '@masknet/web3-shared-evm'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, InputBase, Typography } from '@mui/material'
import { noop } from 'lodash-es'
import { memo, useCallback, useMemo, useState } from 'react'
import { useI18N } from '../../locales/i18n_generated.js'
import { PluginSmartPayMessages } from '../../message.js'

const useStyles = makeStyles()((theme) => ({
    paper: {
        margin: 0,
        maxWidth: 320,
        backgroundColor: theme.palette.maskColor.bottom,
    },
    title: {
        textAlign: 'center',
        fontSize: 16,
        lineHeight: '20px',
        fontWeight: 700,
        color: theme.palette.maskColor.main,
    },
    description: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.second,
    },
    actions: {
        display: 'flex',
        flexDirection: 'column',
        padding: theme.spacing(3),
        rowGap: theme.spacing(2),
    },
}))

export const ApproveMaskDialog = memo(() => {
    const t = useI18N()
    const sharedI18N = useSharedI18N()
    const { classes } = useStyles()
    const { open, closeDialog } = useRemoteControlledDialog(PluginSmartPayMessages.approveDialogEvent)
    const { Others } = useWeb3State()
    const [amount, setAmount] = useState('')

    const maskAddress = Others?.getMaskTokenAddress(ChainId.Matic)
    const { EP_CONTRACT_ADDRESS } = useSmartPayConstants(ChainId.Matic)

    const [{ type: approveStateType }, transactionState, approveCallback] = useERC20TokenApproveCallback(
        maskAddress ?? '',
        amount,
        EP_CONTRACT_ADDRESS ?? '',
        noop,
        ChainId.Matic,
    )

    const onApprove = useCallback(async () => {
        if (approveStateType !== ApproveStateType.NOT_APPROVED) return
        await approveCallback(false)
    }, [approveStateType, transactionState, approveCallback])

    const action = useMemo(() => {
        if (approveStateType === ApproveStateType.UNKNOWN) {
            return (
                <ActionButton fullWidth variant="roundedContained" disabled>
                    {sharedI18N.wallet_transfer_error_amount_absence()}
                </ActionButton>
            )
        }
        if (approveStateType === ApproveStateType.FAILED) {
            return (
                <ActionButton fullWidth variant="roundedContained" color="error">
                    {sharedI18N.wallet_load_retry({ symbol: 'MASK' })}
                </ActionButton>
            )
        }
        if (
            approveStateType === ApproveStateType.NOT_APPROVED ||
            transactionState.loading ||
            approveStateType === ApproveStateType.UPDATING
        ) {
            return (
                <ActionButton
                    loading={transactionState.loading || approveStateType === ApproveStateType.UPDATING}
                    fullWidth
                    variant="roundedContained"
                    onClick={onApprove}>
                    {sharedI18N.dialog_confirm()}
                </ActionButton>
            )
        }
        return null
    }, [approveStateType, approveCallback, sharedI18N, transactionState, onApprove])

    return usePortalShadowRoot((container) => (
        <Dialog container={container} open={open} onClose={closeDialog} classes={{ paper: classes.paper }}>
            <DialogTitle sx={{ py: 3 }}>
                <Typography className={classes.title}>{t.approve_mask()}</Typography>
            </DialogTitle>
            <DialogContent>
                <Typography className={classes.description}>{t.approve_mask_description()}</Typography>
                <Typography className={classes.description} marginTop={2}>
                    {t.approve_mask_question()}
                </Typography>
                <InputBase
                    sx={{ mt: 3 }}
                    fullWidth
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    endAdornment={
                        <Typography display="flex" alignItems="center" columnGap={1} fontSize={15} lineHeight="20px">
                            <Icons.MaskBlue size={20} /> MASK
                        </Typography>
                    }
                />
            </DialogContent>
            <DialogActions className={classes.actions}>
                {action}
                <Button fullWidth variant="roundedOutlined" onClick={closeDialog}>
                    {sharedI18N.cancel()}
                </Button>
            </DialogActions>
        </Dialog>
    ))
})
