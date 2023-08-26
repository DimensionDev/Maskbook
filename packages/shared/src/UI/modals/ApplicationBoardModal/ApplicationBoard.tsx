import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react'
import { useTimeout } from 'react-use'
import { Typography } from '@mui/material'
import {
    SiteAdaptor,
    useActivatedPluginsSiteAdaptor,
    type IdentityResolved,
} from '@masknet/plugin-infra/content-script'
import {
    useCurrentPersonaConnectStatus,
    SelectProviderModal,
    useSharedI18N,
    PersonaContext,
    type PersonaPerSiteConnectStatus,
} from '@masknet/shared'
import { Boundary, getMaskColor, makeStyles } from '@masknet/theme'
import {
    currentPersonaIdentifier,
    type DashboardRoutes,
    type NetworkPluginID,
    type PersonaInformation,
} from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
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
            maxHeight: 386,
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

interface ApplicationBoardContentProps extends withClasses<'applicationWrapper' | 'recommendFeatureAppListWrapper'> {
    openDashboard?: (route?: DashboardRoutes, search?: string) => void
    queryOwnedPersonaInformation?: (initializedOnly: boolean) => Promise<PersonaInformation[]>
    currentSite?: SiteAdaptor
    lastRecognized?: IdentityResolved
    allPersonas: PersonaInformation[]
    applicationCurrentStatus?: PersonaPerSiteConnectStatus
    personaPerSiteConnectStatusLoading: boolean
}

export function ApplicationBoardContent({
    openDashboard,
    queryOwnedPersonaInformation,
    currentSite,
    lastRecognized,
    allPersonas,
    applicationCurrentStatus,
    personaPerSiteConnectStatusLoading,
    classes,
}: ApplicationBoardContentProps) {
    return (
        <PersonaContext.Provider initialState={{ queryOwnedPersonaInformation }}>
            <ApplicationEntryStatusProvider
                openDashboard={openDashboard}
                lastRecognized={lastRecognized}
                allPersonas={allPersonas}
                applicationCurrentStatus={applicationCurrentStatus}
                personaPerSiteConnectStatusLoading={personaPerSiteConnectStatusLoading}>
                <ApplicationBoardPluginsList
                    currentSite={currentSite}
                    classes={{
                        applicationWrapper: classes?.applicationWrapper,
                        recommendFeatureAppListWrapper: classes?.recommendFeatureAppListWrapper,
                    }}
                />
            </ApplicationEntryStatusProvider>
        </PersonaContext.Provider>
    )
}

interface ApplicationBoardPluginsListProps
    extends withClasses<'applicationWrapper' | 'recommendFeatureAppListWrapper'> {
    currentSite?: SiteAdaptor
}

function ApplicationBoardPluginsList(props: ApplicationBoardPluginsListProps) {
    const { currentSite = SiteAdaptor.Twitter } = props
    const t = useSharedI18N()
    const plugins = useActivatedPluginsSiteAdaptor('any')
    const { pluginID: currentWeb3Network } = useNetworkContext()
    const { account, chainId } = useChainContext()
    const applicationList = useMemo(
        () =>
            plugins
                .flatMap(({ ID, ApplicationEntries, enableRequirement }) => {
                    if (!ApplicationEntries) return []
                    const currentWeb3NetworkSupportedChainIds = enableRequirement.web3?.[currentWeb3Network]
                    const isWalletConnectedRequired = currentWeb3NetworkSupportedChainIds !== undefined
                    const currentSiteIsSupportedNetwork = enableRequirement.supports.sites[currentSite]
                    const isEnabledOnTheCurrentSite =
                        currentSiteIsSupportedNetwork === undefined || currentSiteIsSupportedNetwork
                    return ApplicationEntries.map((entry) => ({
                        entry,
                        enabled: isEnabledOnTheCurrentSite,
                        pluginID: ID,
                        isWalletConnectedRequired:
                            !account && isWalletConnectedRequired && !entry.entryWalletConnectedNotRequired,
                    }))
                })
                .sort((a, b) => {
                    return (a.entry.appBoardSortingDefaultPriority ?? 0) - (b.entry.appBoardSortingDefaultPriority ?? 0)
                })
                .filter((x) => !!x.entry.RenderEntryComponent),
        [plugins, currentWeb3Network, chainId, account],
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
    const { classes, cx } = useStyles(
        {
            shouldScroll: listedAppList.length > 12,
            isCarouselReady: !!isCarouselReady(),
        },
        { props },
    )

    return (
        <>
            <ApplicationRecommendArea
                classes={{
                    recommendFeatureAppListWrapper: classes?.recommendFeatureAppListWrapper,
                }}
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
                        {t.application_display_tab_plug_app_unlisted_placeholder()}
                    </Typography>
                </div>
            )}
        </>
    )
}

