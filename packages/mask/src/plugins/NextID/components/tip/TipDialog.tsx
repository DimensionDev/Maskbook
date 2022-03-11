import { SuccessIcon } from '@masknet/icons'
import { PluginId, useActivatedPlugin, usePluginIDContext } from '@masknet/plugin-infra'
import { makeStyles } from '@masknet/theme'
import { EMPTY_LIST, TransactionStateType } from '@masknet/web3-shared-evm'
import { DialogContent } from '@mui/material'
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
    const { tipType, amount, token, recipientSnsId, recipient, sendState, erc721Contract } = useTip()

    const shareLink = useMemo(() => {
        const assetName =
            tipType === TipType.Token
                ? `${amount || 'some'} ${token?.symbol || 'token'}`
                : erc721Contract?.name
                ? `a ${erc721Contract.name} NFT`
                : ''
        return activatedSocialNetworkUI.utils.getShareLinkURL?.(
            `I just tipped ${assetName} to @${recipientSnsId}'s wallet address ${recipient}

Install https://mask.io/download-links to tip my best friend.`,
        )
    }, [amount, tipType, erc721Contract?.name, token, recipient, recipientSnsId])

    const successMessage = t.send_tip_successfully()

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
            <InjectedDialog open={open} onClose={onClose} title={t.tip()}>
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
                title={t.tip()}
                open={confirmModalIsOpen}
                onClose={() => openConfirmModal(false)}
                icon={<SuccessIcon style={{ height: 64, width: 64 }} />}
                message={successMessage}
                confirmText={t.tip_share()}
                onConfirm={handleConfirm}
            />
        </>
    )
}
