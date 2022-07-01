import { PluginId, useActivatedPlugin, useCompositionContext } from '@masknet/plugin-infra/content-script'
import { InjectedDialog, InjectedDialogProps, useOpenShareTxDialog } from '@masknet/shared'
import { EMPTY_LIST, EnhanceableSite } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { makeStyles } from '@masknet/theme'
import { ChainId, useITOConstants } from '@masknet/web3-shared-evm'
import { DialogContent } from '@mui/material'
import { omit, set } from 'lodash-unified'
import { useCallback, useEffect, useState } from 'react'
import Web3Utils from 'web3-utils'
import { useCurrentIdentity, useCurrentLinkedPersona } from '../../../components/DataSource/useActivatedUI'
import { activatedSocialNetworkUI } from '../../../social-network'
import { useI18N } from '../../../utils'
import { WalletMessages } from '../../Wallet/messages'
import { ITO_MetaKey_2, MSG_DELIMITER } from '../constants'
import { PluginITO_RPC } from '../messages'
import { DialogTabs, JSON_PayloadInMask } from '../types'
import { ConfirmDialog } from './ConfirmDialog'
import { CreateForm } from './CreateForm'
import { payloadOutMask } from './helpers'
import { PoolList } from './PoolList'
import { useAccount, useChainId, useCurrentWeb3NetworkPluginID, useWeb3Connection } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { PoolSettings, useFillCallback } from './hooks/useFill'
import { History as HistoryIcon } from '@masknet/icons'
import { NetworkTab } from '../../../components/shared/NetworkTab'

interface StyleProps {
    snsId: string
}

const useStyles = makeStyles<StyleProps>()((theme, { snsId }) => ({
    content: {
        ...(snsId === EnhanceableSite.Minds ? { minWidth: 600 } : {}),
        position: 'relative',
        padding: 0,
        '::-webkit-scrollbar': {
            display: 'none',
        },

        overflowX: 'hidden',
    },
    tabs: {
        top: 0,
        left: 0,
        right: 0,
        position: 'absolute',
    },
    abstractTabWrapper: {
        width: '100%',
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(2),
        position: 'sticky',
        top: 0,
        zIndex: 2,
        background: theme.palette.maskColor.bottom,
    },
    tail: {
        cursor: 'pointer',
    },
}))

export enum ITOCreateFormPageStep {
    NewItoPage = 'new-ito',
    ConfirmItoPage = 'confirm-item',
}

export interface CompositionDialogProps extends withClasses<'root'>, Omit<InjectedDialogProps, 'classes' | 'onClose'> {
    onConfirm(payload: JSON_PayloadInMask): void
    onClose: () => void
    isOpenFromApplicationBoard?: boolean
}

