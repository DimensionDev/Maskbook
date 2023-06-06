import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react'
import { useTimeout } from 'react-use'
import { Typography } from '@mui/material'
import { useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { useCurrentPersonaConnectStatus, SelectProviderDialog } from '@masknet/shared'
import { useValueRef } from '@masknet/shared-base-ui'
import { Boundary, getMaskColor, makeStyles } from '@masknet/theme'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useNetworkContext, useMountReport } from '@masknet/web3-hooks-base'
import { EventID } from '@masknet/web3-telemetry/types'
import { currentPersonaIdentifier } from '../../../shared/legacy-settings/settings.js'
import { PersonaContext } from '../../extension/popups/pages/Personas/hooks/usePersonaContext.js'
import Services from '../../extension/service.js'
import { getCurrentSNSNetwork } from '../../social-network-adaptor/utils.js'
import { activatedSocialNetworkUI } from '../../social-network/index.js'
import { MaskMessages, useI18N } from '../../utils/index.js'
import { useLastRecognizedIdentity } from '../DataSource/useActivatedUI.js'
import { usePersonaAgainstSNSConnectStatus } from '../DataSource/usePersonaAgainstSNSConnectStatus.js'
import { usePersonasFromDB } from '../DataSource/usePersonasFromDB.js'
import { ApplicationRecommendArea } from './ApplicationRecommendArea.js'
import { useUnlistedEntries, type Application } from './ApplicationSettingPluginList.js'

