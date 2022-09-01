import { Icons } from '@masknet/icons'
import { useNonFungibleAsset } from '@masknet/plugin-infra/web3'
import { InjectedDialog } from '@masknet/shared'
import { ActionButton, makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { NetworkPluginID, NonFungibleAsset } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { TabContext, TabPanel } from '@mui/lab'
import { Box, DialogContent, Tab, Typography } from '@mui/material'
import { useCallback, useMemo } from 'react'
import { useBoolean } from 'react-use'
import { activatedSocialNetworkUI } from '../../../social-network/index.js'
import { PluginWalletStatusBar } from '../../../utils/index.js'
import { ChainBoundary } from '../../../web3/UI/ChainBoundary.js'
import { TargetRuntimeContext, useTip, useTipValidate } from '../contexts/index.js'
import { useI18N } from '../locales/index.js'
import { TipsType } from '../types/index.js'
import { AddDialog } from './AddDialog.js'
import { ConfirmModal } from './common/ConfirmModal.js'
import { NetworkSection } from './NetworkSection/index.js'
import { NFTItem, NFTSection } from './NFTSection/index.js'
import { RecipientSection } from './RecipientSection/index.js'
import { TokenSection } from './TokenSection/index.js'

const useStyles = makeStyles()((theme) => ({
    dialog: {
        width: 600,
        height: 620,
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
        margin: theme.spacing(2),
    },
    abstractTabWrapper: {
        width: '100%',
        paddingBottom: theme.spacing(1),
        flexShrink: 0,
    },
    tabPanel: {
        flexGrow: 1,
        overflow: 'auto',
        padding: theme.spacing(0, 2),
    },
    tab: {
        height: 36,
        minHeight: 36,
    },
    tabPaper: {
        backgroundColor: 'inherit',
    },
    tabs: {
        height: 36,
        minHeight: 36,
        margin: '0 auto',
        borderRadius: 4,
    },
    nftContainer: {
        height: 100,
        width: 100,
    },
    nftMessage: {
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    nftMessageText: {
        fontSize: 18,
        color: '#3DC233',
        marginTop: theme.spacing(3),
        lineHeight: '30px',
    },
    fallbackImage: {
        width: 64,
        height: 64,
    },
    walletChip: {
        marginLeft: 'auto',
        height: 40,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(0.5, 1),
        borderRadius: 99,
    },
    wallet: {
        marginLeft: theme.spacing(1),
    },
    walletTitle: {
        marginLeft: theme.spacing(1),
        lineHeight: '18px',
        height: 18,
        fontSize: 14,
        fontWeight: 'bold',
    },
    walletAddress: {
        height: 12,
        display: 'flex',
        alignItems: 'center',
        fontSize: 10,
        color: theme.palette.text.secondary,
    },
    changeWalletButton: {
        marginLeft: theme.spacing(0.5),
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
    },
    link: {
        cursor: 'pointer',
        lineHeight: '10px',
        marginTop: 2,
        '&:hover': {
            textDecoration: 'none',
        },
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
    const [confirmModalIsOpen, openConfirmModal] = useBoolean(false)
    const {
        tipType,
        setTipType,
        amount,
        token,
        isSending,
        recipient,
        recipientAddress,
        recipientSnsId,
        nonFungibleTokenContract,
        nonFungibleTokenId,
        setNonFungibleTokenAddress,
        setNonFungibleTokenId,
        reset,
        sendTip,
    } = useTip()
    const { targetChainId, pluginId } = TargetRuntimeContext.useContainer()
    const [isValid, validateMessage] = useTipValidate()

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

    const { value: nonFungibleToken } = useNonFungibleAsset(
        undefined,
        nonFungibleTokenContract?.address,
        nonFungibleTokenId ?? '',
    )

    const [currentTab, onChange, tabs] = useTabs(TipsType.Tokens, TipsType.Collectibles)
    const onTabChange: typeof onChange = useCallback(
        (_, value) => {
            setTipType(value as TipsType)
            onChange(_, value)
        },
        [onChange],
    )
    const buttonLabel = isSending ? t.sending_tip() : isValid || !validateMessage ? t.send_tip() : validateMessage

    const handleConfirm = useCallback(() => {
        activatedSocialNetworkUI.utils.share?.(shareText)
        openConfirmModal(false)
        onClose?.()
    }, [shareText, onClose])

    const handleAddToken = useCallback((token: NonFungibleAsset<ChainId, SchemaType>) => {
        setNonFungibleTokenAddress(token.address ?? '')
        setNonFungibleTokenId(token.tokenId)
        openAddTokenDialog(false)
    }, [])

    const send = useCallback(async () => {
        const hash = await sendTip()
        if (typeof hash !== 'string') return
        openConfirmModal(true)
    }, [sendTip])

    const expectedPluginID = [NetworkPluginID.PLUGIN_EVM, NetworkPluginID.PLUGIN_SOLANA].includes(pluginId)
        ? pluginId
        : NetworkPluginID.PLUGIN_EVM

    return (
        <TabContext value={currentTab}>
            <InjectedDialog
                open={open}
                onClose={onClose}
                classes={{ paper: classes.dialog }}
                title={t.tips()}
                titleTabs={
                    <MaskTabList variant="base" onChange={onTabChange} aria-label="Tips">
                        <Tab label={t.tips_tab_tokens()} value={tabs.tokens} />
                        <Tab label={t.tips_tab_colletibles()} value={tabs.collectibles} />
                    </MaskTabList>
                }>
                <DialogContent className={classes.content}>
                    <NetworkSection />
                    <RecipientSection className={classes.recipient} />
                    <TabPanel value={tabs.tokens} className={classes.tabPanel}>
                        <TokenSection />
                    </TabPanel>
                    <TabPanel value={tabs.collectibles} className={classes.tabPanel}>
                        <NFTSection />
                    </TabPanel>
                    <PluginWalletStatusBar expectedPluginID={expectedPluginID} expectedChainId={targetChainId}>
                        <ChainBoundary
                            expectedPluginID={expectedPluginID}
                            expectedChainId={targetChainId}
                            noSwitchNetworkTip
                            ActionButtonPromiseProps={{
                                fullWidth: true,
                            }}>
                            <ActionButton fullWidth disabled={!isValid || isSending} onClick={send}>
                                {buttonLabel}
                            </ActionButton>
                        </ChainBoundary>
                    </PluginWalletStatusBar>
                </DialogContent>
            </InjectedDialog>
            <ConfirmModal
                title={t.tips()}
                open={confirmModalIsOpen}
                onClose={() => {
                    openConfirmModal(false)
                    reset()
                    onClose?.()
                }}
                confirmText={t.tip_share()}
                onConfirm={handleConfirm}>
                {isTokenTip ? (
                    <Box>
                        <Icons.Success size={75} />
                        <Typography>Congratulations!</Typography>
                    </Box>
                ) : (
                    <div className={classes.nftMessage}>
                        <div className={classes.nftContainer}>
                            <NFTItem token={nonFungibleToken!} />
                        </div>
                        <Typography className={classes.nftMessageText}>
                            {t.send_specific_tip_successfully({
                                amount: '1',
                                name: nonFungibleToken?.contract?.name || 'NFT',
                            })}
                        </Typography>
                    </div>
                )}
            </ConfirmModal>
            <AddDialog open={addTokenDialogIsOpen} onClose={() => openAddTokenDialog(false)} onAdd={handleAddToken} />
        </TabContext>
    )
}
