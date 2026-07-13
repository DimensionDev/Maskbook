import { Trans } from '@lingui/react/macro'
import { useActivatedPluginsSiteAdaptor, type IdentityResolved } from '@masknet/plugin-infra/content-script'
import {
    PersonaContext,
    SelectProviderModal,
    useCurrentPersonaConnectStatus,
    type PersonaPerSiteConnectStatus,
} from '@masknet/shared'
import {
    currentPersonaIdentifier,
    EMPTY_LIST,
    EnhanceableSite,
    type DashboardRoutes,
    type NetworkPluginID,
    type PersonaInformation,
} from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { Boundary, getMaskColor, makeStyles } from '@masknet/theme'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import { Typography } from '@mui/material'
import { createContext, useMemo, useState, type PropsWithChildren } from 'react'
import { useTimeout } from 'react-use'
import { ApplicationRecommendArea } from './ApplicationRecommendArea.js'
import { useUnlistedEntries, type Application } from './ApplicationSettingPluginList.js'

const useStyles = makeStyles()((theme) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    return {
        applicationWrapper: {
            padding: theme.spacing(0, navigator.userAgent.includes('Firefox') ? 1.5 : 0.25, 1, 3),
            transform: 'translateX(-8px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            overflowY: 'auto',
            overflowX: 'hidden',
            gridTemplateRows: '100px',
            gridGap: 10,
            justifyContent: 'space-between',
            minHeight: 0,
            boxSizing: 'border-box',
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

interface ApplicationBoardContentProps {
    openDashboard?: (route: DashboardRoutes, search?: string) => void
    queryOwnedPersonaInformation?: (initializedOnly: boolean) => Promise<PersonaInformation[]>
    currentSite?: EnhanceableSite
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
}: ApplicationBoardContentProps) {
    return (
        <PersonaContext initialState={{ queryOwnedPersonaInformation }}>
            <ApplicationEntryStatusProvider
                openDashboard={openDashboard}
                lastRecognized={lastRecognized}
                allPersonas={allPersonas}
                applicationCurrentStatus={applicationCurrentStatus}
                personaPerSiteConnectStatusLoading={personaPerSiteConnectStatusLoading}>
                <ApplicationBoardPluginsList currentSite={currentSite} />
            </ApplicationEntryStatusProvider>
        </PersonaContext>
    )
}

interface ApplicationBoardPluginsListProps {
    currentSite?: EnhanceableSite
}

function ApplicationBoardPluginsList(props: ApplicationBoardPluginsListProps) {
    const { currentSite = EnhanceableSite.Twitter } = props
    const plugins = useActivatedPluginsSiteAdaptor('any')
    const { pluginID: currentWeb3Network } = useNetworkContext()
    const { account, chainId } = useChainContext()
    const applicationList = useMemo(
        () =>
            plugins
                .flatMap(({ ID, ApplicationEntries, enableRequirement }) => {
                    if (!ApplicationEntries) return EMPTY_LIST
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
                .toSorted((a, b) => {
                    return (a.entry.appBoardSortingDefaultPriority ?? 0) - (b.entry.appBoardSortingDefaultPriority ?? 0)
                })
                .filter((x) => !!x.entry.RenderEntryComponent),
        [plugins, currentWeb3Network, chainId, account],
    )
    const recommendFeatureAppList = applicationList
        .filter((x) => x.entry.recommendFeature)
        .toSorted(
            (a, b) => (a.entry.appBoardSortingDefaultPriority ?? 0) - (b.entry.appBoardSortingDefaultPriority ?? 0),
        )

    const unlistedEntries = useUnlistedEntries()
    const listedAppList = applicationList.filter(
        (x) => !x.entry.recommendFeature && !unlistedEntries.includes(x.entry.ApplicationEntryID),
    )
    // #region handle carousel ui
    const [isCarouselReady] = useTimeout(300)
    const [isHoveringCarousel, setIsHoveringCarousel] = useState(false)
    // #endregion
    const { classes, cx } = useStyles()

    return (
        <>
            {recommendFeatureAppList.length > 0 ?
                <ApplicationRecommendArea
                    recommendFeatureAppList={recommendFeatureAppList}
                    isCarouselReady={isCarouselReady}
                    RenderEntryComponent={RenderEntryComponent}
                    isHoveringCarousel={isHoveringCarousel}
                    setIsHoveringCarousel={setIsHoveringCarousel}
                />
            :   null}

            {listedAppList.length > 0 ?
                <Boundary>
                    <section
                        className={cx(
                            classes.applicationWrapper,
                            recommendFeatureAppList.length > 2 && isCarouselReady() && isHoveringCarousel ?
                                classes.applicationWrapperWithCarousel
                            :   '',
                        )}>
                        {listedAppList.map((application) => (
                            <RenderEntryComponent
                                key={application.entry.ApplicationEntryID}
                                application={application}
                            />
                        ))}
                    </section>
                </Boundary>
            :   <div
                    className={cx(
                        classes.placeholderWrapper,
                        recommendFeatureAppList.length > 2 && isCarouselReady() && isHoveringCarousel ?
                            classes.applicationWrapperWithCarousel
                        :   '',
                    )}>
                    <Typography className={classes.placeholder}>
                        <Trans>Click the settings icon to list it on the App board.</Trans>
                    </Typography>
                </div>
            }
        </>
    )
}

function RenderEntryComponent({ application, style }: { application: Application; style?: React.CSSProperties }) {
    const Entry = application.entry.RenderEntryComponent!

    const disabled = !application.enabled

    const clickHandler = useMemo(() => {
        if (application.isWalletConnectedRequired) {
            return async (walletConnectedCallback?: () => void, requiredSupportPluginID?: NetworkPluginID) => {
                const connected = await SelectProviderModal.openAndWaitForClose({ requiredSupportPluginID })
                if (connected) walletConnectedCallback?.()
            }
        }

        return
    }, [application])

    // #region tooltip hint
    const tooltipHint = (() => {
        if (application.isWalletConnectedRequired) return <Trans>Please connect your wallet</Trans>
        return
    })()
    // #endregion

    return <Entry disabled={disabled} tooltipHint={tooltipHint} onClick={clickHandler} style={style} />
}

interface ApplicationEntryStatusContextProps {
    isPersonaConnected: boolean | undefined
    isPersonaCreated: boolean | undefined
    isSiteConnectedToCurrentPersona: boolean | undefined
    shouldDisplayTooltipHint: boolean | undefined
    currentPersonaPublicKey: string | undefined
    currentSiteConnectedPersonaPublicKey: string | undefined
    personaAction: ((target?: string | undefined, position?: 'center' | 'top-right' | undefined) => void) | undefined
    isLoading: boolean
}

const ApplicationEntryStatusContext = createContext<ApplicationEntryStatusContextProps>({
    isPersonaConnected: undefined,
    isPersonaCreated: undefined,
    isSiteConnectedToCurrentPersona: undefined,
    shouldDisplayTooltipHint: undefined,
    currentPersonaPublicKey: undefined,
    currentSiteConnectedPersonaPublicKey: undefined,
    personaAction: undefined,
    isLoading: false,
})
ApplicationEntryStatusContext.displayName = 'ApplicationEntryStatusContext'

interface ApplicationEntryStatusProviderProps extends PropsWithChildren {
    openDashboard?: (route: DashboardRoutes, search?: string) => void
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
            isSiteConnectedToCurrentPersona,
            shouldDisplayTooltipHint:
                applicationCurrentStatus?.isSiteConnectedToCurrentPersona === false && personaConnectStatus.connected,
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
    return <ApplicationEntryStatusContext value={Context}>{children}</ApplicationEntryStatusContext>
}
