import { Icons } from '@masknet/icons'
import { PluginID, useActivatedPlugin } from '@masknet/plugin-infra/dom'
import { useChainId, useCurrentWeb3NetworkPluginID, useNonFungibleAsset } from '@masknet/plugin-infra/web3'
import { InjectedDialog } from '@masknet/shared'
import { EMPTY_LIST, EnhanceableSite } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import type { NonFungibleAsset } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { DialogContent, Typography } from '@mui/material'
import { useCallback, useMemo } from 'react'
import { useBoolean } from 'react-use'
import { NetworkTab } from '../../../components/shared/NetworkTab.js'
import { activatedSocialNetworkUI } from '../../../social-network/index.js'
import { TargetRuntimeContext, useTip } from '../contexts/index.js'
import { useI18N } from '../locales/index.js'
import { TipType } from '../types/index.js'
import { AddDialog } from './AddDialog.js'
import { ConfirmModal } from './common/ConfirmModal.js'
import { NFTItem } from './NFTSection/index.js'
import { TipForm } from './TipForm.js'

const useStyles = makeStyles()((theme) => ({
    dialog: {
        width: 600,
        backgroundImage: 'none',
    },
    dialogTitle: {
        height: 60,
        paddingTop: '0 !important',
        paddingBottom: '0 !important',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        flexBasis: '100%',
        '&::-webkit-scrollbar': {
            display: 'none',
        },
        padding: 0,
    },
    abstractTabWrapper: {
        width: '100%',
        paddingBottom: theme.spacing(1),
        flexShrink: 0,
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
    tipForm: {
        padding: 0,
        flexGrow: 1,
        overflow: 'auto',
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
    const pluginID = useCurrentWeb3NetworkPluginID()
    const tipDefinition = useActivatedPlugin(PluginID.NextID, 'any')
    const chainIdList = tipDefinition?.enableRequirement.web3?.[pluginID]?.supportedChainIds ?? EMPTY_LIST
    const t = useI18N()
    const { classes } = useStyles()
    const isSupportShare = activatedSocialNetworkUI.networkIdentifier !== EnhanceableSite.Mirror

    const [addTokenDialogIsOpen, openAddTokenDialog] = useBoolean(false)
    const [confirmModalIsOpen, openConfirmModal] = useBoolean(false)
    const { targetChainId, setTargetChainId } = TargetRuntimeContext.useContainer()
    const {
        tipType,
        amount,
        token,
        recipientSnsId,
        recipient,
        nonFungibleTokenContract,
        nonFungibleTokenId,
        setNonFungibleTokenAddress,
        setNonFungibleTokenId,
        reset,
    } = useTip()

    const isTokenTip = tipType === TipType.Token
    const shareText = useMemo(() => {
        const promote = t.tip_mask_promote()
        const message = isTokenTip
            ? t.tip_token_share_post({
                  amount,
                  symbol: token?.symbol || 'token',
                  recipientSnsId,
                  recipient,
                  promote,
              })
            : t.tip_nft_share_post({
                  name: nonFungibleTokenContract?.name || 'NFT',
                  recipientSnsId,
                  recipient,
                  promote,
              })
        return message
    }, [amount, isTokenTip, nonFungibleTokenContract?.name, token, recipient, recipientSnsId, t])

    const { value: nonFungibleToken } = useNonFungibleAsset(
        undefined,
        nonFungibleTokenContract?.address,
        nonFungibleTokenId ?? '',
    )

    const chainId = useChainId()
    const successMessage = useMemo(() => {
        if (isTokenTip) return t.send_tip_successfully()
        if (nonFungibleToken)
            return (
                <div className={classes.nftMessage}>
                    <div className={classes.nftContainer}>
                        <NFTItem token={nonFungibleToken} />
                    </div>
                    <Typography className={classes.nftMessageText}>
                        {t.send_specific_tip_successfully({
                            amount: '1',
                            name: nonFungibleToken.contract?.name || 'NFT',
                        })}
                    </Typography>
                </div>
            )
        return t.send_tip_successfully()
    }, [t, chainId, isTokenTip, classes.nftMessage, nonFungibleToken])

    const handleConfirm = useCallback(() => {
        if (isSupportShare) {
            activatedSocialNetworkUI.utils.share?.(shareText)
        }
        openConfirmModal(false)
        onClose?.()
    }, [shareText, onClose])

    const handleAddToken = useCallback((token: NonFungibleAsset<ChainId, SchemaType>) => {
        setNonFungibleTokenAddress(token.address ?? '')
        setNonFungibleTokenId(token.tokenId)
        openAddTokenDialog(false)
    }, [])

    return (
        <>
            <InjectedDialog
                open={open}
                onClose={onClose}
                classes={{ dialogTitle: classes.dialogTitle, paper: classes.dialog }}
                title={t.tips()}>
                <DialogContent className={classes.content}>
                    {chainIdList.length ? (
                        <div className={classes.abstractTabWrapper}>
                            <NetworkTab
                                classes={classes}
                                chainId={targetChainId}
                                setChainId={setTargetChainId}
                                chains={chainIdList}
                            />
                        </div>
                    ) : null}
                    <TipForm
                        className={classes.tipForm}
                        onAddToken={() => openAddTokenDialog(true)}
                        onSent={() => {
                            openConfirmModal(true)
                        }}
                    />
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
                icon={isTokenTip ? <Icons.Success size={64} /> : null}
                message={successMessage}
                confirmText={isSupportShare ? t.tip_share() : t.tip_success_ok()}
                onConfirm={handleConfirm}
            />
            <AddDialog open={addTokenDialogIsOpen} onClose={() => openAddTokenDialog(false)} onAdd={handleAddToken} />
        </>
    )
}
