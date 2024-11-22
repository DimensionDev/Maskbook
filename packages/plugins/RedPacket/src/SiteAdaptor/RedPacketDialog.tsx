import { Icons } from '@masknet/icons'
import {
    useActivatedPluginSiteAdaptor,
    useCurrentVisitingIdentity,
    useLastRecognizedIdentity,
    useSiteThemeMode,
} from '@masknet/plugin-infra/content-script'
import { InjectedDialog, LoadingStatus, useCurrentLinkedPersona } from '@masknet/shared'
import { CrossIsolationMessages, EMPTY_LIST, NetworkPluginID, PluginID } from '@masknet/shared-base'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { useChainContext, useGasPrice } from '@masknet/web3-hooks-base'
import { EVMWeb3 } from '@masknet/web3-providers'
import { type FireflyRedPacketAPI, type RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { ChainId, type GasConfig, GasEditor } from '@masknet/web3-shared-evm'
import { TabContext } from '@mui/lab'
import { DialogContent, Tab, useTheme } from '@mui/material'
import { Suspense, useCallback, useContext, useMemo, useState } from 'react'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { RedPacketMetaKey } from '../constants.js'
import { useRedPacketTrans } from '../locales/index.js'
import type { FireflyContext, FireflyRedpacketSettings } from '../types.js'
import { ClaimRequirementsDialog } from './ClaimRequirementsDialog.js'
import { ClaimRequirementsRuleDialog } from './ClaimRequirementsRuleDialog.js'
import { FireflyRedpacketConfirmDialog } from './FireflyRedpacketConfirmDialog.js'
import { FireflyRedPacketHistoryDetails } from './FireflyRedPacketHistoryDetails.js'
import { FireflyRedPacketPast } from './FireflyRedPacketPast.js'
import type { RedPacketSettings } from './hooks/useCreateCallback.js'
import { openComposition } from './openComposition.js'
import { RedPacketERC20Form } from './RedPacketERC20Form.js'
import { CompositionTypeContext } from './RedPacketInjection.js'
import { reduceUselessPayloadInfo } from './utils/reduceUselessPayloadInfo.js'

const useStyles = makeStyles<{ scrollY: boolean; isDim: boolean }>()((theme, { isDim, scrollY }) => {
    // it's hard to set dynamic color, since the background color of the button is blended transparent
    const darkBackgroundColor = isDim ? '#38414b' : '#292929'
    return {
        dialogContent: {
            padding: 0,
            scrollbarWidth: 'none',
            '::-webkit-scrollbar': {
                display: 'none',
            },

            overflowX: 'hidden',
            overflowY: scrollY ? 'auto' : 'hidden',
            position: 'relative',
        },
        abstractTabWrapper: {
            width: '100%',
            paddingBottom: theme.spacing(2),
        },
        arrowButton: {
            backgroundColor: theme.palette.mode === 'dark' ? darkBackgroundColor : undefined,
        },
        placeholder: {
            height: 474,
            boxSizing: 'border-box',
        },
        disabledTab: {
            background: 'transparent !important',
            color: `${theme.palette.maskColor.third} !important`,
        },
    }
})

enum CreateRedPacketPageStep {
    NewRedPacketPage = 'new',
    ConfirmPage = 'confirm',
    ClaimRequirementsPage = 'claim_requirements',
}

interface RedPacketDialogProps {
    open: boolean
    onClose: () => void
    isOpenFromApplicationBoard?: boolean
    source?: PluginID
    fireflyContext: FireflyContext
}

export default function RedPacketDialog(props: RedPacketDialogProps) {
    const t = useRedPacketTrans()
    const [showHistory, setShowHistory] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const [rpid, setRpid] = useState<string>('')
    const [showClaimRule, setShowClaimRule] = useState(false)
    const [gasOption, setGasOption] = useState<GasConfig>()

    const [step, setStep] = useState(CreateRedPacketPageStep.NewRedPacketPage)

    const { account, chainId: contextChainId, setChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const definition = useActivatedPluginSiteAdaptor.visibility.useAnyMode(PluginID.RedPacket)
    const [currentHistoryTab, onChangeHistoryTab, historyTabs] = useTabs('claimed', 'sent')
    const theme = useTheme()
    const mode = useSiteThemeMode(theme)

    const { classes } = useStyles({ isDim: mode === 'dim', scrollY: !showHistory })

    const chainIdList: ChainId[] = useMemo(() => {
        return definition?.enableRequirement.web3?.[NetworkPluginID.PLUGIN_EVM]?.supportedChainIds ?? EMPTY_LIST
    }, [definition?.enableRequirement.web3])
    const chainId = chainIdList.includes(contextChainId) ? contextChainId : ChainId.Mainnet

    // #region token lucky drop
    const [settings, setSettings] = useState<RedPacketSettings>()
    // #endregion

    // #region firefly redpacket
    const [fireflyRpSettings, setFireflyRpSettings] = useState<FireflyRedpacketSettings>()
    // #endregion

    // #region nft lucky drop
    const [openNFTConfirmDialog, setOpenNFTConfirmDialog] = useState(false)
    const [openSelectNFTDialog, setOpenSelectNFTDialog] = useState(false)
    // #endregion

    const handleClose = useCallback(() => {
        setStep(CreateRedPacketPageStep.NewRedPacketPage)
        setSettings(undefined)
        props.onClose()
    }, [props.onClose, step])

    const currentIdentity = useCurrentVisitingIdentity()
    const lastRecognized = useLastRecognizedIdentity()
    const linkedPersona = useCurrentLinkedPersona()
    const senderName =
        lastRecognized?.identifier?.userId ?? currentIdentity?.identifier?.userId ?? linkedPersona?.nickname

    const compositionType = useContext(CompositionTypeContext)
    const onCreateOrSelect = useCallback(
        async (
            payload: RedPacketJSONPayload,
            payloadImage?: string,
            claimRequirements?: FireflyRedPacketAPI.StrategyPayload[],
            publicKey?: string,
        ) => {
            if (payload.password === '') {
                if (payload.contract_version === 1) {
                    // eslint-disable-next-line no-alert
                    alert('Unable to share a lucky drop without a password. But you can still withdraw the lucky drop.')
                    // eslint-disable-next-line no-alert
                    payload.password = prompt('Please enter the password of the lucky drop:', '') ?? ''
                } else if (payload.contract_version > 1 && payload.contract_version < 4) {
                    // just sign out the password if it is lost.
                    payload.password = await EVMWeb3.signMessage(
                        'message',
                        web3_utils.sha3(payload.sender.message) ?? '',
                        {
                            account,
                        },
                    )
                    payload.password = payload.password.slice(2)
                }
            }

            openComposition(RedPacketMetaKey, reduceUselessPayloadInfo(payload), compositionType, {
                payloadImage,
                claimRequirements,
                publicKey,
            })
            handleClose()
        },
        [senderName, handleClose, compositionType],
    )

    const onBack = useCallback(() => {
        if (step === CreateRedPacketPageStep.ConfirmPage) {
            setStep(CreateRedPacketPageStep.ClaimRequirementsPage)
        }
        if (step === CreateRedPacketPageStep.ClaimRequirementsPage) {
            setStep(CreateRedPacketPageStep.NewRedPacketPage)
        }
        if (step === CreateRedPacketPageStep.NewRedPacketPage) {
            handleClose()
            if (props.source === PluginID.SmartPay) {
                CrossIsolationMessages.events.smartPayDialogEvent.sendToAll({ open: true })
            }
        }
    }, [step, props.source === PluginID.SmartPay, handleClose])
    const isCreateStep = step === CreateRedPacketPageStep.NewRedPacketPage
    const onNext = useCallback(() => {
        if (!isCreateStep) return
        setStep(CreateRedPacketPageStep.ClaimRequirementsPage)
    }, [isCreateStep])
    const onDialogClose = useCallback(() => {
        if (openSelectNFTDialog) return setOpenSelectNFTDialog(false)
        if (openNFTConfirmDialog) return setOpenNFTConfirmDialog(false)
        if (showDetails) return setShowDetails(false)
        if (showHistory) return setShowHistory(false)
        onBack()
    }, [showHistory, openNFTConfirmDialog, openSelectNFTDialog, onBack, showDetails])

    const _onChange = useCallback((val: Omit<RedPacketSettings, 'password'>) => {
        setSettings(val)
    }, [])

    const handleCreated = useCallback(
        (
            payload: RedPacketJSONPayload,
            payloadImage?: string,
            claimRequirements?: FireflyRedPacketAPI.StrategyPayload[],
            publicKey?: string,
        ) => {
            onCreateOrSelect(payload, payloadImage, claimRequirements, publicKey)
            setSettings(undefined)
        },
        [onCreateOrSelect],
    )

    const title = useMemo(() => {
        if (showDetails) return t.more_details()
        if (showHistory) return t.history()
        if (openSelectNFTDialog) return t.nft_select_collection()
        if (openNFTConfirmDialog) return t.confirm()
        if (step === CreateRedPacketPageStep.NewRedPacketPage) return t.display_name()
        if (step === CreateRedPacketPageStep.ClaimRequirementsPage) return t.claim_requirements_title()
        return t.details()
    }, [showHistory, openSelectNFTDialog, openNFTConfirmDialog, step, showDetails])

    const titleTail = useMemo(() => {
        if (
            step === CreateRedPacketPageStep.NewRedPacketPage &&
            !openNFTConfirmDialog &&
            !showHistory &&
            !showDetails
        ) {
            return (
                <Icons.History
                    style={{ cursor: account ? undefined : 'not-allowed' }}
                    disabled={!account}
                    onClick={() => {
                        if (!account) return
                        setShowHistory((history) => !history)
                    }}
                />
            )
        }

        if (step === CreateRedPacketPageStep.ClaimRequirementsPage) {
            return <Icons.Questions onClick={() => setShowClaimRule(true)} />
        }
        return null
    }, [step, openNFTConfirmDialog, showHistory, showDetails])

    // #region gas config
    const [defaultGasPrice] = useGasPrice(NetworkPluginID.PLUGIN_EVM, { chainId })
    const handleGasSettingChange = useCallback(
        (gasConfig: GasConfig) => {
            const editor = GasEditor.fromConfig(chainId, gasConfig)
            setGasOption((config) => {
                return editor.getGasConfig({
                    gasPrice: defaultGasPrice,
                    maxFeePerGas: defaultGasPrice,
                    maxPriorityFeePerGas: defaultGasPrice,
                    ...config,
                })
            })
        },
        [chainId, defaultGasPrice],
    )
    // #endregion

    const handleOpenDetails = useCallback(
        (redpacket_id: string) => {
            setRpid(redpacket_id)
            setShowDetails(true)
        },
        [setShowDetails, setRpid, setShowHistory],
    )
    const handleClaimRequirementsNext = useCallback((settings: FireflyRedpacketSettings) => {
        setFireflyRpSettings(settings)
        setStep(CreateRedPacketPageStep.ConfirmPage)
    }, [])

    return (
        <TabContext value={showHistory ? currentHistoryTab : ''}>
            <InjectedDialog
                isOpenFromApplicationBoard={props.isOpenFromApplicationBoard}
                open={props.open}
                title={title}
                titleTail={titleTail}
                titleTabs={
                    step === CreateRedPacketPageStep.NewRedPacketPage && showHistory && !showDetails ?
                        <MaskTabList variant="base" onChange={onChangeHistoryTab} aria-label="Redpacket">
                            <Tab label={t.claimed_tab_title()} value={historyTabs.claimed} />
                            <Tab label={t.sent_tab_title()} value={historyTabs.sent} />
                        </MaskTabList>
                    :   null
                }
                onClose={onDialogClose}
                isOnBack={showHistory || step !== CreateRedPacketPageStep.NewRedPacketPage}
                disableTitleBorder
                titleBarIconStyle={
                    step !== CreateRedPacketPageStep.NewRedPacketPage || showHistory || showDetails ? 'back' : 'close'
                }>
                <DialogContent className={classes.dialogContent}>
                    {step === CreateRedPacketPageStep.NewRedPacketPage ?
                        <>
                            <div
                                style={
                                    showHistory || showDetails ?
                                        { display: 'none', height: 0 }
                                    :   { height: 'auto', paddingBottom: 100 }
                                }>
                                <RedPacketERC20Form
                                    expectedChainId={chainId}
                                    origin={settings}
                                    gasOption={gasOption}
                                    onClose={handleClose}
                                    onNext={onNext}
                                    onChange={_onChange}
                                    onGasOptionChange={handleGasSettingChange}
                                    onChainChange={setChainId}
                                />
                            </div>
                            {showHistory && !showDetails ?
                                <FireflyRedPacketPast tabs={historyTabs} handleOpenDetails={handleOpenDetails} />
                            :   null}

                            {showDetails ?
                                <Suspense fallback={<LoadingStatus className={classes.placeholder} iconSize={30} />}>
                                    <FireflyRedPacketHistoryDetails rpid={rpid} />
                                </Suspense>
                            :   null}
                        </>
                    :   null}

                    {step === CreateRedPacketPageStep.ConfirmPage && settings ?
                        <FireflyRedpacketConfirmDialog
                            onClose={handleClose}
                            onCreated={handleCreated}
                            fireflyContext={props.fireflyContext}
                            fireflySettings={fireflyRpSettings}
                            settings={settings}
                        />
                    :   null}
                    {step === CreateRedPacketPageStep.ClaimRequirementsPage ?
                        <>
                            <ClaimRequirementsDialog
                                origin={fireflyRpSettings?.requirements}
                                onNext={handleClaimRequirementsNext}
                            />
                            <ClaimRequirementsRuleDialog open={showClaimRule} onClose={() => setShowClaimRule(false)} />
                        </>
                    :   null}
                </DialogContent>
            </InjectedDialog>
        </TabContext>
    )
}
