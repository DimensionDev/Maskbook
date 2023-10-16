import { useCallback, useMemo, useState } from 'react'
import { compact } from 'lodash-es'
import { sha3 } from 'web3-utils'
import { DialogContent, Tab, useTheme } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'
import { CrossIsolationMessages, NetworkPluginID, PluginID } from '@masknet/shared-base'
import { useChainContext, useGasPrice } from '@masknet/web3-hooks-base'
import { ApplicationBoardModal, InjectedDialog, NetworkTab, useCurrentLinkedPersona } from '@masknet/shared'
import { ChainId, type GasConfig, GasEditor } from '@masknet/web3-shared-evm'
import { type RedPacketJSONPayload } from '@masknet/web3-providers/types'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { useActivatedPlugin } from '@masknet/plugin-infra/dom'
import { Icons } from '@masknet/icons'
import { Telemetry } from '@masknet/web3-telemetry'
import { EventID, EventType } from '@masknet/web3-telemetry/types'
import {
    useCurrentVisitingIdentity,
    useLastRecognizedIdentity,
    useSiteThemeMode,
} from '@masknet/plugin-infra/content-script'
import { Web3 } from '@masknet/web3-providers'
import { useRedPacketTrans } from '../locales/index.js'
import { reduceUselessPayloadInfo } from './utils/reduceUselessPayloadInfo.js'
import { RedPacketMetaKey } from '../constants.js'
import type { RedPacketSettings } from './hooks/useCreateCallback.js'
import { RedPacketConfirmDialog } from './RedPacketConfirmDialog.js'
import { RedPacketPast } from './RedPacketPast.js'
import { RedPacketERC20Form } from './RedPacketERC20Form.js'
import { RedPacketERC721Form } from './RedPacketERC721Form.js'
import { openComposition } from './openComposition.js'

