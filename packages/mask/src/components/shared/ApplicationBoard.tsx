import { useContext, createContext, PropsWithChildren, useMemo, useCallback, useEffect } from 'react'
import { makeStyles, getMaskColor } from '@masknet/theme'
import { Typography } from '@mui/material'
import { useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { useCurrentWeb3NetworkPluginID, useAccount, useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { formatPersonaPublicKey } from '@masknet/shared-base'
import { getCurrentSNSNetwork } from '../../social-network-adaptor/utils'
import { activatedSocialNetworkUI } from '../../social-network'
import { useI18N } from '../../utils'
import { Application, getUnlistedApp } from './ApplicationSettingPluginList'
import { ApplicationRecommendArea } from './ApplicationRecommendArea'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { useNextIDConnectStatus } from '../DataSource/useNextID'
import { usePersonaConnectStatus } from '../DataSource/usePersonaConnectStatus'
import { usePersonaAgainstSNSConnectStatus } from '../DataSource/usePersonaAgainstSNSConnectStatus'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { PersonaContext } from '../../extension/popups/pages/Personas/hooks/usePersonaContext'
import { MaskMessages } from '../../../shared'

const useStyles = makeStyles<{ shouldScroll: boolean }>()((theme, props) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    return {
        applicationWrapper: {
            padding: theme.spacing(1, 0.25),
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            overflowY: 'auto',
            overflowX: 'hidden',
            gridTemplateRows: '100px',
            gridGap: 10,
            justifyContent: 'space-between',
            height: 320,
            width: props.shouldScroll ? 589 : 576,
            '::-webkit-scrollbar': {
                backgroundColor: 'transparent',
                width: 20,
            },
            '::-webkit-scrollbar-thumb': {
                borderRadius: '20px',
                width: 5,
                border: '7px solid rgba(0, 0, 0, 0)',
                backgroundColor: theme.palette.maskColor.secondaryLine,
                backgroundClip: 'padding-box',
            },
            [smallQuery]: {
                overflow: 'auto',
                overscrollBehavior: 'contain',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridGap: theme.spacing(1),
            },
        },
        subTitle: {
            cursor: 'default',
            fontSize: 18,
            lineHeight: '24px',
            fontWeight: 600,
            color: theme.palette.text.primary,
        },
        loadingWrapper: {
            display: 'flex',
            height: 324,
            justifyContent: 'center',
            alignItems: 'center',
        },
        placeholderWrapper: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingRight: 24,
            height: 324,
        },
        placeholder: {
            color: getMaskColor(theme).textLight,
        },
        recommendFeatureAppListWrapper: {
            display: 'flex',
            overflowX: 'scroll',
            margin: '0 2px 4px 2px',
            padding: '8px 2px 0 2px',
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        carousel: {
            height: 130,
            overflowX: 'scroll',
            overscrollBehavior: 'contain',
            '& .carousel__slider': {
                padding: '8px 2px 0',
                overscrollBehavior: 'contain',
                overflowX: 'scroll',
                '&::-webkit-scrollbar': {
                    display: 'none',
                },
            },
        },
    }
})

interface Props {
    closeDialog(): void
}

export function ApplicationBoard(props: Props) {
    return (
        <PersonaContext.Provider>
            <ApplicationEntryStatusProvider>
                <ApplicationBoardContent {...props} />
            </ApplicationEntryStatusProvider>
        </PersonaContext.Provider>
    )
}

function ApplicationBoardContent(props: Props) {
    const { t } = useI18N()
    const snsAdaptorPlugins = useActivatedPluginsSNSAdaptor('any')
    const currentWeb3Network = useCurrentWeb3NetworkPluginID()
    const chainId = useChainId()
    const account = useAccount()
    const currentSNSNetwork = getCurrentSNSNetwork(activatedSocialNetworkUI.networkIdentifier)
    const applicationList = useMemo(
        () =>
            snsAdaptorPlugins
                .flatMap(({ ID, ApplicationEntries, enableRequirement }) => {
                    if (!ApplicationEntries) return []
                    const currentWeb3NetworkSupportedChainIds = enableRequirement.web3?.[currentWeb3Network]
                    const isWalletConnectedRequired = currentWeb3NetworkSupportedChainIds !== undefined
                    const currentSNSIsSupportedNetwork = enableRequirement.networks.networks[currentSNSNetwork]
                    const isSNSEnabled = currentSNSIsSupportedNetwork === undefined || currentSNSIsSupportedNetwork
                    return ApplicationEntries.map((entry) => ({
                        entry,
                        enabled: isSNSEnabled,
                        pluginId: ID,
                        isWalletConnectedRequired: !account && isWalletConnectedRequired,
                        isWalletConnectedEVMRequired: Boolean(
                            account && currentWeb3Network !== NetworkPluginID.PLUGIN_EVM && isWalletConnectedRequired,
                        ),
                    }))
                })
                .sort((a, b) => {
                    return (a.entry.appBoardSortingDefaultPriority ?? 0) - (b.entry.appBoardSortingDefaultPriority ?? 0)
                })
                .filter((x) => Boolean(x.entry.RenderEntryComponent)),
        [snsAdaptorPlugins, currentWeb3Network, chainId, account],
    )
    const recommendFeatureAppList = applicationList
        .filter((x) => x.entry.recommendFeature)
        .sort((a, b) => (a.entry.appBoardSortingDefaultPriority ?? 0) - (b.entry.appBoardSortingDefaultPriority ?? 0))

    const listedAppList = applicationList.filter((x) => !x.entry.recommendFeature).filter((x) => !getUnlistedApp(x))
    const { classes } = useStyles({ shouldScroll: listedAppList.length > 12 })
    return (
        <>
            <ApplicationRecommendArea
                recommendFeatureAppList={recommendFeatureAppList}
                RenderEntryComponent={RenderEntryComponent}
            />

            {listedAppList.length > 0 ? (
                <section className={classes.applicationWrapper}>
                    {listedAppList.map((application) => (
                        <RenderEntryComponent key={application.entry.ApplicationEntryID} application={application} />
                    ))}
                </section>
            ) : (
                <div className={classes.placeholderWrapper}>
                    <Typography className={classes.placeholder}>
                        {t('application_display_tab_plug_app-unlisted-placeholder')}
                    </Typography>
                </div>
            )}
        </>
    )
}

function RenderEntryComponent({ application }: { application: Application }) {
    const Entry = application.entry.RenderEntryComponent!
    const { t } = useI18N()
    const { setDialog: setSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )
    const { closeDialog: closeApplicationBoard } = useRemoteControlledDialog(
        WalletMessages.events.ApplicationDialogUpdated,
    )
    const ApplicationEntryStatus = useContext(ApplicationEntryStatusContext)

    // #region entry disabled
    const disabled = useMemo(() => {
        if (!application.enabled) return true

        if (application.entry.nextIdRequired) {
            return Boolean(
                ApplicationEntryStatus.isLoading ||
                    ApplicationEntryStatus.isNextIDVerify === undefined ||
                    (!ApplicationEntryStatus.isSNSConnectToCurrentPersona && ApplicationEntryStatus.isPersonaConnected),
            )
        } else {
            return false
        }
    }, [application, ApplicationEntryStatus])
    // #endregion

    // #region entry click effect
    const createOrConnectPersona = useCallback(() => {
        closeApplicationBoard()
        ApplicationEntryStatus.personaConnectAction?.()
    }, [ApplicationEntryStatus])

    const verifyPersona = useCallback(() => {
        closeApplicationBoard()
        ApplicationEntryStatus.personaNextIDReset?.()
    }, [])

    const clickHandler = (() => {
        if (application.isWalletConnectedRequired || application.isWalletConnectedEVMRequired)
            return (walletConnectedCallback?: () => void) =>
                setSelectProviderDialog({ open: true, walletConnectedCallback })
        if (!application.entry.nextIdRequired) return
        if (ApplicationEntryStatus.isPersonaConnected === false || ApplicationEntryStatus.isPersonaCreated === false)
            return createOrConnectPersona
        if (ApplicationEntryStatus.shouldVerifyNextId) return verifyPersona
        return
    })()

    // #endregion

    // #region tooltip hint
    const tooltipHint = (() => {
        if (ApplicationEntryStatus.isLoading) return
        if (application.isWalletConnectedRequired) return t('application_tooltip_hint_connect_wallet')
        if (application.isWalletConnectedEVMRequired) return t('application_tooltip_hint_switch_to_evm_wallet')
        if (!application.entry.nextIdRequired) return
        if (ApplicationEntryStatus.isPersonaCreated === false && !disabled)
            return t('application_tooltip_hint_create_persona')
        if (ApplicationEntryStatus.isPersonaConnected === false && !disabled)
            return t('application_tooltip_hint_connect_persona')
        if (ApplicationEntryStatus.shouldVerifyNextId && !disabled) return t('application_tooltip_hint_verify')
        if (ApplicationEntryStatus.shouldDisplayTooltipHint)
            return t('application_tooltip_hint_sns_persona_unmatched', {
                currentPersonaPublicKey: formatPersonaPublicKey(
                    ApplicationEntryStatus.currentPersonaPublicKey ?? '',
                    4,
                ),
                currentSNSConnectedPersonaPublicKey: formatPersonaPublicKey(
                    ApplicationEntryStatus.currentSNSConnectedPersonaPublicKey ?? '',
                    4,
                ),
            })
        return
    })()
    // #endregion

    return <Entry disabled={disabled} tooltipHint={tooltipHint} onClick={clickHandler} />
}

interface ApplicationEntryStatusContextProps {
    isPersonaConnected: boolean | undefined
    isPersonaCreated: boolean | undefined
    isNextIDVerify: boolean | undefined
    isSNSConnectToCurrentPersona: boolean | undefined
    shouldDisplayTooltipHint: boolean | undefined
    shouldVerifyNextId: boolean | undefined
    currentPersonaPublicKey: string | undefined
    currentSNSConnectedPersonaPublicKey: string | undefined
    personaConnectAction: (() => void) | undefined
    personaNextIDReset: (() => void) | undefined
    isLoading: boolean
}

const ApplicationEntryStatusContext = createContext<ApplicationEntryStatusContextProps>({
    isPersonaConnected: undefined,
    isPersonaCreated: undefined,
    isNextIDVerify: undefined,
    isSNSConnectToCurrentPersona: undefined,
    shouldDisplayTooltipHint: undefined,
    shouldVerifyNextId: undefined,
    currentPersonaPublicKey: undefined,
    currentSNSConnectedPersonaPublicKey: undefined,
    personaConnectAction: undefined,
    personaNextIDReset: undefined,
    isLoading: false,
})

function ApplicationEntryStatusProvider(props: PropsWithChildren<{}>) {
    const personaConnectStatus = usePersonaConnectStatus()
    const nextIDConnectStatus = useNextIDConnectStatus()

    const {
        value: ApplicationCurrentStatus,
        retry,
        loading: personaAgainstSNSConnectStatusLoading,
    } = usePersonaAgainstSNSConnectStatus()

    useEffect(() => {
        return MaskMessages.events.currentPersonaIdentifier.on(retry)
    }, [])

    const { isSNSConnectToCurrentPersona, currentPersonaPublicKey, currentSNSConnectedPersonaPublicKey } =
        ApplicationCurrentStatus ?? {}

    return (
        <ApplicationEntryStatusContext.Provider
            value={{
                personaConnectAction: personaConnectStatus.action ?? undefined,
                personaNextIDReset: nextIDConnectStatus.reset ?? undefined,
                isPersonaCreated: personaConnectStatus.hasPersona,
                isPersonaConnected: personaConnectStatus.connected,
                isNextIDVerify: nextIDConnectStatus.isVerified,
                isSNSConnectToCurrentPersona,
                shouldDisplayTooltipHint:
                    ApplicationCurrentStatus?.isSNSConnectToCurrentPersona === false && personaConnectStatus.connected,
                shouldVerifyNextId: Boolean(!nextIDConnectStatus.isVerified && ApplicationCurrentStatus),
                currentPersonaPublicKey,
                currentSNSConnectedPersonaPublicKey,
                isLoading: nextIDConnectStatus.loading || personaAgainstSNSConnectStatusLoading,
            }}>
            {props.children}
        </ApplicationEntryStatusContext.Provider>
    )
}
