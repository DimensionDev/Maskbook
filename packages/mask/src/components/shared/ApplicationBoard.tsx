import { useContext, createContext, PropsWithChildren, useMemo, useCallback, useState } from 'react'
import { makeStyles, getMaskColor } from '@masknet/theme'
import { Typography } from '@mui/material'
import { useChainId } from '@masknet/web3-shared-evm'
import { useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { useCurrentWeb3NetworkPluginID, useAccount, NetworkPluginID } from '@masknet/plugin-infra/web3'
import { EMPTY_LIST, CrossIsolationMessages, formatPersonaPublicKey } from '@masknet/shared-base'
import { getCurrentSNSNetwork } from '../../social-network-adaptor/utils'
import { activatedSocialNetworkUI } from '../../social-network'
import { useI18N } from '../../utils'
import { Application, getUnlistedApp } from './ApplicationSettingPluginList'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { useNextIDConnectStatus } from '../DataSource/useNextID'
import { usePersonaConnectStatus, usePersonaAgainstSNSConnectStatus } from '../DataSource/usePersonaConnectStatus'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { PersonaContext } from '../../extension/popups/pages/Personas/hooks/usePersonaContext'
import { CarouselProvider, Slider, Slide } from 'pure-react-carousel'

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
            width: props.shouldScroll ? 575 : 562,
            '::-webkit-scrollbar': {
                backgroundColor: 'transparent',
                width: 20,
            },
            '::-webkit-scrollbar-thumb': {
                borderRadius: '20px',
                width: 5,
                border: '7px solid rgba(0, 0, 0, 0)',
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(250, 250, 250, 0.2)' : 'rgba(0, 0, 0, 0.2)',
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
            margin: '0px 2px 4px 2px',
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
                padding: '8px 2px 0px',
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
                .reduce<Application[]>((acc, cur) => {
                    if (!cur.ApplicationEntries) return acc
                    const currentWeb3NetworkSupportedChainIds = cur.enableRequirement.web3?.[currentWeb3Network]
                    const isWalletConnectedRequired = currentWeb3NetworkSupportedChainIds !== undefined
                    const currentSNSIsSupportedNetwork = cur.enableRequirement.networks.networks[currentSNSNetwork]
                    const isSNSEnabled = currentSNSIsSupportedNetwork === undefined || currentSNSIsSupportedNetwork

                    return acc.concat(
                        cur.ApplicationEntries.map((x) => {
                            return {
                                entry: x,
                                enabled: isSNSEnabled,
                                pluginId: cur.ID,
                                isWalletConnectedRequired: !account && isWalletConnectedRequired,
                                isWalletConnectedEVMRequired: Boolean(
                                    account &&
                                        currentWeb3Network !== NetworkPluginID.PLUGIN_EVM &&
                                        isWalletConnectedRequired,
                                ),
                            }
                        }) ?? EMPTY_LIST,
                    )
                }, EMPTY_LIST)
                .sort(
                    (a, b) =>
                        (a.entry.appBoardSortingDefaultPriority ?? 0) - (b.entry.appBoardSortingDefaultPriority ?? 0),
                )
                .filter((x) => Boolean(x.entry.RenderEntryComponent)),
        [snsAdaptorPlugins, currentWeb3Network, chainId, account],
    )

    const [isPlaying, setPlaying] = useState(true)
    const recommendFeatureAppList = applicationList.filter((x) => x.entry.recommendFeature)
    const [sliderList] = useState(
        recommendFeatureAppList.concat(recommendFeatureAppList).concat(recommendFeatureAppList),
    )

    const listedAppList = applicationList.filter((x) => !x.entry.recommendFeature).filter((x) => !getUnlistedApp(x))
    const { classes } = useStyles({ shouldScroll: listedAppList.length > 12 })
    return (
        <>
            <link rel="stylesheet" href={new URL('./assets/react-carousel.es.css', import.meta.url).toString()} />
            <CarouselProvider
                naturalSlideWidth={220}
                naturalSlideHeight={117}
                totalSlides={sliderList.length}
                visibleSlides={2.2}
                infinite={false}
                interval={2500}
                className={classes.carousel}
                isPlaying={isPlaying}>
                <Slider onScroll={(e) => setPlaying((e.target as HTMLDivElement).scrollLeft === 0)}>
                    {sliderList.map((application, i) => (
                        <Slide index={i} key={i}>
                            <RenderEntryComponent
                                key={application.entry.ApplicationEntryID}
                                application={application}
                            />
                        </Slide>
                    ))}
                </Slider>
            </CarouselProvider>

            {listedAppList.length > 0 ? (
                <section className={classes.applicationWrapper}>
                    {listedAppList.map((application) => (
                        <RenderEntryComponent key={application.entry.ApplicationEntryID} application={application} />
                    ))}
                </section>
            ) : (
                <div className={classes.placeholderWrapper}>
                    <Typography className={classes.placeholder}>
                        {t('application_settings_tab_plug_app-unlisted-placeholder')}
                    </Typography>
                </div>
            )}
        </>
    )
}

interface RenderEntryComponentProps {
    application: Application
}

function RenderEntryComponent({ application }: RenderEntryComponentProps) {
    const Entry = application.entry.RenderEntryComponent!
    const { t } = useI18N()
    const { openDialog: openSelectProviderDialog } = useRemoteControlledDialog(
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
        CrossIsolationMessages.events.verifyNextID.sendToAll(undefined)
    }, [])

    const clickHandler =
        application.isWalletConnectedRequired || application.isWalletConnectedEVMRequired
            ? openSelectProviderDialog
            : !application.entry.nextIdRequired
            ? undefined
            : ApplicationEntryStatus.isPersonaConnected === false || ApplicationEntryStatus.isPersonaCreated === false
            ? createOrConnectPersona
            : ApplicationEntryStatus.shouldVerifyNextId
            ? verifyPersona
            : undefined
    // #endregion

    // #region tooltip hint
    const tooltipHint = useMemo(() => {
        if (application.isWalletConnectedRequired) return t('application_tooltip_hint_connect_wallet')
        if (application.isWalletConnectedEVMRequired) return t('application_tooltip_hint_switch_to_evm_wallet')
        if (!application.entry.nextIdRequired) return undefined
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
        return undefined
    }, [application, ApplicationEntryStatus, disabled])
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
})

function ApplicationEntryStatusProvider(props: PropsWithChildren<{}>) {
    const personaConnectStatus = usePersonaConnectStatus()
    const nextIDConnectStatus = useNextIDConnectStatus()

    const { value: ApplicationCurrentStatus } = usePersonaAgainstSNSConnectStatus()
    const { isSNSConnectToCurrentPersona, currentPersonaPublicKey, currentSNSConnectedPersonaPublicKey } =
        ApplicationCurrentStatus ?? {}

    return (
        <ApplicationEntryStatusContext.Provider
            value={{
                personaConnectAction: personaConnectStatus.action ?? undefined,
                isPersonaCreated: personaConnectStatus.hasPersona,
                isPersonaConnected: personaConnectStatus.connected,
                isNextIDVerify: nextIDConnectStatus.isVerified,
                isSNSConnectToCurrentPersona,
                shouldDisplayTooltipHint:
                    ApplicationCurrentStatus?.isSNSConnectToCurrentPersona === false && personaConnectStatus.connected,
                shouldVerifyNextId: Boolean(!nextIDConnectStatus.isVerified && ApplicationCurrentStatus),
                currentPersonaPublicKey,
                currentSNSConnectedPersonaPublicKey,
            }}>
            {props.children}
        </ApplicationEntryStatusContext.Provider>
    )
}