const useStyles = makeStyles<{ currentTab: 'tokens' | 'collectibles'; showHistory: boolean; isDim: boolean }>()((
    theme,
    { currentTab, showHistory, isDim },
) => {
    // it's hard to set dynamic color, since the background color of the button is blended transparent
    const darkBackgroundColor = isDim ? '#38414b' : '#292929'
    return {
        dialogContent: {
            padding: 0,
            '::-webkit-scrollbar': {
                display: 'none',
            },

            overflowX: 'hidden',
            overflowY: !showHistory && currentTab === 'tokens' ? 'hidden' : 'auto',
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
    const [gasOption, setGasOption] = useState<GasConfig>()

    const [step, setStep] = useState(CreateRedPacketPageStep.NewRedPacketPage)

    const [isNFTRedPacketLoaded, setIsNFTRedPacketLoaded] = useState(false)
    const { account, chainId: _chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const approvalDefinition = useActivatedPlugin(PluginID.RedPacket, 'any')
    const [currentTab, onChange, tabs] = useTabs('tokens', 'collectibles')
    const theme = useTheme()
    const mode = useSiteThemeMode(theme)
    const { classes } = useStyles({ currentTab, showHistory, isDim: mode === 'dim' })
    const chainIdList = useMemo(() => {
        return compact<ChainId>(
            currentTab === tabs.tokens
                ? approvalDefinition?.enableRequirement.web3?.[NetworkPluginID.PLUGIN_EVM]?.supportedChainIds ?? []
                : [ChainId.Mainnet, ChainId.BSC, ChainId.Matic],
        )
    }, [currentTab === tabs.tokens, approvalDefinition?.enableRequirement.web3])
    const chainId = chainIdList.includes(_chainId) ? _chainId : ChainId.Mainnet

    // #region token lucky drop
    const [settings, setSettings] = useState<RedPacketSettings>()
    // #endregion
    // #region nft lucky drop
    const [openNFTConfirmDialog, setOpenNFTConfirmDialog] = useState(false)
    const [openSelectNFTDialog, setOpenSelectNFTDialog] = useState(false)
    // #endregion

    const onClose = useCallback(() => {
        setStep(CreateRedPacketPageStep.NewRedPacketPage)
        setSettings(undefined)
        props.onClose()
    }, [props, step])

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
                    payload.password = await Web3.signMessage('message', sha3(payload.sender.message) ?? '', {
                        account,
                    })
                    payload.password = payload.password.slice(2)
                }
            }

            senderName && (payload.sender.name = senderName)
            openComposition(RedPacketMetaKey, reduceUselessPayloadInfo(payload))
            Telemetry.captureEvent(EventType.Access, EventID.EntryAppLuckCreate)
            ApplicationBoardModal.close()
            onClose()
        },
        [chainId, senderName],
    )

    const onBack = useCallback(() => {
        if (step === CreateRedPacketPageStep.ConfirmPage) setStep(CreateRedPacketPageStep.NewRedPacketPage)
        if (step === CreateRedPacketPageStep.NewRedPacketPage) {
            onClose()
            if (props.source === PluginID.SmartPay) {
                CrossIsolationMessages.events.smartPayDialogEvent.sendToAll({ open: true })
            }
        }
    }, [step, props.source])
    const onNext = useCallback(() => {
        if (step === CreateRedPacketPageStep.NewRedPacketPage) setStep(CreateRedPacketPageStep.ConfirmPage)
    }, [step])
    const onDialogClose = useCallback(() => {
        openSelectNFTDialog
            ? setOpenSelectNFTDialog(false)
            : openNFTConfirmDialog
            ? setOpenNFTConfirmDialog(false)
            : showHistory
            ? setShowHistory(false)
            : onBack()
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

    const isCreateStep = step === CreateRedPacketPageStep.NewRedPacketPage
    const title = showHistory
        ? t.history()
        : openSelectNFTDialog
        ? t.nft_select_collection()
        : openNFTConfirmDialog
        ? t.confirm()
        : isCreateStep
        ? t.display_name()
        : t.details()

    // #region gas config
    const { data: defaultGasPrice } = useGasPrice(NetworkPluginID.PLUGIN_EVM, { chainId })
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

    return (
        <TabContext value={currentTab}>
            <InjectedDialog
                isOpenFromApplicationBoard={props.isOpenFromApplicationBoard}
                open={props.open}
                title={title}
                titleTail={
                    step === CreateRedPacketPageStep.NewRedPacketPage && !openNFTConfirmDialog && !showHistory ? (
                        <Icons.History onClick={() => setShowHistory((history) => !history)} />
                    ) : null
                }
                titleTabs={
                    step === CreateRedPacketPageStep.NewRedPacketPage && !openNFTConfirmDialog ? (
                        <MaskTabList variant="base" onChange={onChange} aria-label="Redpacket">
                            <Tab label={t.erc20_tab_title()} value={tabs.tokens} />
                            <Tab label={t.erc721_tab_title()} value={tabs.collectibles} />
                        </MaskTabList>
                    ) : null
                }
                networkTabs={
                    step === CreateRedPacketPageStep.NewRedPacketPage &&
                    !openNFTConfirmDialog &&
                    !openSelectNFTDialog ? (
                        <div className={classes.abstractTabWrapper}>
                            <NetworkTab
                                chains={chainIdList}
                                hideArrowButton={currentTab === tabs.collectibles}
                                pluginID={NetworkPluginID.PLUGIN_EVM}
                                classes={{ arrowButton: classes.arrowButton }}
                            />
                        </div>
                    ) : null
                }
                onClose={onDialogClose}
                isOnBack={showHistory || step !== CreateRedPacketPageStep.NewRedPacketPage}
                disableTitleBorder>
                <DialogContent className={classes.dialogContent}>
                    {step === CreateRedPacketPageStep.NewRedPacketPage ? (
                        <>
                            <div
                                style={{
                                    ...(showHistory ? { display: 'none' } : {}),
                                    height: showHistory
                                        ? 0
                                        : currentTab === 'collectibles' && isNFTRedPacketLoaded
                                        ? 'calc(100% + 84px)'
                                        : 'auto',
                                }}>
                                <TabPanel value={tabs.tokens} style={{ padding: 0, height: 474 }}>
                                    <RedPacketERC20Form
                                        expectedChainId={chainId}
                                        origin={settings}
                                        onClose={onClose}
                                        onNext={onNext}
                                        onChange={_onChange}
                                        gasOption={gasOption}
                                        onGasOptionChange={handleGasSettingChange}
                                    />
                                </TabPanel>
                                <TabPanel
                                    value={tabs.collectibles}
                                    style={{ padding: 0, height: openNFTConfirmDialog ? 564 : 474 }}>
                                    <RedPacketERC721Form
                                        openSelectNFTDialog={openSelectNFTDialog}
                                        setOpenSelectNFTDialog={setOpenSelectNFTDialog}
                                        setOpenNFTConfirmDialog={setOpenNFTConfirmDialog}
                                        openNFTConfirmDialog={openNFTConfirmDialog}
                                        onClose={onClose}
                                        setIsNFTRedPacketLoaded={setIsNFTRedPacketLoaded}
                                        gasOption={gasOption}
                                        onGasOptionChange={handleGasSettingChange}
                                    />
                                </TabPanel>
                            </div>
                            {showHistory ? (
                                <RedPacketPast tabs={tabs} onSelect={onCreateOrSelect} onClose={onClose} />
                            ) : null}
                        </>
                    ) : null}

                    {step === CreateRedPacketPageStep.ConfirmPage ? (
                        <RedPacketConfirmDialog
                            expectedChainId={chainId}
                            onClose={onClose}
                            onBack={onBack}
                            onCreated={handleCreated}
                            settings={settings}
                            gasOption={gasOption}
                            onGasOptionChange={handleGasSettingChange}
                        />
                    ) : null}
                </DialogContent>
            </InjectedDialog>
        </TabContext>
    )
}
