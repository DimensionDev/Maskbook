import { useCallback, useMemo, useState } from 'react'
import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { DialogContent, Tab, useTheme } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'
import { CrossIsolationMessages, EMPTY_LIST, NetworkPluginID, PluginID } from '@masknet/shared-base'
import { useChainContext, useGasPrice } from '@masknet/web3-hooks-base'
import { ApplicationBoardModal, InjectedDialog, NetworkTab, useCurrentLinkedPersona } from '@masknet/shared'
import { ChainId, type GasConfig, GasEditor } from '@masknet/web3-shared-evm'
import { type RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import {
    useActivatedPluginSiteAdaptor,
    useCurrentVisitingIdentity,
    useLastRecognizedIdentity,
    useSiteThemeMode,
} from '@masknet/plugin-infra/content-script'
import { Icons } from '@masknet/icons'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventID, EventType } from '@masknet/web3-telemetry/types'
import { EVMWeb3 } from '@masknet/web3-providers'
import { useRedPacketTrans } from '../locales/index.js'
import { reduceUselessPayloadInfo } from './utils/reduceUselessPayloadInfo.js'
import { RedPacketMetaKey } from '../constants.js'
import type { RedPacketSettings } from './hooks/useCreateCallback.js'
import { RedPacketConfirmDialog } from './RedPacketConfirmDialog.js'
import { RedPacketPast } from './RedPacketPast.js'
import { RedPacketERC20Form } from './RedPacketERC20Form.js'
import { RedPacketERC721Form } from './RedPacketERC721Form.js'
import { openComposition } from './openComposition.js'
import { FireflyRedPacketPast } from './FireflyRedPacketPast.js'
import { FireflyRedPacketHistoryDetails } from './FireflyRedPacketHistroyDetails.js'
import { set } from 'date-fns'

const useStyles = makeStyles<{ scrollY: boolean; isDim: boolean }>()((theme, { isDim }) => {
    // it's hard to set dynamic color, since the background color of the button is blended transparent
    const darkBackgroundColor = isDim ? '#38414b' : '#292929'
    return {
        dialogContent: {
            padding: 0,
            '::-webkit-scrollbar': {
                display: 'none',
            },

            overflowX: 'hidden',
            overflowY: scrollY ? 'auto' : 'hidden',
        },
        abstractTabWrapper: {
            width: '100%',
            paddingBottom: theme.spacing(2),
        },
        arrowButton: {
            backgroundColor: theme.palette.mode === 'dark' ? darkBackgroundColor : undefined,
        },
    }
})

enum CreateRedPacketPageStep {
    NewRedPacketPage = 'new',
    ConfirmPage = 'confirm',
}

interface RedPacketDialogProps {
    open: boolean
    onClose: () => void
    isOpenFromApplicationBoard?: boolean
    source?: PluginID
}

