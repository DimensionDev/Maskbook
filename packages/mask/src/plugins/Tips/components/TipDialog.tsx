import { ChainBoundary, InjectedDialog, PluginWalletStatusBar } from '@masknet/shared'
import { NetworkPluginID, getSiteType, pluginIDsSettings } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { ActionButton, MaskTabList, makeStyles } from '@masknet/theme'
import { useChainContext, useNetworkContext, useWallet } from '@masknet/web3-hooks-base'
import { SmartPayBundler } from '@masknet/web3-providers'
import { TokenType } from '@masknet/web3-shared-base'
import { TabContext, TabPanel } from '@mui/lab'
import { DialogContent, Tab } from '@mui/material'
import { useCallback, useMemo } from 'react'
import { useAsync, useUpdateEffect } from 'react-use'
import { TargetRuntimeContext } from '../contexts/TargetRuntimeContext.js'
import { useCreateTipsTransaction, useTip } from '../contexts/index.js'
import { useI18N } from '../locales/index.js'
import { NFTSection } from './NFTSection/index.js'
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

export interface TipDialogProps {
    open: boolean
    onClose?: () => void
}

const site = getSiteType()
export function TipDialog({ open = false, onClose }: TipDialogProps) {
    const t = useI18N()
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
        recipientSnsId,
        nonFungibleTokenAddress,
        nonFungibleTokenContract,
        nonFungibleTokenId,
        sendTip,
        validation: [isValid, validateMessage],
    } = useTip()
    const { pluginID } = useNetworkContext()
    const wallet = useWallet()
    const { chainId } = useChainContext()

    const isTokenTip = tipType === TokenType.Fungible
    const shareText = useMemo(() => {
        const message = isTokenTip
            ? t.tip_token_share_post({
                  amount,
                  symbol: token?.symbol || 'token',
                  recipientSnsId,
                  recipient: recipientAddress,
              })
            : t.tip_nft_share_post({
                  name: nonFungibleTokenContract?.name || 'NFT',
                  recipientSnsId,
                  recipient: recipientAddress,
              })
        return message
    }, [amount, isTokenTip, nonFungibleTokenContract?.name, token, recipient, recipientSnsId, t])

    const currentTab = isTokenTip ? TokenType.Fungible : TokenType.NonFungible
    const onTabChange = useCallback((_: unknown, value: TokenType) => {
        setTipType(value)
    }, [])

    const buttonLabel = isSending ? t.sending_tip() : isValid || !validateMessage ? t.send_tip() : validateMessage

    const createTipsTx = useCreateTipsTransaction()
    const send = useCallback(async () => {
        const hash = await sendTip()
        if (typeof hash !== 'string') return
        await createTipsTx({
            shareText,
            amount,
            tokenType: tipType,
            token,
            nonFungibleTokenAddress,
            nonFungibleTokenId,
        })
        onClose?.()
    }, [sendTip, createTipsTx, shareText, amount, tipType, token, nonFungibleTokenAddress, nonFungibleTokenId])

    const expectedPluginID = [NetworkPluginID.PLUGIN_EVM, NetworkPluginID.PLUGIN_SOLANA].includes(pluginID)
        ? pluginID
        : NetworkPluginID.PLUGIN_EVM
    const submitDisabled = !isValid || (isSending && !isDirty)

    const pluginIDs = useValueRef(pluginIDsSettings)

    const pluginId = site ? pluginIDs[site] : NetworkPluginID.PLUGIN_EVM

    const { value: smartPayChainId } = useAsync(async () => SmartPayBundler.getSupportedChainId(), [])

    const { setTargetChainId } = TargetRuntimeContext.useContainer()

    useUpdateEffect(() => {
        if (!!wallet?.owner && smartPayChainId) setTargetChainId(smartPayChainId)
    }, [!!wallet?.owner, smartPayChainId])

    return (
        <TabContext value={currentTab}>
            <InjectedDialog
                open={open}
                onClose={onClose}
                classes={{ paper: classes.dialog }}
                title={t.tips()}
                titleTabs={
                    <MaskTabList variant="base" onChange={onTabChange} aria-label="Tips">
                        <Tab label={t.tips_tab_tokens()} value={TokenType.Fungible} />
                        <Tab label={t.tips_tab_collectibles()} value={TokenType.NonFungible} />
                    </MaskTabList>
                }>
                <DialogContent className={classes.content}>
                    <NetworkSection />
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
