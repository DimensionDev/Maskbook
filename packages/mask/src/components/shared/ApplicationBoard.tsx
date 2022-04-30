import { useState, useMemo, useCallback } from 'react'
import { makeStyles, getMaskColor } from '@masknet/theme'
import { Typography, useTheme } from '@mui/material'
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
import { ApplicationSettingDialog } from './ApplicationSettingDialog'
import { Application, getUnlistedApp } from './ApplicationSettingPluginList'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { useAsync } from 'react-use'
import Services from '../../extension/service'
import { NextIDProof } from '@masknet/web3-providers'
import type { Persona } from '../../database'
import { useLastRecognizedIdentity } from '../DataSource/useActivatedUI'
import { useSetupGuideStatusState } from '../DataSource/useNextID'
import { useMyPersonas } from '../DataSource/useMyPersonas'
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
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 11.5,
        },
        settingIcon: {
            height: 24,
            width: 24,
            cursor: 'pointer',
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
            <ApplicationBoardContent />
        </PersonaContext.Provider>
    )
}
function ApplicationBoardContent() {
    const theme = useTheme()
    const { t } = useI18N()
    const [openSettings, setOpenSettings] = useState(false)
    const snsAdaptorPlugins = useActivatedPluginsSNSAdaptor('any')
    const currentWeb3Network = useCurrentWeb3NetworkPluginID()
    const chainId = useChainId()
    const account = useAccount()
    const currentSNSNetwork = getCurrentSNSNetwork(activatedSocialNetworkUI.networkIdentifier)
    const SettingIconDarkModeUrl = new URL('./assets/settings_dark_mode.png', import.meta.url).toString()
    const SettingIconLightModeUrl = new URL('./assets/settings_light_mode.png', import.meta.url).toString()
    const applicationList = useMemo(
        () =>
            snsAdaptorPlugins
                .reduce<Application[]>((acc, cur) => {
                    if (!cur.ApplicationEntries) return acc
                    const currentSNSIsSupportedNetwork = cur.enableRequirement.networks.networks[currentSNSNetwork]
                    const isSNSEnabled = currentSNSIsSupportedNetwork === undefined || currentSNSIsSupportedNetwork
                    if (!isSNSEnabled) return acc
                    const currentWeb3NetworkSupportedChainIds = cur.enableRequirement.web3?.[currentWeb3Network]
                    const isWeb3Enabled = Boolean(
                        currentWeb3NetworkSupportedChainIds === undefined ||
                            currentWeb3NetworkSupportedChainIds.supportedChainIds?.includes(chainId),
                    )
                    const isWalletConnectedRequired = currentWeb3NetworkSupportedChainIds !== undefined

                    return acc.concat(
                        cur.ApplicationEntries.map((x) => {
                            return {
                                entry: x,
                                enabled: account ? isWeb3Enabled : !isWalletConnectedRequired,
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
    const listedAppList = applicationList.filter((x) => !getUnlistedApp(x))
    const { classes } = useStyles({ shouldScroll: listedAppList.length > 12 })
    return (
        <>
            <div className={classes.header}>
                <Typography className={classes.subTitle}>{t('applications')}</Typography>
                <img
                    src={theme.palette.mode === 'dark' ? SettingIconDarkModeUrl : SettingIconLightModeUrl}
                    className={classes.settingIcon}
                    onClick={() => setOpenSettings(true)}
                />
            </div>

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
            {openSettings ? (
                <ApplicationSettingDialog open={openSettings} onClose={() => setOpenSettings(false)} />
            ) : null}
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
    const { closeDialog } = useRemoteControlledDialog(WalletMessages.events.walletStatusDialogUpdated)

    const onNextIdVerify = useCallback(() => {
        closeDialog()
        CrossIsolationMessages.events.verifyNextID.sendToAll(undefined)
    }, [])

    if (!application.entry.RenderEntryComponent) return null

    const RenderEntryComponent = application.entry.RenderEntryComponent
    const shouldVerifyNextId = Boolean(!isNextIDVerify && ApplicationCurrentStatus)
    const shouldDisplayTooltipHint = ApplicationCurrentStatus?.isSNSConnectToCurrentPersona === false
    return (
        <RenderEntryComponent
            disabled={!application.enabled || isNextIDVerify === undefined || !isSNSConnectToCurrentPersona}
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
            onClick={shouldVerifyNextId ? onNextIdVerify : undefined}
        />
    )
}
