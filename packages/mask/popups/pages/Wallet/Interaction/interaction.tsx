import { type ReasonableMessage } from '@masknet/web3-shared-base'
import { EthereumMethodType, type MessageRequest } from '@masknet/web3-shared-evm'
import React, { memo, startTransition, useCallback, useRef, useState } from 'react'
import type { JsonRpcResponse } from 'web3-types'
import { WatchTokenRequest } from './WatchTokenRequest.js'
import { WalletSignRequest } from './WalletSignRequest.js'
import { TransactionRequest } from './TransactionRequest.js'
import { Box, Dialog, DialogActions, DialogContent, DialogContentText, IconButton, Typography } from '@mui/material'
import { BottomController } from '../../../components/BottomController/index.js'
import { ActionButton, makeStyles, usePopupCustomSnackbar } from '@masknet/theme'
import { useMaskSharedTrans } from '../../../../shared-ui/index.js'
import { Icons } from '@masknet/icons'
import { useAsyncFn } from 'react-use'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import Services from '#services'
import { useNavigate } from 'react-router-dom'
import { PermissionRequest } from './PermissionRequest.js'
import { SwitchChainRequest } from './SwitchChainRequest.js'
import { AddChainRequest } from './AddChainRequest.js'
import { delay } from '@masknet/kit'

const useStyles = makeStyles()({
    left: {
        transform: 'rotate(90deg)',
    },
    right: {
        transform: 'rotate(-90deg)',
    },
    text: {
        fontSize: 12,
        fontWeight: 700,
        lineHeight: '16px',
    },
})

interface InteractionProps {
    currentRequest: ReasonableMessage<MessageRequest, JsonRpcResponse>
    totalMessages: number
    currentMessageIndex: number
    setMessageIndex(count: number): void

    paymentToken: string
    setPaymentToken: (paymentToken: string) => void

    setPendingAction: (pendingAction: undefined | Promise<void>) => void
}

export const Interaction = memo((props: InteractionProps) => {
    const { currentRequest } = props
    const t = useMaskSharedTrans()
    const navigate = useNavigate()
    const { Message } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const { showSnackbar } = usePopupCustomSnackbar()

    const [isDangerRequest, setIsDanger] = useState(false)
    const [confirmDisabled, setConfirmDisabled] = useState(false)
    const [dangerDialogOpen, setDangerDialogOpen] = useState(false)
    const [confirmVerb, setConfirmVerb] = useState(t.confirm())
    const confirmAction = useRef<(lastRequest: boolean) => Promise<void>>(async () => {})
    const hasOrigin = !!currentRequest.origin

    const onRequestCountMightChanged = useCallback(() => {
        // if there are still requests, do nothing here to let it show
        const hasImmediateRequest = Message!.messages.getCurrentValue().length
        if (hasImmediateRequest) return

        // in case some websites send requests sequentially, we can avoid remove the current window and create a new one
        const futureRequest = new Promise<void>((resolve) => {
            const undo = Message!.messages.subscribe(() => Message!.messages.getCurrentValue().length && resolve())
            delay(300).then(resolve).then(undo)
        }).then(async () => {
            // if there are new requests 300ms later, we do nothing and stop the Suspense
            const hasSequentialRequest = Message!.messages.getCurrentValue().length
            if (hasSequentialRequest) return

            if (hasOrigin) await Services.Helper.removePopupWindow()
            else navigate(PopupRoutes.Wallet, { replace: true })
        })

        startTransition(() => props.setPendingAction(futureRequest))
        return futureRequest.finally(() => props.setPendingAction(undefined))
    }, [Message, hasOrigin, navigate, props.setPendingAction])

    const [{ loading: cancelLoading }, onCancel] = useAsyncFn(async () => {
        await Message!.rejectRequest(currentRequest.ID)
        await onRequestCountMightChanged()
    }, [currentRequest.ID, Message, onRequestCountMightChanged])

    const isLastRequest = props.totalMessages === 1
    const [{ loading: confirmLoading }, onConfirm] = useAsyncFn(async () => {
        try {
            await confirmAction.current(isLastRequest)
            await onRequestCountMightChanged()
        } catch (error) {
            showSnackbar(
                <Typography textAlign="center" width="275px">
                    {t.popups_wallet_rpc_error()}
                    <br />
                    {String((error as any).message)}
                </Typography>,
                { variant: 'error', autoHideDuration: 5000 },
            )
        }
    }, [isLastRequest, onRequestCountMightChanged, showSnackbar, t])

    const actionRunning = confirmLoading || cancelLoading
    const CancelButton = (
        <ActionButton
            loading={cancelLoading}
            disabled={actionRunning}
            onClick={() => {
                if (isDangerRequest && dangerDialogOpen) setDangerDialogOpen(false)
                else onCancel()
            }}
            fullWidth
            variant="outlined">
            {t.cancel()}
        </ActionButton>
    )
    const ConfirmButton = (
        <ActionButton
            loading={confirmLoading}
            disabled={actionRunning || confirmDisabled}
            sx={isDangerRequest ? { background: (theme) => theme.palette.maskColor.danger } : undefined}
            onClick={() => {
                if (isDangerRequest && !dangerDialogOpen) return setDangerDialogOpen(true)
                else onConfirm()
            }}
            fullWidth>
            {confirmVerb}
        </ActionButton>
    )
    const InteractionItem = getInteractionComponent(props.currentRequest.request.arguments.method)

    return (
        <Box flex={1} display="flex" flexDirection="column">
            <Box p={2} display="flex" flexDirection="column" flex={1} maxHeight="calc(100vh - 142px)" overflow="auto">
                <InteractionItem
                    paymentToken={props.paymentToken}
                    setPaymentToken={props.setPaymentToken}
                    setConfirmDisabled={setConfirmDisabled}
                    currentRequest={currentRequest}
                    setConfirmVerb={setConfirmVerb}
                    setIsDanger={setIsDanger}
                    setConfirmAction={useCallback((f) => (confirmAction.current = f), [])}
                />
                <Pager {...props} />
            </Box>
            {dangerDialogOpen ?
                <DangerDialog cancel={ConfirmButton} confirm={CancelButton} />
            :   null}
            <BottomController>
                {CancelButton}
                {ConfirmButton}
            </BottomController>
        </Box>
    )
})
Interaction.displayName = 'Interaction'

