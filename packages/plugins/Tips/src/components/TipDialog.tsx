import { share } from '@masknet/plugin-infra/content-script/context'
import { ChainBoundary, InjectedDialog, PluginWalletStatusBar, TransactionConfirmModal } from '@masknet/shared'
import { NetworkPluginID, getSiteType, pluginIDsSettings } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { ActionButton, MaskTabList, makeStyles } from '@masknet/theme'
import {
    useChainContext,
    useMountReport,
    useNetworkContext,
    useNonFungibleAsset,
    useReverseAddress,
    useWallet,
} from '@masknet/web3-hooks-base'
import { SmartPayBundler } from '@masknet/web3-providers'
import { TokenType } from '@masknet/web3-shared-base'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventID, EventType } from '@masknet/web3-telemetry/types'
import { TabContext, TabPanel } from '@mui/lab'
import { DialogContent, Tab } from '@mui/material'
import { useCallback, useMemo } from 'react'
import { useAsync, useUpdateEffect } from 'react-use'
import { TargetRuntimeContext } from '../contexts/TargetRuntimeContext.js'
import { useTip } from '../contexts/index.js'
import { NFTSection } from './NFTSection/index.js'
import { NetworkSection } from './NetworkSection/index.js'
import { RecipientSection } from './RecipientSection/index.js'
import { TokenSection } from './TokenSection/index.js'
import { msg, Trans } from '@lingui/macro'
import { useLingui } from '@lingui/react'

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
    tabPanel: {
        flexGrow: 1,
        overflow: 'auto',
        padding: theme.spacing(0, 2),
    },
    section: {
        height: '100%',
        paddingTop: theme.spacing(2),
        boxSizing: 'border-box',
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
        setTipType,
        amount,
        token,
        isSending,
        isDirty,
        recipient,
        recipientAddress,
        recipientUserId,
        nonFungibleTokenAddress,
        nonFungibleTokenContract,
        nonFungibleTokenId,
        sendTip,
        validation: [isValid, validateMessage],
    } = useTip()
    const { pluginID } = useNetworkContext()
    const { data: recipientEns } = useReverseAddress(pluginID, recipientAddress)
    const wallet = useWallet()
    const { chainId } = useChainContext()

    const isTokenTip = tipType === TokenType.Fungible
    const shareText = useMemo(() => {
        const recipientName = recipient?.label || recipientEns
        const promote = _(msg`Install https://mask.io/download-links to send your first tip.`)
        if (isTokenTip) {
            if (token?.symbol) {
                const tokenSymbol = token.symbol
                if (recipientName)
                    return _(
                        msg`I just tipped ${amount} ${tokenSymbol} to @${recipientUserId}'s wallet ${recipientName}\n\n${promote}`,
                    )
                else
                    return _(
                        msg`I just tipped ${amount} ${tokenSymbol} to @${recipientUserId}'s wallet address ${recipientAddress}\n\n${promote}`,
                    )
            } else {
                if (recipientName)
                    return _(
                        msg`I just tipped ${amount} token to @${recipientUserId}'s wallet ${recipientName}\n\n${promote}`,
                    )
                else
                    return _(
                        msg`I just tipped ${amount} token to @${recipientUserId}'s wallet address ${recipientAddress}\n\n${promote}`,
                    )
            }
        } else {
            const NFT_Name = nonFungibleTokenContract?.name || 'NFT'
            if (recipientName)
                return _(
                    msg`I just tipped a ${NFT_Name} to @${recipientUserId}'s wallet ${recipientName}\n\n${promote}`,
                )
            else
                return _(
                    msg`I just tipped a {{name}} to @${recipientUserId}'s wallet address ${recipientAddress}\n\n${promote}`,
                )
        }
    }, [amount, isTokenTip, nonFungibleTokenContract?.name, token, recipient, recipientUserId, _, recipientEns])

    const currentTab = isTokenTip ? TokenType.Fungible : TokenType.NonFungible
    const onTabChange = useCallback((_: unknown, value: TokenType) => {
        setTipType(value)
    }, [])

    const buttonLabel =
        isSending ? <Trans>Sending...</Trans>
        : isValid || !validateMessage ? <Trans>Send</Trans>
        : validateMessage

    const { data: nonFungibleToken } = useNonFungibleAsset(undefined, nonFungibleTokenAddress, nonFungibleTokenId ?? '')
    const send = useCallback(async () => {
        const hash = await sendTip()
        if (typeof hash !== 'string') return
        Telemetry.captureEvent(EventType.Access, EventID.EntryTimelineTipsSend)

        await TransactionConfirmModal.openAndWaitForClose({
            shareText,
            amount,
            tokenType: tipType,
            token,
            nonFungibleTokenId,
            nonFungibleTokenAddress,
            messageTextForNFT: _(msg`Sent ${'1'} ${nonFungibleToken?.contract?.name || 'NFT'} tips successfully.`),
            messageTextForFT: _(msg`Sent ${amount} ${`$${token?.symbol}`} tips successfully.`),
            title: _(msg`Tips`),
            share,
        })
        onClose?.()
    }, [sendTip, nonFungibleToken, shareText, amount, tipType, token, nonFungibleTokenAddress, nonFungibleTokenId])

    const expectedPluginID =
        [NetworkPluginID.PLUGIN_EVM, NetworkPluginID.PLUGIN_SOLANA].includes(pluginID) ? pluginID : (
            NetworkPluginID.PLUGIN_EVM
        )
    const submitDisabled = !isValid || (isSending && !isDirty)

    const pluginIDs = useValueRef(pluginIDsSettings)

    const pluginId = site ? pluginIDs[site] : NetworkPluginID.PLUGIN_EVM

    const { value: smartPayChainId } = useAsync(async () => SmartPayBundler.getSupportedChainId(), [])

    const { setTargetChainId } = TargetRuntimeContext.useContainer()

    useUpdateEffect(() => {
        if (!!wallet?.owner && smartPayChainId) setTargetChainId(smartPayChainId)
    }, [!!wallet?.owner, smartPayChainId])

    useMountReport(EventID.EntryTimelineTipsOpen)

    return (
        <TabContext value={currentTab}>
            <InjectedDialog
                open={open}
                onClose={onClose}
                classes={{ paper: classes.dialog }}
                title={<Trans>Tips</Trans>}
                titleTabs={
                    <MaskTabList variant="base" onChange={onTabChange} aria-label="Tips">
                        <Tab label={<Trans>Tokens</Trans>} value={TokenType.Fungible} />
                        <Tab label={<Trans>NFTs</Trans>} value={TokenType.NonFungible} />
                    </MaskTabList>
                }>
                <DialogContent className={classes.content}>
                    {currentTab === TokenType.NonFungible ?
                        <NetworkSection />
                    :   null}
                    <RecipientSection className={classes.recipient} />
                    <TabPanel value={TokenType.Fungible} className={classes.tabPanel}>
                        <TokenSection className={classes.section} />
                    </TabPanel>
                    <TabPanel value={TokenType.NonFungible} className={classes.tabPanel} style={{ padding: 0 }}>
                        <NFTSection className={classes.section} />
                    </TabPanel>
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
        </TabContext>
    )
}
