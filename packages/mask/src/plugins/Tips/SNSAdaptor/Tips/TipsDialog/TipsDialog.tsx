import { useCallback, useContext, useMemo } from 'react'
import { useBoolean } from 'react-use'
import { Icons } from '@masknet/icons'
import { PluginID, useActivatedPlugin } from '@masknet/plugin-infra/dom'
import { InjectedDialog } from '@masknet/shared'
import { EMPTY_LIST, EnhanceableSite } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainId, useCurrentWeb3NetworkPluginID, useNonFungibleAsset } from '@masknet/plugin-infra/web3'
import { makeStyles } from '@masknet/theme'
import { DialogContent, Typography } from '@mui/material'
import { AddDialog } from './AddDialog.js'
import { ConfirmModal } from './ConfirmModal.js'
import { NFTItem } from '../NFTList/index.js'
import { TipsForm } from './TipsForm.js'
import { AssetType } from '../../../types/index.js'
import { useI18N } from '../../../locales/index.js'
import { PluginContext, TipsContext } from '../../Context/index.js'
import { NetworkTab } from '../../../../../components/shared/NetworkTab.js'
import { activatedSocialNetworkUI } from '../../../../../social-network/ui.js'

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
    form: {
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

export interface TipsDialogProps {
    open: boolean
    onClose?: () => void
}

export function TipsDialog({ open = false, onClose }: TipsDialogProps) {
    const t = useI18N()
    const { classes } = useStyles()
    const isSupportShare = activatedSocialNetworkUI.networkIdentifier !== EnhanceableSite.Mirror

    const { targetChainId, setTargetChainId } = PluginContext.useContainer()
    const pluginID = useCurrentWeb3NetworkPluginID()
    const chainId = useChainId()

    const tipsDefinition = useActivatedPlugin(PluginID.NextID, 'any')
    const chainIdList = tipsDefinition?.enableRequirement.web3?.[pluginID]?.supportedChainIds ?? EMPTY_LIST

    const [addTokenDialogIsOpen, openAddTokenDialog] = useBoolean(false)
    const [confirmModalIsOpen, openConfirmModal] = useBoolean(false)
    const {
        assetType,
        amount,
        fungibleToken: token,
        recipientSnsId,
        recipient,
        nonFungibleTokenContract,
        nonFungibleTokenId,
        setNonFungibleTokenAddress,
        setNonFungibleTokenId,
        resetCallback,
    } = useContext(TipsContext)

    const isTokenTip = assetType === AssetType.FungibleToken
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

    const successMessage = useMemo(() => {
        if (isTokenTip) return t.send_tip_successfully()
        if (nonFungibleToken)
            return (
                <div className={classes.nftMessage}>
                    <div className={classes.nftContainer}>
                        <NFTItem asset={nonFungibleToken} />
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

    const handleAddToken = useCallback((token: Web3Helper.NonFungibleAssetScope<'all'>) => {
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
                            <NetworkTab<typeof pluginID>
                                classes={classes}
                                chainId={targetChainId}
                                setChainId={setTargetChainId}
                                chains={chainIdList}
                            />
                        </div>
                    ) : null}
                    <TipsForm
                        className={classes.form}
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
                    resetCallback()
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
