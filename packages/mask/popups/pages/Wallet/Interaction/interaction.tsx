import Services from '#services'
import { Trans } from '@lingui/react/macro'
import { Icons } from '@masknet/icons'
import { delay } from '@masknet/kit'
import { NetworkPluginID, PopupRoutes } from '@masknet/shared-base'
import { ActionButton, makeStyles, useSnackbar } from '@masknet/theme'
import { useWeb3State } from '@masknet/web3-hooks-base'
import type { ReasonableMessage, JsonRpcResponse } from '@masknet/web3-shared-base'
import { EthereumMethodType, type MessageRequest } from '@masknet/web3-shared-evm'
import { Box, Dialog, DialogActions, DialogContent, DialogContentText, IconButton, Typography } from '@mui/material'
import React, { memo, startTransition, useCallback, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAsyncFn } from 'react-use'
import { BottomController } from '@masknet/injected-ui/BottomController'
import { AddChainRequest } from './AddChainRequest.js'
import { SwitchChainRequest } from './SwitchChainRequest.js'
import { TransactionRequest } from './TransactionRequest.js'
import { WalletSignRequest } from './WalletSignRequest.js'
import { WatchTokenRequest } from './WatchTokenRequest.js'

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

interface PagerProps {
    currentRequest: ReasonableMessage<MessageRequest, JsonRpcResponse>
    totalMessages: number
    currentMessageIndex: number
    setMessageIndex(count: number): void
}

interface InteractionProps extends PagerProps {
    setPendingAction: (pendingAction: undefined | Promise<void>) => void
}

export const Interaction = memo(function Interaction(props: InteractionProps) {
    const { currentRequest } = props
    const navigate = useNavigate()
    const { Message } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const { enqueueSnackbar } = useSnackbar()

    const [isDangerRequest, setIsDanger] = useState(false)
    const [confirmDisabled, setConfirmDisabled] = useState(false)
    const [dangerDialogOpen, setDangerDialogOpen] = useState(false)
    const [confirmVerb, setConfirmVerb] = useState<ReactNode>(<Trans>Confirm</Trans>)
    const confirmActionRef = useRef<(lastRequest: boolean) => Promise<void>>(async () => {})
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
            await confirmActionRef.current(isLastRequest)
            await onRequestCountMightChanged()
        } catch (error) {
            enqueueSnackbar(
                <Typography sx={{ textAlign: 'center', width: '275px' }}>
                    <Trans>There was a network or RPC provider error, please try again later!</Trans>
                    <br />
                    {String((error as any).message)}
                </Typography>,
                { variant: 'error', autoHideDuration: 5000 },
            )
        }
    }, [isLastRequest, onRequestCountMightChanged, enqueueSnackbar])

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
            <Trans>Cancel</Trans>
        </ActionButton>
    )
    const ConfirmButton = (
        <ActionButton
            loading={confirmLoading}
            disabled={actionRunning || confirmDisabled}
            sx={isDangerRequest ? { background: (theme) => theme.vars.palette.maskColor.danger } : undefined}
            onClick={() => {
                if (isDangerRequest && !dangerDialogOpen) return setDangerDialogOpen(true)
                else onConfirm()
            }}
            fullWidth>
            {confirmVerb}
        </ActionButton>
    )
    let InteractionComponent

    switch (props.currentRequest.request.arguments.method) {
        case EthereumMethodType.wallet_watchAsset:
            InteractionComponent = WatchTokenRequest
            break
        case EthereumMethodType.wallet_addEthereumChain:
            InteractionComponent = AddChainRequest
            break
        case EthereumMethodType.wallet_switchEthereumChain:
            InteractionComponent = SwitchChainRequest
            break
        case EthereumMethodType.eth_sign:
        case EthereumMethodType.eth_signTypedData_v4:
        case EthereumMethodType.personal_sign:
            InteractionComponent = WalletSignRequest
            break
        default:
            InteractionComponent = TransactionRequest
            break
    }

    return (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box
                sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    maxHeight: 'calc(100vh - 142px)',
                    overflow: 'auto',
                }}>
                <InteractionComponent
                    setConfirmDisabled={setConfirmDisabled}
                    currentRequest={currentRequest}
                    setConfirmVerb={setConfirmVerb}
                    setIsDanger={setIsDanger}
                    setConfirmAction={useCallback((f) => (confirmActionRef.current = f), [])}
                />
                <Pager {...props} />
            </Box>
            <BottomController>
                {CancelButton}
                {ConfirmButton}
            </BottomController>
            {dangerDialogOpen ?
                <DangerDialog cancel={ConfirmButton} confirm={CancelButton} />
            :   null}
        </Box>
    )
})
Interaction.displayName = 'Interaction'

export interface InteractionItemProps {
    currentRequest: ReasonableMessage<MessageRequest, JsonRpcResponse>
    setIsDanger(isDanger: boolean): void
    setConfirmVerb(verb: ReactNode): void
    setConfirmAction(action: (isLastRequest: boolean) => Promise<void>): void
    setConfirmDisabled(disabled: boolean): void
}

const Pager = memo(function Pager(props: PagerProps) {
    const { currentMessageIndex, currentRequest, setMessageIndex, totalMessages } = props
    const { classes } = useStyles()
    const navigate = useNavigate()
    const { Message } = useWeb3State(NetworkPluginID.PLUGIN_EVM)
    const [{ loading: cancelAllLoading }, handleCancelAllRequest] = useAsyncFn(async () => {
        await Message!.rejectRequests({ keepChainUnrelated: false, keepNonceUnrelated: false })
        if (currentRequest.origin) await Services.Helper.removePopupWindow()
        else navigate(PopupRoutes.Wallet, { replace: true })
    }, [Message, currentRequest.origin])

    if (totalMessages <= 1) return null
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton
                    disabled={currentMessageIndex === 0}
                    onClick={() => startTransition(() => setMessageIndex(currentMessageIndex - 1))}>
                    <Icons.ArrowDrop size={16} className={classes.left} />
                </IconButton>
                <Typography className={classes.text}>
                    <Trans>
                        Multiple transaction requests {String(currentMessageIndex + 1)} / {String(totalMessages)}
                    </Trans>
                </Typography>
                <IconButton
                    onClick={() => startTransition(() => setMessageIndex(currentMessageIndex + 1))}
                    disabled={currentMessageIndex === totalMessages - 1}>
                    <Icons.ArrowDrop size={16} className={classes.right} />
                </IconButton>
            </Box>

            <ActionButton variant="text" color="info" onClick={handleCancelAllRequest} loading={cancelAllLoading}>
                <Trans>Reject {totalMessages} Transactions</Trans>
            </ActionButton>
        </Box>
    )
})
Pager.displayName = 'Pager'

function DangerDialog({ cancel, confirm }: Record<'cancel' | 'confirm', React.ReactNode>) {
    return (
        <Dialog open>
            <DialogContent>
                <DialogContentText variant="overline">
                    <Trans>Are you sure?</Trans>
                </DialogContentText>
                <DialogContentText sx={{ color: (theme) => theme.vars.palette.maskColor.danger }}>
                    <Trans>This request may be a phishing attach. I understand this and want to continue.</Trans>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                {cancel}
                {confirm}
            </DialogActions>
        </Dialog>
    )
}