function RenderEntryComponent({ application }: { application: Application }) {
    const Entry = application.entry.RenderEntryComponent!
    const t = useSharedI18N()

    const ApplicationEntryStatus = useContext(ApplicationEntryStatusContext)

    // #region entry disabled
    const disabled = useMemo(() => {
        if (!application.enabled) return true

        return !!application.entry.nextIdRequired && ApplicationEntryStatus.isLoading
    }, [application, ApplicationEntryStatus.isLoading])
    // #endregion

    const clickHandler = useMemo(() => {
        if (application.isWalletConnectedRequired) {
            return async (walletConnectedCallback?: () => void, requiredSupportPluginID?: NetworkPluginID) => {
                const connected = await SelectProviderModal.openAndWaitForClose({ requiredSupportPluginID })
                if (connected) walletConnectedCallback?.()
            }
        }
        if (!application.entry.nextIdRequired) return
        if (ApplicationEntryStatus.isPersonaCreated === false) return () => ApplicationEntryStatus.personaAction?.()
        if (ApplicationEntryStatus.shouldVerifyNextId) return () => ApplicationEntryStatus.personaAction?.()
        return
    }, [ApplicationEntryStatus, application])

    // #endregion

    // #region tooltip hint
    const tooltipHint = (() => {
        if (ApplicationEntryStatus.isLoading) return
        if (application.isWalletConnectedRequired) return t.application_tooltip_hint_connect_wallet()
        if (!application.entry.nextIdRequired) return
        if (ApplicationEntryStatus.isPersonaCreated === false && !disabled)
            return t.application_tooltip_hint_persona_accessing_dapp()
        if (ApplicationEntryStatus.isPersonaConnected === false && !disabled)
            return t.application_tooltip_hint_connect_persona()
        if (ApplicationEntryStatus.shouldVerifyNextId && !disabled) return t.application_tooltip_hint_verify()
        return
    })()
    // #endregion

    return <Entry disabled={disabled} tooltipHint={tooltipHint} onClick={clickHandler} />
}

interface ApplicationEntryStatusContextProps {
    isPersonaConnected: boolean | undefined
    isPersonaCreated: boolean | undefined
    isNextIDVerify: boolean | undefined
    isSiteConnectedToCurrentPersona: boolean | undefined
    shouldDisplayTooltipHint: boolean | undefined
    shouldVerifyNextId: boolean | undefined
    currentPersonaPublicKey: string | undefined
    currentSiteConnectedPersonaPublicKey: string | undefined
    personaAction: ((target?: string | undefined, position?: 'center' | 'top-right' | undefined) => void) | undefined
    isLoading: boolean
}

const ApplicationEntryStatusContext = createContext<ApplicationEntryStatusContextProps>({
    isPersonaConnected: undefined,
    isPersonaCreated: undefined,
    isNextIDVerify: undefined,
    isSiteConnectedToCurrentPersona: undefined,
    shouldDisplayTooltipHint: undefined,
    shouldVerifyNextId: undefined,
    currentPersonaPublicKey: undefined,
    currentSiteConnectedPersonaPublicKey: undefined,
    personaAction: undefined,
    isLoading: false,
})
ApplicationEntryStatusContext.displayName = 'ApplicationEntryStatusContext'

interface ApplicationEntryStatusProviderProps extends PropsWithChildren<{}> {
    openDashboard?: (route?: DashboardRoutes, search?: string) => void
    lastRecognized?: IdentityResolved
    applicationCurrentStatus?: PersonaPerSiteConnectStatus
    personaPerSiteConnectStatusLoading: boolean
    allPersonas: PersonaInformation[]
}
function ApplicationEntryStatusProvider({
    children,
    openDashboard,
    lastRecognized,
    applicationCurrentStatus,
    personaPerSiteConnectStatusLoading,
    allPersonas,
}: ApplicationEntryStatusProviderProps) {
    const currentIdentifier = useValueRef(currentPersonaIdentifier)
    const { value: personaConnectStatus, loading: personaStatusLoading } = useCurrentPersonaConnectStatus(
        allPersonas,
        currentIdentifier,
        openDashboard,
        lastRecognized,
    )

    const { isSiteConnectedToCurrentPersona, currentPersonaPublicKey, currentSiteConnectedPersonaPublicKey } =
        applicationCurrentStatus ?? {}

    const Context = useMemo(
        (): ApplicationEntryStatusContextProps => ({
            personaAction: personaConnectStatus.action,
            isPersonaCreated: personaConnectStatus.hasPersona,
            isPersonaConnected: personaConnectStatus.connected,
            isNextIDVerify: personaConnectStatus.verified,
            isSiteConnectedToCurrentPersona,
            shouldDisplayTooltipHint:
                applicationCurrentStatus?.isSiteConnectedToCurrentPersona === false && personaConnectStatus.connected,
            shouldVerifyNextId: !!(!personaConnectStatus.verified && applicationCurrentStatus),
            currentPersonaPublicKey,
            currentSiteConnectedPersonaPublicKey,
            isLoading: personaStatusLoading || personaPerSiteConnectStatusLoading,
        }),
        [
            applicationCurrentStatus,
            personaStatusLoading,
            personaPerSiteConnectStatusLoading,
            personaConnectStatus.action,
            personaConnectStatus.hasPersona,
            personaConnectStatus.connected,
            personaConnectStatus.verified,
        ],
    )
    return <ApplicationEntryStatusContext.Provider value={Context}>{children}</ApplicationEntryStatusContext.Provider>
}