export interface InteractionItemProps {
    currentRequest: ReasonableMessage<MessageRequest, JsonRpcResponse>
    setIsDanger(isDanger: boolean): void
    setConfirmVerb(verb: string): void
    setConfirmAction(action: (isLastRequest: boolean) => Promise<void>): void
    setConfirmDisabled(disabled: boolean): void

    // transaction only
    paymentToken: string
    setPaymentToken: (paymentToken: string) => void
}
function getInteractionComponent(type: EthereumMethodType) {
    switch (type) {
        case EthereumMethodType.wallet_watchAsset:
            return WatchTokenRequest
        case EthereumMethodType.wallet_requestPermissions:
            return PermissionRequest
        case EthereumMethodType.wallet_addEthereumChain:
            return AddChainRequest
        case EthereumMethodType.wallet_switchEthereumChain:
            return SwitchChainRequest
        case EthereumMethodType.eth_sign:
        case EthereumMethodType.eth_signTypedData_v4:
        case EthereumMethodType.personal_sign:
            return WalletSignRequest
        default:
            return TransactionRequest
    }
}

const Pager = memo((props: InteractionProps) => {
    const { currentMessageIndex, currentRequest, setMessageIndex, totalMessages } = props
    const { classes } = useStyles()
    const t = useMaskSharedTrans()
    const navigate = useNavigate()
    const { Message } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const [{ loading: cancelAllLoading }, handleCancelAllRequest] = useAsyncFn(async () => {
        await Message!.rejectRequests({ keepChainUnrelated: false, keepNonceUnrelated: false })
        if (currentRequest.origin) await Services.Helper.removePopupWindow()
        else navigate(PopupRoutes.Wallet, { replace: true })
    }, [Message, currentRequest.origin])

    if (totalMessages <= 1) return null
    return (
        <Box display="flex" flexDirection="column" alignItems="center" marginTop="auto">
            <Box display="flex" alignItems="center">
                <IconButton
                    disabled={currentMessageIndex === 0}
                    onClick={() => startTransition(() => setMessageIndex(currentMessageIndex - 1))}>
                    <Icons.ArrowDrop size={16} className={classes.left} />
                </IconButton>
                <Typography className={classes.text}>
                    {t.popups_wallet_multiple_requests({
                        index: String(currentMessageIndex + 1),
                        total: String(totalMessages),
                    })}
                </Typography>
                <IconButton
                    onClick={() => startTransition(() => setMessageIndex(currentMessageIndex + 1))}
                    disabled={currentMessageIndex === totalMessages - 1}>
                    <Icons.ArrowDrop size={16} className={classes.right} />
                </IconButton>
            </Box>

            <ActionButton variant="text" color="info" onClick={handleCancelAllRequest} loading={cancelAllLoading}>
                {t.popups_wallet_reject_all_requests({ total: String(totalMessages) })}
            </ActionButton>
        </Box>
    )
})
Pager.displayName = 'Pager'

function DangerDialog({ cancel, confirm }: Record<'cancel' | 'confirm', React.ReactNode>) {
    const t = useMaskSharedTrans()
    return (
        <Dialog open>
            <DialogContent>
                <DialogContentText variant="overline">
                    {t.popups_wallet_sign_in_danger_confirm_title()}
                </DialogContentText>
                <DialogContentText color={(theme) => theme.palette.maskColor.danger}>
                    {t.popups_wallet_sign_in_danger_confirm()}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                {cancel}
                {confirm}
            </DialogActions>
        </Dialog>
    )
}
