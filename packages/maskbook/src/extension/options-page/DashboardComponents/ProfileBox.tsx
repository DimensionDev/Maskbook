import React from 'react'
import type { Persona } from '../../../database'
import { definedSocialNetworkWorkers } from '../../../social-network/worker'

import ProviderLine, { ProviderLineProps } from './ProviderLine'
import getCurrentNetworkUI from '../../../social-network/utils/getCurrentNetworkUI'
import { currentSetupGuideStatus, SetupGuideCrossContextStatus } from '../../../settings/settings'
import { exclusiveTasks } from '../../content-script/tasks'
import stringify from 'json-stable-stringify'
import { useModal } from '../DashboardDialogs/Base'
import { DashboardPersonaUnlinkConfirmDialog } from '../DashboardDialogs/Persona'
import { sleep } from '../../../utils/utils'
import { SetupGuideStep } from '../../../components/InjectedComponents/SetupGuide'

interface ProfileBoxProps {
    persona: Persona | null
    border?: true
    ProviderLineProps?: Partial<ProviderLineProps>
}

export default function ProfileBox({ persona, ProviderLineProps }: ProfileBoxProps) {
    const profiles = persona ? [...persona.linkedProfiles] : []
    const providers = [...definedSocialNetworkWorkers].map((i) => {
        const profile = profiles.find(([key, value]) => key.network === i.networkIdentifier)
        return {
            internalName: i.internalName,
            network: i.networkIdentifier,
            connected: !!profile,
            userId: profile?.[0].userId,
            identifier: profile?.[0],
        }
    })
    const [detachProfile, , setDetachProfile] = useModal(DashboardPersonaUnlinkConfirmDialog)

    const onConnect = async (provider: typeof providers[0]) => {
        if (!persona) return
        if (!(await getCurrentNetworkUI(provider.network).requestPermission())) return

        // FIXME:
        // setting storage race condition here
        currentSetupGuideStatus[provider.network].value = stringify({
            status: SetupGuideStep.FindUsername,
            persona: persona.identifier.toText(),
        } as SetupGuideCrossContextStatus)
        await sleep(100)
        exclusiveTasks(getCurrentNetworkUI(provider.network).getHomePage(), {
            active: true,
            autoClose: false,
            important: true,
            memorable: false,
        }).SetupGuide(persona.identifier)
    }
    const onDisconnect = (provider: typeof providers[0]) => {
        setDetachProfile({ nickname: persona?.nickname, identifier: provider.identifier })
    }

    return (
        <>
            {providers.map((provider, index) => (
                <ProviderLine
                    key={index}
                    onAction={() => (provider.connected ? onDisconnect(provider) : onConnect(provider))}
                    {...provider}
                    {...ProviderLineProps}></ProviderLine>
            ))}
            {detachProfile}
        </>
    )
}
