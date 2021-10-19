import type { Persona } from '../../../database'
import { definedSocialNetworkUIs, loadSocialNetworkUI } from '../../../social-network'

import ProviderLine, { ProviderLineProps } from './ProviderLine'
import { useModal } from '../DashboardDialogs/Base'
import { DashboardPersonaUnlinkConfirmDialog } from '../DashboardDialogs/Persona'
import { useEffect } from 'react'
import { connectSocialNetwork } from '../../background-script/SocialNetworkService'

interface ProfileBoxProps {
    persona: Persona | null
    border?: true
    ProviderLineProps?: Partial<ProviderLineProps>
}

export default function ProfileBox({ persona, ProviderLineProps }: ProfileBoxProps) {
    const profiles = persona ? [...persona.linkedProfiles] : []
    const providers = [...definedSocialNetworkUIs.values()]
        .map((i) => {
            const profile = profiles.find(([key, value]) => key.network === i.networkIdentifier)
            if (i.networkIdentifier === 'localhost') return null!
            return {
                internalName: i.networkIdentifier,
                network: i.networkIdentifier,
                connected: !!profile,
                userId: profile?.[0].userId,
                identifier: profile?.[0],
            }
        })
        .filter((x) => x)
    const [detachProfile, , setDetachProfile] = useModal(DashboardPersonaUnlinkConfirmDialog)

    useEffect(() => {
        providers.forEach((provider) => loadSocialNetworkUI(provider.internalName))
    }, [providers])

    const onConnect = async (provider: typeof providers[0]) => {
        if (!persona) return
        connectSocialNetwork(persona.identifier, provider.network)
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
                    {...ProviderLineProps}
                />
            ))}
            {detachProfile}
        </>
    )
}
