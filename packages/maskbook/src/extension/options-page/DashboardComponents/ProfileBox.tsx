import type { Persona } from '../../../database'
import { definedSocialNetworkUIs, loadSocialNetworkUI, loadSocialNetworkUISync } from '../../../social-network'

import ProviderLine, { ProviderLineProps } from './ProviderLine'
import { currentSetupGuideStatus } from '../../../settings/settings'
import type { SetupGuideCrossContextStatus } from '../../../settings/types'
import stringify from 'json-stable-stringify'
import { useModal } from '../DashboardDialogs/Base'
import { DashboardPersonaUnlinkConfirmDialog } from '../DashboardDialogs/Persona'
import { delay } from '../../../utils/utils'
import { SetupGuideStep } from '../../../components/InjectedComponents/SetupGuide'
import { Flags } from '../../../utils/flags'
import { requestSNSAdaptorPermission } from '../../../social-network/utils/permissions'
import { useEffect } from 'react'

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
        const ui = loadSocialNetworkUISync(provider.internalName)
        if (!ui) throw new Error('This process must be sync')
        // TODO: what if it does not have a (single?) home page? (e.g. mastdon)
        // TODO: maybe add a new action "onConnect"?
        const home = ui.utils.getHomePage?.()
        if (!persona) return
        if (!Flags.no_web_extension_dynamic_permission_request) {
            if (!(await requestSNSAdaptorPermission(ui))) return
        }

        // FIXME:
        // setting storage race condition here
        currentSetupGuideStatus[provider.network].value = stringify({
            status: SetupGuideStep.FindUsername,
            persona: persona.identifier.toText(),
        } as SetupGuideCrossContextStatus)
        await delay(100)
        home && browser.tabs.create({ active: true, url: home })
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
