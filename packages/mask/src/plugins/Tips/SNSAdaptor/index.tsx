import type { Plugin } from '@masknet/plugin-infra'
import { base } from '../base'
import { ApplicationEntry } from '@masknet/shared'
import { useValueRef, useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { useState, useMemo, useCallback } from 'react'
import { useAsync } from 'react-use'
import { TipsEntranceDialog } from './TipsEntranceDialog'
import { NextIDPlatform, CrossIsolationMessages, ProfileIdentifier, formatPersonaPublicKey } from '@masknet/shared-base'
import Services from '../../../extension/service'
import { NextIDProof } from '@masknet/web3-providers'
import { activatedSocialNetworkUI } from '../../../social-network'
import { useI18N } from '../../../utils'
import type { Persona } from '../../../database'
import { useLastRecognizedIdentity } from '../../../components/DataSource/useActivatedUI'
import { useMyPersonas } from '../../../components/DataSource/useMyPersonas'
import { currentSetupGuideStatus } from '../../../settings/settings'
import type { SetupGuideCrossContextStatus } from '../../../settings/types'
import { PluginI18NFieldRender } from '@masknet/plugin-infra/content-script'
import { WalletMessages } from '../../Wallet/messages'
import { TipsIcon } from '@masknet/icons'

const sns: Plugin.SNSAdaptor.Definition = {
    ...base,
    init(signal) {},
    ApplicationEntries: [
        (() => {
            const name = base.name
            const icon = <TipsIcon />
            return {
                RenderEntryComponent({ disabled }) {
                    const ui = activatedSocialNetworkUI
                    const { t } = useI18N()
                    const platform = ui.configuration.nextIDConfig?.platform as NextIDPlatform
                    const [open, setOpen] = useState(false)
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
                        lastState.username ||
                        (lastRecognized.identifier.isUnknown ? '' : lastRecognized.identifier.userId)
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
                        const currentPersona = (await Services.Identity.queryPersona(
                            currentPersonaIdentifier!,
                        )) as Persona
                        const currentSNSConnectedPersona = personas.find((persona) =>
                            checkSNSConnectToCurrentPersona(persona as Persona),
                        )
                        return {
                            isSNSConnectToCurrentPersona: checkSNSConnectToCurrentPersona(currentPersona),
                            isNextIdVerify: await NextIDProof.queryIsBound(
                                currentPersona.publicHexKey ?? '',
                                platform,
                                username,
                            ),
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

                    return (
                        <>
                            <ApplicationEntry
                                title={<PluginI18NFieldRender field={name} pluginID={base.ID} />}
                                disabled={
                                    isNextIdVerify === undefined || !isSNSConnectToCurrentPersona ? true : disabled
                                }
                                icon={icon}
                                onClick={() => (!isNextIdVerify ? onNextIDVerify() : setOpen(true))}
                                toolTip={
                                    isSNSConnectToCurrentPersona === false
                                        ? t('plugin_tips_sns_persona_unmatched', {
                                              currentPersonaPublicKey,
                                              currentSNSConnectedPersonaPublicKey,
                                          })
                                        : undefined
                                }
                            />

                            <TipsEntranceDialog open={open} onClose={() => setOpen(false)} />
                        </>
                    )
                },
                ApplicationEntryID: base.ID,
                icon,
                name,
                appBoardSortingDefaultPriority: 8,
            }
        })(),
    ],
}

export default sns