const useStyles = makeStyles<{
    shouldScroll: boolean
    isCarouselReady: boolean
}>()((theme, props) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    return {
        applicationWrapper: {
            padding: theme.spacing(0, navigator.userAgent.includes('Firefox') ? 1.5 : 0.25, 1, 3),
            transform: props.isCarouselReady ? 'translateX(-8px)' : 'translateX(-8px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            overflowY: 'auto',
            overflowX: 'hidden',
            gridTemplateRows: '100px',
            gridGap: 10,
            justifyContent: 'space-between',
            height: 386,
            width: props.shouldScroll && !navigator.userAgent.includes('Firefox') ? 583 : 570,
            scrollbarColor: `${theme.palette.maskColor.secondaryLine} ${theme.palette.maskColor.secondaryLine}`,
            scrollbarWidth: 'thin',
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
        applicationWrapperWithCarousel: {
            position: 'relative',
            zIndex: 50,
            top: '-132px',
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
    }
})

export function ApplicationBoard() {
    return (
        <PersonaContext.Provider>
            <ApplicationEntryStatusProvider>
                <ApplicationBoardContent />
            </ApplicationEntryStatusProvider>
        </PersonaContext.Provider>
    )
}

function ApplicationBoardContent() {
    const { t } = useI18N()
    const snsAdaptorPlugins = useActivatedPluginsSNSAdaptor('any')
    const { pluginID: currentWeb3Network } = useNetworkContext()
    const { account, chainId } = useChainContext()
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
                        pluginID: ID,
                        isWalletConnectedRequired:
                            !account && isWalletConnectedRequired && !entry.entryWalletConnectedNotRequired,
                    }))
                })
                .sort((a, b) => {
                    return (a.entry.appBoardSortingDefaultPriority ?? 0) - (b.entry.appBoardSortingDefaultPriority ?? 0)
                })
                .filter((x) => !!x.entry.RenderEntryComponent),
        [snsAdaptorPlugins, currentWeb3Network, chainId, account],
    )
    const recommendFeatureAppList = applicationList
        .filter((x) => x.entry.recommendFeature)
        .sort((a, b) => (a.entry.appBoardSortingDefaultPriority ?? 0) - (b.entry.appBoardSortingDefaultPriority ?? 0))

    const unlistedEntries = useUnlistedEntries()
    const listedAppList = applicationList.filter(
        (x) => !x.entry.recommendFeature && !unlistedEntries.includes(x.entry.ApplicationEntryID),
    )
    // #region handle carousel ui
    const [isCarouselReady] = useTimeout(300)
    const [isHoveringCarousel, setIsHoveringCarousel] = useState(false)
    // #endregion
    const { classes, cx } = useStyles({
        shouldScroll: listedAppList.length > 12,
        isCarouselReady: !!isCarouselReady(),
    })

    useMountReport(EventID.AccessApplicationBoard)

    return (
        <>
            <ApplicationRecommendArea
                recommendFeatureAppList={recommendFeatureAppList}
                isCarouselReady={isCarouselReady}
                RenderEntryComponent={RenderEntryComponent}
                isHoveringCarousel={isHoveringCarousel}
                setIsHoveringCarousel={setIsHoveringCarousel}
            />

            {listedAppList.length > 0 ? (
                <Boundary>
                    <section
                        className={cx(
                            classes.applicationWrapper,
                            recommendFeatureAppList.length > 2 && isCarouselReady() && isHoveringCarousel
                                ? classes.applicationWrapperWithCarousel
                                : '',
                        )}>
                        {listedAppList.map((application) => (
                            <RenderEntryComponent
                                key={application.entry.ApplicationEntryID}
                                application={application}
                            />
                        ))}
                    </section>
                </Boundary>
            ) : (
                <div
                    className={cx(
                        classes.placeholderWrapper,
                        recommendFeatureAppList.length > 2 && isCarouselReady() && isHoveringCarousel
                            ? classes.applicationWrapperWithCarousel
                            : '',
                    )}>
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

    const ApplicationEntryStatus = useContext(ApplicationEntryStatusContext)

    // #region entry disabled
    const disabled = useMemo(() => {
        if (!application.enabled) return true

        return !!application.entry.nextIdRequired && ApplicationEntryStatus.isLoading
    }, [application, ApplicationEntryStatus])
    // #endregion

    const clickHandler = useMemo(() => {
        if (application.isWalletConnectedRequired) {
            return (walletConnectedCallback?: () => void, requiredSupportPluginID?: NetworkPluginID) =>
                SelectProviderDialog.open({ walletConnectedCallback, requiredSupportPluginID })
        }
        if (!application.entry.nextIdRequired) return
        if (ApplicationEntryStatus.isPersonaCreated === false) return ApplicationEntryStatus.personaAction as () => void
        if (ApplicationEntryStatus.shouldVerifyNextId)
            return () => ApplicationEntryStatus.personaAction?.(application.pluginID)
        return
    }, [ApplicationEntryStatus, application])

    // #endregion

    // #region tooltip hint
    const tooltipHint = (() => {
        if (ApplicationEntryStatus.isLoading) return
        if (application.isWalletConnectedRequired) return t('application_tooltip_hint_connect_wallet')
        if (!application.entry.nextIdRequired) return
        if (ApplicationEntryStatus.isPersonaCreated === false && !disabled)
            return t('application_tooltip_hint_create_persona')
        if (ApplicationEntryStatus.isPersonaConnected === false && !disabled)
            return t('application_tooltip_hint_connect_persona')
        if (ApplicationEntryStatus.shouldVerifyNextId && !disabled) return t('application_tooltip_hint_verify')
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
    personaAction: ((target?: string | undefined, position?: 'center' | 'top-right' | undefined) => void) | undefined
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
    personaAction: undefined,
    isLoading: false,
})
ApplicationEntryStatusContext.displayName = 'ApplicationEntryStatusContext'

function ApplicationEntryStatusProvider({ children }: PropsWithChildren<{}>) {
    const allPersonas = usePersonasFromDB()
    const lastRecognized = useLastRecognizedIdentity()
    const currentIdentifier = useValueRef(currentPersonaIdentifier)
    const { value: personaConnectStatus, loading: personaStatusLoading } = useCurrentPersonaConnectStatus(
        allPersonas,
        currentIdentifier,
        Services.Helper.openDashboard,
        lastRecognized,
        MaskMessages,
    )
    const { value: ApplicationCurrentStatus, loading: personaAgainstSNSConnectStatusLoading } =
        usePersonaAgainstSNSConnectStatus()

    const { isSNSConnectToCurrentPersona, currentPersonaPublicKey, currentSNSConnectedPersonaPublicKey } =
        ApplicationCurrentStatus ?? {}

    const Context = useMemo(
        () => ({
            personaAction: personaConnectStatus.action,
            isPersonaCreated: personaConnectStatus.hasPersona,
            isPersonaConnected: personaConnectStatus.connected,
            isNextIDVerify: personaConnectStatus.verified,
            isSNSConnectToCurrentPersona,
            shouldDisplayTooltipHint:
                ApplicationCurrentStatus?.isSNSConnectToCurrentPersona === false && personaConnectStatus.connected,
            shouldVerifyNextId: !!(!personaConnectStatus.verified && ApplicationCurrentStatus),
            currentPersonaPublicKey,
            currentSNSConnectedPersonaPublicKey,
            isLoading: personaStatusLoading || personaAgainstSNSConnectStatusLoading,
        }),
        [
            ApplicationCurrentStatus,
            personaStatusLoading,
            personaAgainstSNSConnectStatusLoading,
            personaConnectStatus.action,
            personaConnectStatus.hasPersona,
            personaConnectStatus.connected,
            personaConnectStatus.verified,
        ],
    )
    return <ApplicationEntryStatusContext.Provider value={Context}>{children}</ApplicationEntryStatusContext.Provider>
}
