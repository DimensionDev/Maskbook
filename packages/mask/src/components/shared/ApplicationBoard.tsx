import { useState, useContext, createContext, PropsWithChildren, useMemo, useRef } from 'react'
import { makeStyles, getMaskColor } from '@masknet/theme'
import { Typography } from '@mui/material'
import { useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { useAccount, useChainId, usePluginIDContext } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { getCurrentSNSNetwork } from '../../social-network-adaptor/utils.js'
import { activatedSocialNetworkUI } from '../../social-network/index.js'
import { useI18N } from '../../utils/index.js'
import { Application, getUnlistedApp } from './ApplicationSettingPluginList.js'
import { ApplicationRecommendArea } from './ApplicationRecommendArea.js'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { useCurrentPersonaConnectStatus } from '../DataSource/usePersonaConnectStatus.js'
import { usePersonaAgainstSNSConnectStatus } from '../DataSource/usePersonaAgainstSNSConnectStatus.js'
import { WalletMessages } from '../../plugins/Wallet/messages.js'
import { PersonaContext } from '../../extension/popups/pages/Personas/hooks/usePersonaContext.js'
import { useTimeout } from 'react-use'

const useStyles = makeStyles<{
    shouldScroll: boolean
    isCarouselReady: boolean
}>()((theme, props) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    return {
        applicationWrapper: {
            padding: theme.spacing(1, process.env.engine === 'firefox' ? 1.5 : 0.25, 1, 1),
            transform: props.isCarouselReady ? 'translate(-8px, -8px)' : 'translateX(-8px)',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            overflowY: 'auto',
            overflowX: 'hidden',
            gridTemplateRows: '100px',
            gridGap: 10,
            justifyContent: 'space-between',
            height: 320,
            width: props.shouldScroll && process.env.engine !== 'firefox' ? 583 : 570,
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
    const { pluginID: currentWeb3Network } = usePluginIDContext()
    const chainId = useChainId()
    const account = useAccount()
    const popperBoundaryRef = useRef<HTMLElement | null>(null)
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
    // #region handle carousel ui
    const [isCarouselReady] = useTimeout(300)
    const [isHoveringCarousel, setIsHoveringCarousel] = useState(false)
    // #endregion
    const { classes, cx } = useStyles({
        shouldScroll: listedAppList.length > 12,
        isCarouselReady: Boolean(isCarouselReady()),
    })
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
                <section
                    ref={popperBoundaryRef}
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
                            popperBoundary={popperBoundaryRef.current}
                        />
                    ))}
                </section>
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

function RenderEntryComponent({
    application,
    popperBoundary,
}: {
    application: Application
    popperBoundary?: HTMLElement | null
}) {
    const Entry = application.entry.RenderEntryComponent!
    const { t } = useI18N()
    const { setDialog: setSelectProviderDialog } = useRemoteControlledDialog(
        WalletMessages.events.selectProviderDialogUpdated,
    )

    const ApplicationEntryStatus = useContext(ApplicationEntryStatusContext)

    // #region entry disabled
    const disabled = useMemo(() => {
        if (!application.enabled) return true

        return !!application.entry.nextIdRequired && ApplicationEntryStatus.isLoading
    }, [application, ApplicationEntryStatus])
    // #endregion

    const clickHandler = useMemo(() => {
        if (application.isWalletConnectedRequired || application.isWalletConnectedEVMRequired) {
            return (walletConnectedCallback?: () => void) =>
                setSelectProviderDialog({ open: true, walletConnectedCallback })
        }
        if (!application.entry.nextIdRequired) return
        if (ApplicationEntryStatus.isPersonaCreated === false) return ApplicationEntryStatus.personaAction as () => void
        if (ApplicationEntryStatus.shouldVerifyNextId)
            return () => ApplicationEntryStatus.personaAction?.(application.pluginID)
        return
    }, [setSelectProviderDialog, ApplicationEntryStatus, application])

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
        return
    })()
    // #endregion

    return (
        <Entry disabled={disabled} tooltipHint={tooltipHint} onClick={clickHandler} popperBoundary={popperBoundary} />
    )
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

function ApplicationEntryStatusProvider(props: PropsWithChildren<{}>) {
    const { value: personaConnectStatus, loading: personaStatusLoading } = useCurrentPersonaConnectStatus()
    const { value: ApplicationCurrentStatus, loading: personaAgainstSNSConnectStatusLoading } =
        usePersonaAgainstSNSConnectStatus()

    const { isSNSConnectToCurrentPersona, currentPersonaPublicKey, currentSNSConnectedPersonaPublicKey } =
        ApplicationCurrentStatus ?? {}

    return (
        <ApplicationEntryStatusContext.Provider
            value={{
                personaAction: personaConnectStatus.action,
                isPersonaCreated: personaConnectStatus.hasPersona,
                isPersonaConnected: personaConnectStatus.connected,
                isNextIDVerify: personaConnectStatus.verified,
                isSNSConnectToCurrentPersona,
                shouldDisplayTooltipHint:
                    ApplicationCurrentStatus?.isSNSConnectToCurrentPersona === false && personaConnectStatus.connected,
                shouldVerifyNextId: Boolean(!personaConnectStatus.verified && ApplicationCurrentStatus),
                currentPersonaPublicKey,
                currentSNSConnectedPersonaPublicKey,
                isLoading: personaStatusLoading || personaAgainstSNSConnectStatusLoading,
            }}>
            {props.children}
        </ApplicationEntryStatusContext.Provider>
    )
}