export function CompositionDialog(props: CompositionDialogProps) {
    const { t } = useI18N()

    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const currentChainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId: currentChainId })
    const { classes } = useStyles({ snsId: activatedSocialNetworkUI.networkIdentifier })
    const { attachMetadata, dropMetadata } = useCompositionContext()
    const pluginID = useCurrentWeb3NetworkPluginID()
    const ITO_Definition = useActivatedPlugin(PluginId.ITO, 'any')
    const chainIdList = ITO_Definition?.enableRequirement.web3?.[pluginID]?.supportedChainIds ?? EMPTY_LIST
    const [chainId, setChainId] = useState<ChainId>(currentChainId)

    const { ITO2_CONTRACT_ADDRESS } = useITOConstants(chainId)
    const [showHistory, setShowHistory] = useState(false)
    const state = useState<DialogTabs>(DialogTabs.create)
    // #region step
    const [step, setStep] = useState(ITOCreateFormPageStep.NewItoPage)

    const onClose = useCallback(() => {
        const [, setValue] = state
        setStep(ITOCreateFormPageStep.NewItoPage)
        if (step === ITOCreateFormPageStep.ConfirmItoPage) return
        setPoolSettings(undefined)
        setValue(DialogTabs.create)
        props.onClose()
    }, [props, state, step])

    const onNext = useCallback(() => {
        if (step === ITOCreateFormPageStep.NewItoPage) setStep(ITOCreateFormPageStep.ConfirmItoPage)
        setShowHistory(false)
    }, [step])

    const onBack = useCallback(() => {
        if (step === ITOCreateFormPageStep.ConfirmItoPage) setStep(ITOCreateFormPageStep.NewItoPage)
        if (step === ITOCreateFormPageStep.NewItoPage) onClose()
    }, [step])
    // #endregion

    const [poolSettings, setPoolSettings] = useState<PoolSettings>()

    // #region blocking
    const [{ loading: filling }, fillCallback] = useFillCallback(poolSettings)
    const openShareTxDialog = useOpenShareTxDialog()
    const fill = useCallback(async () => {
        const result = await fillCallback()
        if (!result || result instanceof Error) return
        const { receipt, settings } = result
        if (!receipt.transactionHash) return
        await openShareTxDialog({
            hash: receipt.transactionHash,
        })
        // no contract is available
        if (!ITO2_CONTRACT_ADDRESS) return

        // the settings is not available
        if (!settings?.token) return

        const FillSuccess = (receipt.events?.FillSuccess.returnValues ?? {}) as {
            total: string
            id: string
            creator: string
            creation_time: string
            token_address: string
            name: string
            message: string
        }

        // assemble JSON payload
        const payload: JSON_PayloadInMask = {
            contract_address: ITO2_CONTRACT_ADDRESS,
            pid: FillSuccess.id,
            password: settings.password,
            message: FillSuccess.message,
            limit: settings.limit,
            total: FillSuccess.total,
            total_remaining: FillSuccess.total,
            seller: {
                address: FillSuccess.creator,
            },
            chain_id: chainId,
            start_time: settings.startTime.getTime(),
            end_time: settings.endTime.getTime(),
            unlock_time: settings.unlockTime?.getTime() ?? 0,
            qualification_address: settings.qualificationAddress,
            creation_time: Number.parseInt(FillSuccess.creation_time, 10) * 1000,
            token: settings.token,
            exchange_amounts: settings.exchangeAmounts,
            exchange_tokens: settings.exchangeTokens,
            regions: settings.regions,
        }

        setPoolSettings(undefined)
        onCreateOrSelect(payload)
        onClose()
    }, [ITO2_CONTRACT_ADDRESS, fillCallback, openShareTxDialog])
    // #endregion

    const { closeDialog: closeApplicationBoardDialog } = useRemoteControlledDialog(
        WalletMessages.events.ApplicationDialogUpdated,
    )

    // #region tabs

    const currentIdentity = useCurrentIdentity()

    const { value: linkedPersona } = useCurrentLinkedPersona()

    const senderName = currentIdentity?.identifier.userId ?? linkedPersona?.nickname ?? 'Unknown User'
    const onCreateOrSelect = useCallback(
        async (payload: JSON_PayloadInMask) => {
            if (!payload.password) {
                const [, title] = payload.message.split(MSG_DELIMITER)
                payload.password =
                    (await connection?.signMessage(Web3Utils.sha3(title) ?? '', 'personalSign', {
                        account,
                    })) ?? ''
            }
            if (!payload.password) {
                alert('Failed to sign the password.')
                return
            }

            // To meet the max allowance of the data size of image steganography, we need to
            //  cut off and simplify some properties, such as save the token address string only.
            const payloadDetail = omit(
                set(
                    set(payloadOutMask(payload), 'token', payload.token.address),
                    'exchange_tokens',
                    payload.exchange_tokens.map(({ address }) => ({ address })),
                ),
                [
                    'creation_time',
                    'unlock_time',
                    'total_remaining',
                    'regions',
                    'start_time',
                    'end_time',
                    'qualification_address',
                ],
            )
            payloadDetail.seller.name = senderName
            if (payload) attachMetadata(ITO_MetaKey_2, payloadDetail)
            else dropMetadata(ITO_MetaKey_2)

            closeApplicationBoardDialog()
            props.onConfirm(payload)
            // storing the created pool in DB, it helps retrieve the pool password later
            PluginITO_RPC.discoverPool('', payload)

            const [, setValue] = state
            setValue(DialogTabs.create)
        },
        [account, chainId, props.onConfirm, state],
    )

    // #endregion

    useEffect(() => {
        if (!ITO2_CONTRACT_ADDRESS) onClose()
    }, [ITO2_CONTRACT_ADDRESS, onClose])

    return (
        <InjectedDialog
            titleTail={
                step === ITOCreateFormPageStep.NewItoPage && !showHistory ? (
                    <HistoryIcon onClick={() => setShowHistory((history) => !history)} className={classes.tail} />
                ) : null
            }
            isOpenFromApplicationBoard={props.isOpenFromApplicationBoard}
            disableBackdropClick
            isOnBack={showHistory || step === ITOCreateFormPageStep.ConfirmItoPage}
            open={props.open}
            title={t('plugin_ito_display_name')}
            onClose={() => (showHistory ? setShowHistory(false) : onBack())}>
            <DialogContent className={classes.content}>
                {step === ITOCreateFormPageStep.NewItoPage ? (
                    !showHistory ? (
                        <>
                            <div className={classes.abstractTabWrapper}>
                                <NetworkTab
                                    chainId={chainId}
                                    setChainId={setChainId}
                                    classes={classes}
                                    chains={chainIdList}
                                />
                            </div>
                            <CreateForm
                                onNext={onNext}
                                chainId={chainId}
                                onClose={onClose}
                                origin={poolSettings}
                                onChangePoolSettings={setPoolSettings}
                            />
                        </>
                    ) : (
                        <PoolList onSend={onCreateOrSelect} />
                    )
                ) : null}
                {step === ITOCreateFormPageStep.ConfirmItoPage ? (
                    <ConfirmDialog
                        poolSettings={poolSettings}
                        loading={filling}
                        onBack={onBack}
                        onDone={fill}
                        onClose={onClose}
                    />
                ) : null}
            </DialogContent>
        </InjectedDialog>
    )
}
