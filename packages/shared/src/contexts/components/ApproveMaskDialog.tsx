import { BigNumber } from 'bignumber.js'
import { noop } from 'lodash-es'
import { memo, useCallback, useMemo, useState } from 'react'
import { Icons } from '@masknet/icons'
import type { NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, makeStyles, usePortalShadowRoot } from '@masknet/theme'
import { useChainContext, useFungibleToken, useNetworkContext, useWeb3Others } from '@masknet/web3-hooks-base'
import { ApproveStateType, useERC20TokenApproveCallback } from '@masknet/web3-hooks-evm'
import { toFixed } from '@masknet/web3-shared-base'
import { useSmartPayConstants } from '@masknet/web3-shared-evm'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, InputBase, Typography } from '@mui/material'
import { useSharedI18N } from '../../index.js'

const useStyles = makeStyles()((theme) => ({
    paper: {
        margin: 0,
        maxWidth: 320,
        background: theme.palette.maskColor.bottom,
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

export interface ApproveMaskDialogProps {
    open: boolean
    handleClose: () => void
}
export const ApproveMaskDialog = memo<ApproveMaskDialogProps>(({ open, handleClose }) => {
    const sharedI18N = useSharedI18N()
    const { classes } = useStyles()
    const Others = useWeb3Others()
    const [amount, setAmount] = useState('')
    const { pluginID } = useNetworkContext()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    const maskAddress = Others.getMaskTokenAddress(chainId)
    const { value: maskToken } = useFungibleToken(pluginID, maskAddress)
    const { PAYMASTER_MASK_CONTRACT_ADDRESS } = useSmartPayConstants(chainId)

    const [{ type: approveStateType }, transactionState, approveCallback] = useERC20TokenApproveCallback(
        maskAddress ?? '',
        maskToken ? toFixed(new BigNumber(amount).shiftedBy(maskToken.decimals ?? 0).integerValue()) : '',
        PAYMASTER_MASK_CONTRACT_ADDRESS ?? '',
        noop,
        chainId,
    )

    const onApprove = useCallback(async () => {
        if (approveStateType !== ApproveStateType.NOT_APPROVED) return
        await approveCallback(true)
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
        return (
            <ActionButton fullWidth variant="roundedContained" disabled>
                {sharedI18N.dialog_confirm()}
            </ActionButton>
        )
    }, [approveStateType, approveCallback, sharedI18N, transactionState, onApprove])

    return usePortalShadowRoot((container) => (
        <Dialog container={container} open={open} onClose={handleClose} classes={{ paper: classes.paper }}>
            <DialogTitle sx={{ py: 3 }}>
                <Typography className={classes.title}>{sharedI18N.approve_mask()}</Typography>
            </DialogTitle>
            <DialogContent>
                <Typography className={classes.description}>{sharedI18N.approve_mask_description()}</Typography>
                <Typography className={classes.description} marginTop={2}>
                    {sharedI18N.approve_mask_question()}
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
                <Button fullWidth variant="roundedOutlined" onClick={handleClose}>
                    {sharedI18N.cancel()}
                </Button>
            </DialogActions>
        </Dialog>
    ))
})
