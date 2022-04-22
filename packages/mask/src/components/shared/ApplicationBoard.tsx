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
import { useValueRef, useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { useAsync } from 'react-use'
import Services from '../../extension/service'
import { NextIDProof } from '@masknet/web3-providers'
import type { Persona } from '../../database'
import { useLastRecognizedIdentity } from '../DataSource/useActivatedUI'
import { useMyPersonas } from '../DataSource/useMyPersonas'
import { currentSetupGuideStatus } from '../../settings/settings'
import type { SetupGuideCrossContextStatus } from '../../settings/types'
import { WalletMessages } from '../../plugins/Wallet/messages'

const useStyles = makeStyles()((theme) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    return {
        applicationWrapper: {
            padding: theme.spacing(1, 0.25),
            overflowY: 'scroll',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: '100px',
            gridGap: theme.spacing(2),
            justifyContent: 'space-between',
            height: 340,
            '&::-webkit-scrollbar': {
                display: 'none',
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
    const { classes } = useStyles()
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
    const listedAppList = applicationList.filter((x) => !getUnlistedApp(x))
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
        <RenderEntryComponentWithNextIdRequired application={application} />
    ) : (
        <RenderEntryComponent disabled={!application.enabled} />
    )
}

function RenderEntryComponentWithNextIdRequired({ application }: RenderEntryComponentWrapperProps) {
    const ui = activatedSocialNetworkUI
    const { t } = useI18N()
    const platform = ui.configuration.nextIDConfig?.platform as NextIDPlatform
    const lastStateRef = currentSetupGuideStatus[ui.networkIdentifier]
    const lastState_ = useValueRef(lastStateRef)
    const lastState = useMemo<SetupGuideCrossContextStatus>(() => {
        try {
            return JSON.parse(lastState_)
        } catch {
            return {}
        }
    }, [lastState_])
    const lastRecognized = useLastRecognizedIdentity()
    const getUsername = () =>
        lastState.username || (lastRecognized.identifier.isUnknown ? '' : lastRecognized.identifier.userId)
    const [username] = useState(getUsername)
    const personas = useMyPersonas()

    function checkSNSConnectToCurrentPersona(persona: Persona) {
        return (
            persona?.linkedProfiles.get(new ProfileIdentifier(ui.networkIdentifier, username))
                ?.connectionConfirmState === 'confirmed'
        )
    }

    const {
        value = {
            isNextIdVerify: undefined,
            isSNSConnectToCurrentPersona: undefined,
            currentPersonaPublicKey: undefined,
            currentSNSConnectedPersonaPublicKey: undefined,
        },
    } = useAsync(async () => {
        const currentPersonaIdentifier = await Services.Settings.getCurrentPersonaIdentifier()
        const currentPersona = (await Services.Identity.queryPersona(currentPersonaIdentifier!)) as Persona
        const currentSNSConnectedPersona = personas.find((persona) =>
            checkSNSConnectToCurrentPersona(persona as Persona),
        )
        return {
            isSNSConnectToCurrentPersona: checkSNSConnectToCurrentPersona(currentPersona),
            isNextIdVerify: await NextIDProof.queryIsBound(currentPersona.publicHexKey ?? '', platform, username),
            currentPersonaPublicKey: currentPersona
                ? formatPersonaPublicKey(currentPersona.fingerprint ?? '', 4)
                : undefined,
            currentSNSConnectedPersonaPublicKey: currentSNSConnectedPersona
                ? formatPersonaPublicKey(currentSNSConnectedPersona.fingerprint ?? '', 4)
                : undefined,
        }
    }, [platform, username, ui, personas])
    const {
        isNextIdVerify,
        isSNSConnectToCurrentPersona,
        currentPersonaPublicKey,
        currentSNSConnectedPersonaPublicKey,
    } = value
    const { closeDialog } = useRemoteControlledDialog(WalletMessages.events.walletStatusDialogUpdated)

    const onNextIDVerify = useCallback(() => {
        closeDialog()
        CrossIsolationMessages.events.triggerSetupGuideVerifyOnNextIDStep.sendToAll(undefined)
    }, [])

    const RenderEntryComponent = application.entry.RenderEntryComponent!
    return (
        <RenderEntryComponent
            disabled={!application.enabled || isNextIdVerify === undefined || !isSNSConnectToCurrentPersona}
            nextIdVerification={{
                isNextIdVerify,
                isSNSConnectToCurrentPersona,
                toolTipHint: t('plugin_tips_sns_persona_unmatched', {
                    currentPersonaPublicKey,
                    currentSNSConnectedPersonaPublicKey,
                }),
                onNextIDVerify,
            }}
        />
    )
}
