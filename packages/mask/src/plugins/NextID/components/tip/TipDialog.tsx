import { SuccessIcon } from '@masknet/icons'
import { PluginId, useActivatedPlugin, usePluginIDContext } from '@masknet/plugin-infra'
import { NFTCardStyledAssetPlayer } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { EMPTY_LIST, TransactionStateType, useChainId, useERC721TokenDetailed } from '@masknet/web3-shared-evm'
import { DialogContent, Typography } from '@mui/material'
import { useCallback, useEffect, useMemo } from 'react'
import { useBoolean } from 'react-use'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import { NetworkTab } from '../../../../components/shared/NetworkTab'
import { activatedSocialNetworkUI } from '../../../../social-network'
import { TargetChainIdContext, useTip } from '../../contexts'
import { useI18N } from '../../locales'
import { TipType } from '../../types'
import { ConfirmModal } from '../ConfirmModal'
import { TipForm } from './TipForm'

const useStyles = makeStyles()((theme) => ({
    content: {
        display: 'flex',
        flexDirection: 'column',
        flexBasis: '100%',
        paddingTop: 0,
        '&::-webkit-scrollbar': {
            display: 'none',
        },
    },
    abstractTabWrapper: {
        width: '100%',
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(2),
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
        width: 535,
        height: 36,
        minHeight: 36,
        margin: '0 auto',
        borderRadius: 4,
    },
    tipForm: {
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
    loadingFailImage: {
        width: 64,
        height: 64,
    },
}))

interface TipDialogProps {
    open?: boolean
    onClose?: () => void
}

export function TipDialog({ open = false, onClose }: TipDialogProps) {
    const pluginID = usePluginIDContext()
    const tipDefinition = useActivatedPlugin(PluginId.NextID, 'any')
    const chainIdList = tipDefinition?.enableRequirement.web3?.[pluginID]?.supportedChainIds ?? EMPTY_LIST
    const t = useI18N()
    const { classes } = useStyles()

    const [confirmModalIsOpen, openConfirmModal] = useBoolean(false)
    const { targetChainId, setTargetChainId } = TargetChainIdContext.useContainer()
    const { tipType, amount, token, recipientSnsId, recipient, sendState, erc721Contract, erc721TokenId } = useTip()

    const isTokenTip = tipType === TipType.Token
    const shareLink = useMemo(() => {
        const assetName = isTokenTip
            ? `${amount || 'some'} ${token?.symbol || 'token'}`
            : erc721Contract?.name
            ? `a ${erc721Contract.name} NFT`
            : ''
        return activatedSocialNetworkUI.utils.getShareLinkURL?.(
            t.tip_share_post({
                assetName,
                recipientSnsId,
                recipient,
            }),
        )
    }, [amount, isTokenTip, erc721Contract?.name, token, recipient, recipientSnsId, t])

    const { tokenDetailed: erc721Token } = useERC721TokenDetailed(erc721Contract, erc721TokenId)

    const chainId = useChainId()
    const successMessage = useMemo(() => {
        if (isTokenTip) return t.send_tip_successfully()
        if (erc721Token)
            return (
                <div className={classes.nftMessage}>
                    <div className={classes.nftContainer}>
                        <NFTCardStyledAssetPlayer
                            chainId={chainId}
                            contractAddress={erc721Token.contractDetailed.address}
                            url={erc721Token.info.mediaUrl}
                            tokenId={erc721Token.tokenId}
                            classes={{
                                loadingFailImage: classes.loadingFailImage,
                            }}
                        />
                    </div>
                    <Typography className={classes.nftMessageText}>
                        {t.send_specific_tip_successfully({
                            amount: '1',
                            name: erc721Token.info.name || 'NFT',
                        })}
                    </Typography>
                </div>
            )
        return t.send_tip_successfully()
    }, [t, isTokenTip, classes.nftMessage, erc721Token])

    useEffect(() => {
        if (sendState.type !== TransactionStateType.CONFIRMED) return
        openConfirmModal(true)
    }, [sendState.type])

    const handleConfirm = useCallback(() => {
        window.open(shareLink)
        openConfirmModal(false)
        onClose?.()
    }, [shareLink, onClose])

    return (
        <>
            <InjectedDialog open={open} onClose={onClose} title={t.tips()}>
                <DialogContent className={classes.content}>
                    <div className={classes.abstractTabWrapper}>
                        <NetworkTab
                            classes={classes}
                            chainId={targetChainId}
                            setChainId={setTargetChainId}
                            chains={chainIdList}
                        />
                    </div>
                    <TipForm className={classes.tipForm} />
                </DialogContent>
            </InjectedDialog>
            <ConfirmModal
                title={t.tips()}
                open={confirmModalIsOpen}
                onClose={() => openConfirmModal(false)}
                icon={isTokenTip ? <SuccessIcon style={{ height: 64, width: 64 }} /> : null}
                message={successMessage}
                confirmText={t.tip_share()}
                onConfirm={handleConfirm}
            />
        </>
    )
}
