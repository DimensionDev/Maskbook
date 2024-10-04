import { useCallback, useContext, useMemo, useState, Suspense } from 'react'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { DialogContent, Tab, useTheme } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'
import { CrossIsolationMessages, EMPTY_LIST, NetworkPluginID, PluginID } from '@masknet/shared-base'
import { useChainContext, useGasPrice } from '@masknet/web3-hooks-base'
import { InjectedDialog, NetworkTab, useCurrentLinkedPersona, LoadingStatus } from '@masknet/shared'
import { ChainId, type GasConfig, GasEditor } from '@masknet/web3-shared-evm'
import { type FireflyRedPacketAPI, type RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import {
    useActivatedPluginSiteAdaptor,
    useCurrentVisitingIdentity,
    useLastRecognizedIdentity,
    useSiteThemeMode,
} from '@masknet/plugin-infra/content-script'
import { Icons } from '@masknet/icons'
import { EVMWeb3 } from '@masknet/web3-providers'
import { useRedPacketTrans } from '../locales/index.js'
import { reduceUselessPayloadInfo } from './utils/reduceUselessPayloadInfo.js'
import { RedPacketMetaKey } from '../constants.js'
import type { RedPacketSettings } from './hooks/useCreateCallback.js'
import { RedPacketERC20Form } from './RedPacketERC20Form.js'
import { RedPacketERC721Form } from './RedPacketERC721Form.js'
import { openComposition } from './openComposition.js'
import { FireflyRedPacketPast } from './FireflyRedPacketPast.js'
import { FireflyRedPacketHistoryDetails } from './FireflyRedPacketHistoryDetails.js'
import { ClaimRequirementsDialog } from './ClaimRequirementsDialog.js'
import { ClaimRequirementsRuleDialog } from './ClaimRequirementsRuleDialog.js'
import type { FireflyContext, FireflyRedpacketSettings } from '../types.js'
import { FireflyRedpacketConfirmDialog } from './FireflyRedpacketConfirmDialog.js'
import { CompositionTypeContext } from './RedPacketInjection.js'

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

    const [isNFTRedPacketLoaded, setIsNFTRedPacketLoaded] = useState(false)
    const { account, chainId: contextChainId, setChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const definition = useActivatedPluginSiteAdaptor.visibility.useAnyMode(PluginID.RedPacket)
    const [currentTab, onChange, tabs] = useTabs('tokens', 'collectibles')
    const [currentHistoryTab, onChangeHistoryTab, historyTabs] = useTabs('claimed', 'sent')
    const theme = useTheme()
    const mode = useSiteThemeMode(theme)

    const { classes } = useStyles({ isDim: mode === 'dim', scrollY: !showHistory && currentTab === 'tokens' })

    const chainIdList: ChainId[] = useMemo(() => {
        if (currentTab === tabs.tokens)
            return definition?.enableRequirement.web3?.[NetworkPluginID.PLUGIN_EVM]?.supportedChainIds ?? EMPTY_LIST
        return [ChainId.Mainnet, ChainId.BSC, ChainId.Polygon]
    }, [currentTab === tabs.tokens, definition?.enableRequirement.web3])
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
        <TabContext value={showHistory ? currentHistoryTab : currentTab}>
            <InjectedDialog
                isOpenFromApplicationBoard={props.isOpenFromApplicationBoard}
                open={props.open}
                title={title}
                titleTail={titleTail}
                titleTabs={
                    step === CreateRedPacketPageStep.NewRedPacketPage && !openNFTConfirmDialog && !showDetails ?
                        showHistory ?
                            <MaskTabList variant="base" onChange={onChangeHistoryTab} aria-label="Redpacket">
                                <Tab label={t.claimed_tab_title()} value={historyTabs.claimed} />
                                <Tab label={t.sent_tab_title()} value={historyTabs.sent} />
                            </MaskTabList>
                        :   <MaskTabList variant="base" onChange={onChange} aria-label="Redpacket">
                                <Tab label={t.erc20_tab_title()} value={tabs.tokens} />
                                <Tab
                                    className={classes.disabledTab}
                                    label={t.nfts()}
                                    value={tabs.collectibles}
                                    disabled
                                />
                            </MaskTabList>

                    :   null
                }
                networkTabs={
                    (
                        currentTab === tabs.collectibles &&
                        step === CreateRedPacketPageStep.NewRedPacketPage &&
                        !openNFTConfirmDialog &&
                        !openSelectNFTDialog &&
                        !showHistory &&
                        !showDetails
                    ) ?
                        <div className={classes.abstractTabWrapper}>
                            <NetworkTab
                                chains={chainIdList}
                                hideArrowButton={currentTab === tabs.collectibles}
                                pluginID={NetworkPluginID.PLUGIN_EVM}
                                classes={{ arrowButton: classes.arrowButton }}
                            />
                        </div>
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
                                style={{
                                    ...(showHistory || showDetails ? { display: 'none' } : {}),
                                    height:
                                        showHistory || showDetails ? 0
                                        : currentTab === 'collectibles' && isNFTRedPacketLoaded ? 'calc(100% + 84px)'
                                        : 'auto',
                                }}>
                                <TabPanel value={tabs.tokens} style={{ padding: 0, height: 474 }}>
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
                                </TabPanel>
                                <TabPanel
                                    value={tabs.collectibles}
                                    style={{ padding: 0, overflow: 'auto', height: openNFTConfirmDialog ? 564 : 474 }}>
                                    <RedPacketERC721Form
                                        openSelectNFTDialog={openSelectNFTDialog}
                                        setOpenSelectNFTDialog={setOpenSelectNFTDialog}
                                        setOpenNFTConfirmDialog={setOpenNFTConfirmDialog}
                                        openNFTConfirmDialog={openNFTConfirmDialog}
                                        onClose={handleClose}
                                        setIsNFTRedPacketLoaded={setIsNFTRedPacketLoaded}
                                        gasOption={gasOption}
                                        onGasOptionChange={handleGasSettingChange}
                                    />
                                </TabPanel>
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