export default function RedPacketDialog(props: RedPacketDialogProps) {
    const t = useRedPacketTrans()
    const [showHistory, setShowHistory] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const [rpid, setRpid] = useState<string>('')
    const [gasOption, setGasOption] = useState<GasConfig>()

    const [step, setStep] = useState(CreateRedPacketPageStep.NewRedPacketPage)

    const [isNFTRedPacketLoaded, setIsNFTRedPacketLoaded] = useState(false)
    const { account, chainId: contextChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const definition = useActivatedPluginSiteAdaptor.visibility.useAnyMode(PluginID.RedPacket)
    const [currentTab, onChange, tabs] = useTabs('tokens', 'collectibles')
    const [currentHistoryTab, onChangeHistoryTab, historyTabs] = useTabs('sent', 'claimed')
    const theme = useTheme()
    const mode = useSiteThemeMode(theme)
    const { classes } = useStyles({ isDim: mode === 'dim', scrollY: !showHistory && currentTab === 'tokens' })
    const chainIdList: ChainId[] = useMemo(() => {
        if (currentTab === tabs.tokens)
            return definition?.enableRequirement.web3?.[NetworkPluginID.PLUGIN_EVM]?.supportedChainIds ?? EMPTY_LIST
        return [ChainId.Mainnet, ChainId.BSC, ChainId.Matic]
    }, [currentTab === tabs.tokens, definition?.enableRequirement.web3])
    const chainId = chainIdList.includes(contextChainId) ? contextChainId : ChainId.Mainnet

    // #region token lucky drop
    const [settings, setSettings] = useState<RedPacketSettings>()
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

    const onCreateOrSelect = useCallback(
        async (payload: RedPacketJSONPayload) => {
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

            senderName && (payload.sender.name = senderName)
            openComposition(RedPacketMetaKey, reduceUselessPayloadInfo(payload))
            Telemetry.captureEvent(EventType.Access, EventID.EntryAppLuckCreate)
            ApplicationBoardModal.close()
            handleClose()
        },
        [senderName, handleClose],
    )

    const onBack = useCallback(() => {
        if (step === CreateRedPacketPageStep.ConfirmPage) setStep(CreateRedPacketPageStep.NewRedPacketPage)
        if (step === CreateRedPacketPageStep.NewRedPacketPage) {
            handleClose()
            if (props.source === PluginID.SmartPay) {
                CrossIsolationMessages.events.smartPayDialogEvent.sendToAll({ open: true })
            }
        }
    }, [step, props.source === PluginID.SmartPay, handleClose])
    const isCreateStep = step === CreateRedPacketPageStep.NewRedPacketPage
    const onNext = useCallback(() => {
        if (isCreateStep) setStep(CreateRedPacketPageStep.ConfirmPage)
    }, [isCreateStep])
    const onDialogClose = useCallback(() => {
        if (openSelectNFTDialog) return setOpenSelectNFTDialog(false)
        if (openNFTConfirmDialog) return setOpenNFTConfirmDialog(false)
        if (showHistory) return setShowHistory(false)
        onBack()
    }, [showHistory, openNFTConfirmDialog, openSelectNFTDialog, onBack])

    const _onChange = useCallback((val: Omit<RedPacketSettings, 'password'>) => {
        setSettings(val)
    }, [])

    const handleCreated = useCallback(
        (payload: RedPacketJSONPayload) => {
            onCreateOrSelect(payload)
            setSettings(undefined)
        },
        [onCreateOrSelect],
    )

    const title =
        showHistory ? t.history()
            : openSelectNFTDialog ? t.nft_select_collection()
                : openNFTConfirmDialog ? t.confirm()
                    : isCreateStep ? t.display_name()
                        : t.details()

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

    const handleOpenDetails = useCallback((redpacket_id: string) => {
        setRpid(redpacket_id)
        setShowDetails(true)
        setShowHistory(false)
    }, [setShowDetails, setRpid, setShowHistory])

    return (
        <TabContext value={showHistory ? currentHistoryTab : currentTab}>
            <InjectedDialog
                isOpenFromApplicationBoard={props.isOpenFromApplicationBoard}
                open={props.open}
                title={title}
                titleTail={
                    step === CreateRedPacketPageStep.NewRedPacketPage && !openNFTConfirmDialog && !showHistory ?
                        <Icons.History onClick={() => setShowHistory((history) => !history)} />
                        : null
                }
                titleTabs={
                    step === CreateRedPacketPageStep.NewRedPacketPage && !openNFTConfirmDialog && !showDetails ? showHistory ? <MaskTabList variant="base" onChange={onChangeHistoryTab} aria-label="Redpacket">
                        <Tab label={t.sent_tab_title()} value={historyTabs.sent} />
                        <Tab label={t.claimed_tab_title()} value={historyTabs.claimed} />
                    </MaskTabList> :
                        <MaskTabList variant="base" onChange={onChange} aria-label="Redpacket">
                            <Tab label={t.erc20_tab_title()} value={tabs.tokens} />
                            <Tab label={t.erc721_tab_title()} value={tabs.collectibles} />
                        </MaskTabList>
                        : null
                }
                networkTabs={
                    step === CreateRedPacketPageStep.NewRedPacketPage && !openNFTConfirmDialog && !openSelectNFTDialog && !showHistory ?
                        <div className={classes.abstractTabWrapper}>
                            <NetworkTab
                                chains={chainIdList}
                                hideArrowButton={currentTab === tabs.collectibles}
                                pluginID={NetworkPluginID.PLUGIN_EVM}
                                classes={{ arrowButton: classes.arrowButton }}
                            />
                        </div>
                        : null
                }
                onClose={onDialogClose}
                isOnBack={showHistory || step !== CreateRedPacketPageStep.NewRedPacketPage}
                disableTitleBorder>
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
                                        onClose={handleClose}
                                        onNext={onNext}
                                        onChange={_onChange}
                                        gasOption={gasOption}
                                        onGasOptionChange={handleGasSettingChange}
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
                            {showHistory ?
                                <FireflyRedPacketPast tabs={historyTabs} onSelect={onCreateOrSelect} onClose={handleClose} handleOpenDetails={handleOpenDetails} />
                                : null}

                            {showDetails ?
                                <FireflyRedPacketHistoryDetails rpid={rpid} />
                                : null}
                        </>
                        : null}

                    {step === CreateRedPacketPageStep.ConfirmPage ?
                        <RedPacketConfirmDialog
                            expectedChainId={chainId}
                            onClose={handleClose}
                            onBack={onBack}
                            onCreated={handleCreated}
                            settings={settings}
                            gasOption={gasOption}
                            onGasOptionChange={handleGasSettingChange}
                        />
                        : null}
                </DialogContent>
            </InjectedDialog>
        </TabContext >
    )
}
