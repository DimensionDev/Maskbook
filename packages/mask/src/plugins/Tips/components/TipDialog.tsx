import { useCallback, useMemo } from 'react'
import { useBoolean } from 'react-use'
import { PluginWeb3ActualContextProvider } from '@masknet/web3-hooks-base'
import { InjectedDialog, PluginWalletStatusBar } from '@masknet/shared'
import { NetworkPluginID } from '@masknet/shared-base'
import { ActionButton, makeStyles, MaskTabList } from '@masknet/theme'
import type { NonFungibleAsset } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { TabContext, TabPanel } from '@mui/lab'
import { DialogContent, Tab } from '@mui/material'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary.js'
import { TargetRuntimeContext, useCreateTipsTransaction, useTip } from '../contexts/index.js'
import { useI18N } from '../locales/index.js'
import { TipsType } from '../types/index.js'
import { AddDialog } from './AddDialog.js'
import { NetworkSection } from './NetworkSection/index.js'
import { NFTSection } from './NFTSection/index.js'
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
        flexBasis: '100%',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
        padding: 0,
        height: 528,
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

export function TipDialog({ open = false, onClose }: TipDialogProps) {
    const t = useI18N()
    const { classes } = useStyles()

    const [addTokenDialogIsOpen, openAddTokenDialog] = useBoolean(false)
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
        nonFungibleTokenContract,
        setNonFungibleTokenAddress,
        nonFungibleTokenId,
        setNonFungibleTokenId,
        sendTip,
        validation: [isValid, validateMessage],
    } = useTip()
    const { targetChainId, pluginID } = TargetRuntimeContext.useContainer()

    const isTokenTip = tipType === TipsType.Tokens
    const shareText = useMemo(() => {
        const promote = t.tip_mask_promote()
        const message = isTokenTip
            ? t.tip_token_share_post({
                  amount,
                  symbol: token?.symbol || 'token',
                  recipientSnsId,
                  recipient: recipientAddress,
                  promote,
              })
            : t.tip_nft_share_post({
                  name: nonFungibleTokenContract?.name || 'NFT',
                  recipientSnsId,
                  recipient: recipientAddress,
                  promote,
              })
        return message
    }, [amount, isTokenTip, nonFungibleTokenContract?.name, token, recipient, recipientSnsId, t])

    const currentTab = isTokenTip ? TipsType.Tokens : TipsType.Collectibles
    const onTabChange = useCallback((_: unknown, value: TipsType) => {
        setTipType(value)
    }, [])

    const buttonLabel = isSending ? t.sending_tip() : isValid || !validateMessage ? t.send_tip() : validateMessage

    const handleAddToken = useCallback((token: NonFungibleAsset<ChainId, SchemaType>) => {
        setNonFungibleTokenAddress(token.address ?? '')
        setNonFungibleTokenId(token.tokenId)
        openAddTokenDialog(false)
    }, [])

    const createTipsTx = useCreateTipsTransaction()
    const send = useCallback(async () => {
        const hash = await sendTip()
        if (typeof hash !== 'string') return
        await createTipsTx({
            shareText,
            amount,
            tipType,
            token,
            nonFungibleTokenContract,
            nonFungibleTokenId,
        })
    }, [sendTip, createTipsTx, shareText, amount, tipType, token, nonFungibleTokenContract, nonFungibleTokenId])

    const expectedPluginID = [NetworkPluginID.PLUGIN_EVM, NetworkPluginID.PLUGIN_SOLANA].includes(pluginID)
        ? pluginID
        : NetworkPluginID.PLUGIN_EVM
    const submitDisabled = (!isValid || isSending) && !isDirty

    return (
        <TabContext value={currentTab}>
            <InjectedDialog
                open={open}
                onClose={onClose}
                classes={{ paper: classes.dialog }}
                title={t.tips()}
                titleTabs={
                    <MaskTabList variant="base" onChange={onTabChange} aria-label="Tips">
                        <Tab label={t.tips_tab_tokens()} value={TipsType.Tokens} />
                        <Tab label={t.tips_tab_collectibles()} value={TipsType.Collectibles} />
                    </MaskTabList>
                }>
                <DialogContent className={classes.content}>
                    <NetworkSection />
                    <RecipientSection className={classes.recipient} />
                    <TabPanel value={TipsType.Tokens} className={classes.tabPanel}>
                        <TokenSection className={classes.section} />
                    </TabPanel>
                    <TabPanel value={TipsType.Collectibles} className={classes.tabPanel} style={{ padding: 0 }}>
                        <NFTSection className={classes.section} />
                    </TabPanel>
                    <PluginWeb3ActualContextProvider>
                        <PluginWalletStatusBar expectedPluginID={expectedPluginID} expectedChainId={targetChainId}>
                            <ChainBoundary
                                expectedPluginID={expectedPluginID}
                                expectedChainId={targetChainId}
                                noSwitchNetworkTip
                                switchChainWithoutPopup
                                ActionButtonPromiseProps={{
                                    fullWidth: true,
                                }}>
                                <ActionButton fullWidth disabled={submitDisabled} onClick={send}>
                                    {buttonLabel}
                                </ActionButton>
                            </ChainBoundary>
                        </PluginWalletStatusBar>
                    </PluginWeb3ActualContextProvider>
                </DialogContent>
            </InjectedDialog>
            <AddDialog open={addTokenDialogIsOpen} onClose={() => openAddTokenDialog(false)} onAdd={handleAddToken} />
        </TabContext>
    )
}
