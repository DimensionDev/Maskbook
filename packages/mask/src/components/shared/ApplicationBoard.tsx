import { useMemo, useCallback } from 'react'
import { makeStyles, getMaskColor } from '@masknet/theme'
import { Typography, Box } from '@mui/material'
import { useChainId } from '@masknet/web3-shared-evm'
import { useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { useCurrentWeb3NetworkPluginID, useAccount } from '@masknet/plugin-infra/web3'
import {
    EMPTY_LIST,
    NextIDPlatform,
    CrossIsolationMessages,
    ProfileIdentifier,
    formatPersonaPublicKey,
} from '@masknet/shared-base'
import { getCurrentSNSNetwork } from '../../social-network-adaptor/utils'
import { activatedSocialNetworkUI } from '../../social-network'
import { useI18N } from '../../utils'
import { Application, getUnlistedApp } from './ApplicationSettingPluginList'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { useAsync } from 'react-use'
import Services from '../../extension/service'
import { NextIDProof } from '@masknet/web3-providers'
import type { Persona } from '../../database'
import { useLastRecognizedIdentity } from '../DataSource/useActivatedUI'
import { useSetupGuideStatusState } from '../DataSource/useNextID'
import { useMyPersonas } from '../DataSource/useMyPersonas'
import { usePersonaConnectStatus } from '../DataSource/usePersonaConnectStatus'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { PersonaContext } from '../../extension/popups/pages/Personas/hooks/usePersonaContext'

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
            gridGap: theme.spacing(2),
            justifyContent: 'space-between',
            height: 340,
            width: props.shouldScroll ? 575 : 560,
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
            width: '100%',
            margin: '0px 2px 12px 2px',
        },
    }
})

interface Props {
    closeDialog(): void
}

export function ApplicationBoard(props: Props) {
    return (
        <PersonaContext.Provider>
            <ApplicationBoardContent {...props} />
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
                    const isWeb3Enabled = Boolean(
                        currentWeb3NetworkSupportedChainIds === undefined ||
                            currentWeb3NetworkSupportedChainIds.supportedChainIds?.includes(chainId),
                    )
                    const isWalletConnectedRequired = currentWeb3NetworkSupportedChainIds !== undefined
                    const currentSNSIsSupportedNetwork = cur.enableRequirement.networks.networks[currentSNSNetwork]
                    const isSNSEnabled = currentSNSIsSupportedNetwork === undefined || currentSNSIsSupportedNetwork

                    return acc.concat(
                        cur.ApplicationEntries.map((x) => {
                            return {
                                entry: x,
                                enabled: isSNSEnabled && (account ? isWeb3Enabled : !isWalletConnectedRequired),
                                pluginId: cur.ID,
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
    const recommendFeatureAppList = applicationList.filter((x) => x.entry.recommendFeature)
    const listedAppList = applicationList.filter((x) => !x.entry.recommendFeature).filter((x) => !getUnlistedApp(x))
    const { classes } = useStyles({ shouldScroll: listedAppList.length > 12 })
    return (
        <>
            <Box className={classes.recommendFeatureAppListWrapper}>
                {recommendFeatureAppList.map((application) => (
                    <RenderEntryComponentWrapper key={application.entry.ApplicationEntryID} application={application} />
                ))}
            </Box>

            {listedAppList.length > 0 ? (
                <section className={classes.applicationWrapper}>
                    {listedAppList.map((application) => (
                        <RenderEntryComponentWrapper
                            key={application.entry.ApplicationEntryID}
                            application={application}
                        />
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

interface RenderEntryComponentWrapperProps {
    application: Application
}

function RenderEntryComponentWrapper({ application }: RenderEntryComponentWrapperProps) {
    const RenderEntryComponent = application.entry.RenderEntryComponent!
    return application.entry.nextIdRequired ? (
        <RenderEntryComponentWithNextIDRequired application={application} />
    ) : (
        <RenderEntryComponent disabled={!application.enabled} />
    )
}

function RenderEntryComponentWithNextIDRequired({ application }: RenderEntryComponentWrapperProps) {
    const ui = activatedSocialNetworkUI
    const { t } = useI18N()
    const platform = ui.configuration.nextIDConfig?.platform as NextIDPlatform
    const lastState = useSetupGuideStatusState()
    const { currentPersona } = PersonaContext.useContainer()
    const lastRecognized = useLastRecognizedIdentity()
    const username = useMemo(() => {
        return lastState.username || lastRecognized.identifier?.userId
    }, [lastState, lastRecognized])
    const personas = useMyPersonas()

    const checkSNSConnectToCurrentPersona = useCallback((persona: Persona) => {
        return username
            ? persona?.linkedProfiles.get(ProfileIdentifier.of(ui.networkIdentifier, username).unwrapOr(undefined!))
                  ?.connectionConfirmState === 'confirmed'
            : undefined
    }, [])
    const personaConnectStatus = usePersonaConnectStatus()

    const { value: ApplicationCurrentStatus } = useAsync(async () => {
        const currentPersonaIdentifier = await Services.Settings.getCurrentPersonaIdentifier()
        const currentPersona = (await Services.Identity.queryPersona(currentPersonaIdentifier!)) as Persona
        const currentSNSConnectedPersona = personas.find((persona) =>
            checkSNSConnectToCurrentPersona(persona as Persona),
        )
        return {
            isSNSConnectToCurrentPersona: checkSNSConnectToCurrentPersona(currentPersona),
            isNextIDVerify: username
                ? await NextIDProof.queryIsBound(currentPersona.publicHexKey ?? '', platform, username)
                : false,
            currentPersonaPublicKey: currentPersona?.fingerprint,
            currentSNSConnectedPersonaPublicKey: currentSNSConnectedPersona?.fingerprint,
        }
    }, [platform, username, ui, personas, currentPersona])
    const {
        isNextIDVerify,
        isSNSConnectToCurrentPersona,
        currentPersonaPublicKey,
        currentSNSConnectedPersonaPublicKey,
    } = ApplicationCurrentStatus ?? {}
    const { closeDialog } = useRemoteControlledDialog(WalletMessages.events.ApplicationDialogUpdated)

    const jumpSetupGuide = useCallback(() => {
        closeDialog()
        personaConnectStatus.connected === false
            ? personaConnectStatus.action?.()
            : CrossIsolationMessages.events.verifyNextID.sendToAll(undefined)
    }, [personaConnectStatus])

    if (!application.entry.RenderEntryComponent) return null

    const RenderEntryComponent = application.entry.RenderEntryComponent
    const shouldVerifyNextId = Boolean(!isNextIDVerify && ApplicationCurrentStatus)
    const shouldDisplayTooltipHint =
        ApplicationCurrentStatus?.isSNSConnectToCurrentPersona === false && personaConnectStatus.connected
    return (
        <RenderEntryComponent
            disabled={
                !application.enabled ||
                isNextIDVerify === undefined ||
                (!isSNSConnectToCurrentPersona && personaConnectStatus.connected)
            }
            tooltipHint={
                shouldDisplayTooltipHint
                    ? t('plugin_tips_sns_persona_unmatched', {
                          currentPersonaPublicKey: formatPersonaPublicKey(currentPersonaPublicKey ?? '', 4),
                          currentSNSConnectedPersonaPublicKey: formatPersonaPublicKey(
                              currentSNSConnectedPersonaPublicKey ?? '',
                              4,
                          ),
                      })
                    : undefined
            }
            onClick={shouldVerifyNextId || personaConnectStatus.connected === false ? jumpSetupGuide : undefined}
        />
    )
}
