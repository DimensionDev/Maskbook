import { useCallback, useMemo, useState } from 'react'
import { compact } from 'lodash-es'
import Web3Utils from 'web3-utils'
import { CrossIsolationMessages, NetworkPluginID, PluginID } from '@masknet/shared-base'
import {
    useChainContext,
    useChainIdValid,
    Web3ContextProvider,
    useGasPrice,
    useNetworkContext,
} from '@masknet/web3-hooks-base'
import { InjectedDialog, NetworkTab } from '@masknet/shared'
import { ChainId, type GasConfig, GasEditor, type RedPacketJSONPayload } from '@masknet/web3-shared-evm'
import { makeStyles, MaskTabList, useTabs } from '@masknet/theme'
import { DialogContent, Tab } from '@mui/material'
import { useActivatedPlugin } from '@masknet/plugin-infra/dom'
import {
    useCurrentIdentity,
    useCurrentLinkedPersona,
    useLastRecognizedIdentity,
} from '../../../components/DataSource/useActivatedUI.js'
import { WalletMessages } from '@masknet/plugin-wallet'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { TabContext, TabPanel } from '@mui/lab'
import { Icons } from '@masknet/icons'
import { Web3 } from '@masknet/web3-providers'
import { useI18N } from '../locales/index.js'
import { useI18N as useBaseI18N } from '../../../utils/index.js'
import { reduceUselessPayloadInfo } from './utils/reduceUselessPayloadInfo.js'
import { RedPacketMetaKey } from '../constants.js'
import { DialogTabs } from '../types.js'
import type { RedPacketSettings } from './hooks/useCreateCallback.js'
import { RedPacketConfirmDialog } from './RedPacketConfirmDialog.js'
import { RedPacketPast } from './RedPacketPast.js'
import { RedPacketERC20Form } from './RedPacketERC20Form.js'
import { RedPacketERC721Form } from './RedPacketERC721Form.js'
import { openComposition } from './openComposition.js'

const useStyles = makeStyles<{ currentTab: 'tokens' | 'collectibles'; showHistory: boolean }>()(
    (theme, { currentTab, showHistory }) => ({
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
    }),
)

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
    const t = useI18N()
    const { t: i18n } = useBaseI18N()
    const [showHistory, setShowHistory] = useState(false)
    const [gasOption, setGasOption] = useState<GasConfig>()
    const { pluginID } = useNetworkContext()

    const [step, setStep] = useState(CreateRedPacketPageStep.NewRedPacketPage)

    const state = useState(DialogTabs.create)
    const [isNFTRedPacketLoaded, setIsNFTRedPacketLoaded] = useState(false)
    const { account, chainId, setChainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const chainIdValid = useChainIdValid(NetworkPluginID.PLUGIN_EVM, chainId)
    const approvalDefinition = useActivatedPlugin(PluginID.RedPacket, 'any')
    const [currentTab, onChange, tabs] = useTabs('tokens', 'collectibles')
    const { classes } = useStyles({ currentTab, showHistory })
    const chainIdList = useMemo(() => {
        return compact<ChainId>(
            currentTab === tabs.tokens
                ? approvalDefinition?.enableRequirement.web3?.[NetworkPluginID.PLUGIN_EVM]?.supportedChainIds ?? []
                : [ChainId.Mainnet, ChainId.BSC, ChainId.Matic],
        )
    }, [currentTab === tabs.tokens, approvalDefinition?.enableRequirement.web3])
    const networkTabChainId = chainIdValid && chainIdList.includes(chainId) ? chainId : ChainId.Mainnet

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
        const [, setValue] = state
        setValue(DialogTabs.create)
        props.onClose()
    }, [props, state, step])

    const currentIdentity = useCurrentIdentity()
    const { closeDialog: closeApplicationBoardDialog } = useRemoteControlledDialog(
        WalletMessages.events.applicationDialogUpdated,
    )
    const lastRecognized = useLastRecognizedIdentity()
    const { value: linkedPersona } = useCurrentLinkedPersona()
    const senderName =
        lastRecognized.identifier?.userId ?? currentIdentity?.identifier.userId ?? linkedPersona?.nickname

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
                    payload.password = await Web3.signMessage('message', Web3Utils.sha3(payload.sender.message) ?? '', {
                        account,
                    })
                    payload.password = payload.password.slice(2)
                }
            }

            senderName && (payload.sender.name = senderName)
            openComposition(RedPacketMetaKey, reduceUselessPayloadInfo(payload))
            closeApplicationBoardDialog()
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
        ? i18n('confirm')
        : isCreateStep
        ? t.display_name()
        : t.details()

    // #region gas config
    const { value: defaultGasPrice } = useGasPrice(NetworkPluginID.PLUGIN_EVM, { chainId })
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
        <Web3ContextProvider value={{ pluginID, chainId: networkTabChainId }}>
            <TabContext value={currentTab}>
                <InjectedDialog
                    isOpenFromApplicationBoard={props.isOpenFromApplicationBoard}
                    open={props.open}
                    title={title}
                    titleTail={
                        step === CreateRedPacketPageStep.NewRedPacketPage && !showHistory ? (
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
                                    onChange={(chainId: ChainId) => setChainId(chainId)}
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
        </Web3ContextProvider>
    )
}
