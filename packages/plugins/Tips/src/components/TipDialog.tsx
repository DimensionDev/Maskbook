import { msg, select } from '@lingui/core/macro'
import { useLingui } from '@lingui/react'
import { Trans } from '@lingui/react/macro'
import { share } from '@masknet/plugin-infra/content-script/context'
import { ChainBoundary, InjectedDialog, PluginWalletStatusBar, TransactionConfirmModal } from '@masknet/shared'
import { NetworkPluginID, getSiteType, pluginIDsSettings } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { ActionButton, makeStyles } from '@masknet/theme'
import { useChainContext, useMountReport, useNetworkContext, useReverseAddress } from '@masknet/web3-hooks-base'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventID, EventType } from '@masknet/web3-telemetry/types'
import { DialogContent } from '@mui/material'
import { useCallback, useMemo } from 'react'
import { useTip } from '../contexts/index.js'
import { NetworkSection } from './NetworkSection/index.js'
import { RecipientSection } from './RecipientSection/index.js'
import { TokenSection } from './TokenSection/index.js'

const useStyles = makeStyles()((theme) => ({
    dialog: {
        width: 600,
        height: 620,
        overflow: 'hidden',
        backgroundImage: 'none',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 1,
        flexGrow: 1,
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
        padding: 0,
    },
    recipient: {
        margin: theme.spacing(1, 2, 0),
    },
    section: {
        height: '100%',
        paddingTop: theme.spacing(2),
        boxSizing: 'border-box',
        padding: theme.spacing(0, 2),
        overflow: 'auto',
    },
}))

interface TipDialogProps {
    open: boolean
    onClose?: () => void
}

const site = getSiteType()
export function TipDialog({ open = false, onClose }: TipDialogProps) {
    const { _ } = useLingui()
    const { classes } = useStyles()

    const {
        tipType,
        amount,
        token,
        isSending,
        isDirty,
        recipient,
        recipientAddress,
        recipientUserId,
        sendTip,
        validation,
    } = useTip()
    const [isValid, validateMessage] = validation
    const { pluginID } = useNetworkContext()
    const { data: recipientEns } = useReverseAddress(pluginID, recipientAddress)
    const { chainId } = useChainContext()

    const shareText = useMemo(() => {
        const recipientName = recipient?.label || recipientEns
        return _(
            msg`I just tipped ${amount} ${select(token?.symbol ? 'namedToken' : 'token', {
                namedToken: token?.symbol || '',
                other: 'token',
            })} to @${recipientUserId}'s ${select(recipientName ? 'name' : 'address', {
                name: 'wallet',
                address: 'wallet address',
                other: 'wallet',
            })} ${recipientName || recipientAddress}\n\nInstall https://mask.io/download-links to send your first tip.`,
        )
    }, [amount, token, recipient, recipientUserId, _, recipientEns])

    const buttonLabel =
        isSending ? <Trans>Sending...</Trans>
        : isValid || !validateMessage ? <Trans>Send</Trans>
        : validateMessage

    const send = useCallback(async () => {
        const hash = await sendTip()
        if (typeof hash !== 'string') return
        Telemetry.captureEvent(EventType.Access, EventID.EntryTimelineTipsSend)

        await TransactionConfirmModal.openAndWaitForClose({
            shareText,
            tokenType: tipType,
            token,
            messageTextForFT: _(msg`${amount} ${`$${token?.symbol}`} tips sent.`),
            title: _(msg`Tips`),
            share,
        })
        onClose?.()
    }, [sendTip, shareText, amount, tipType, token])

    const expectedPluginID =
        [NetworkPluginID.PLUGIN_EVM, NetworkPluginID.PLUGIN_SOLANA].includes(pluginID) ? pluginID : (
            NetworkPluginID.PLUGIN_EVM
        )
    const submitDisabled = !isValid || (isSending && !isDirty)

    const pluginIDs = useValueRef(pluginIDsSettings)

    const pluginId = site ? pluginIDs[site] : NetworkPluginID.PLUGIN_EVM

    useMountReport(EventID.EntryTimelineTipsOpen)

    return (
        <InjectedDialog open={open} onClose={onClose} classes={{ paper: classes.dialog }} title={<Trans>Tips</Trans>}>
            <DialogContent className={classes.content}>
                <NetworkSection />
                <RecipientSection className={classes.recipient} />
                <div className={classes.section}>
                    <TokenSection />
                </div>
                <PluginWalletStatusBar
                    actualPluginID={pluginId}
                    expectedPluginID={expectedPluginID}
                    expectedChainId={chainId}>
                    <ChainBoundary
                        expectedPluginID={expectedPluginID}
                        expectedChainId={chainId}
                        ActionButtonPromiseProps={{
                            fullWidth: true,
                        }}>
                        <ActionButton fullWidth disabled={submitDisabled} onClick={send}>
                            {buttonLabel}
                        </ActionButton>
                    </ChainBoundary>
                </PluginWalletStatusBar>
            </DialogContent>
        </InjectedDialog>
    )
}
