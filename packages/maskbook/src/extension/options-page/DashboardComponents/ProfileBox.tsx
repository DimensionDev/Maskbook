import type { Persona } from '../../../database'
import { definedSocialNetworkWorkers } from '../../../social-network-next/worker'

import ProviderLine, { ProviderLineProps } from './ProviderLine'
import { activatedSocialNetworkUI } from '../../../social-network-next'
import { currentSetupGuideStatus } from '../../../settings/settings'
import type { SetupGuideCrossContextStatus } from '../../../settings/types'
import { exclusiveTasks } from '../../content-script/tasks'
import stringify from 'json-stable-stringify'
import { useModal } from '../DashboardDialogs/Base'
import { DashboardPersonaUnlinkConfirmDialog } from '../DashboardDialogs/Persona'
import { delay } from '../../../utils/utils'
import { SetupGuideStep } from '../../../components/InjectedComponents/SetupGuide'
import { Flags } from '../../../utils/flags'

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
            internalName: i.networkIdentifier,
            network: i.networkIdentifier,
            connected: !!profile,
            userId: profile?.[0].userId,
            identifier: profile?.[0],
        }
    })
    const [detachProfile, , setDetachProfile] = useModal(DashboardPersonaUnlinkConfirmDialog)
    // TODO: what if it does not have a (single?) home page? (e.g. mastdon)
    const home = activatedSocialNetworkUI.utils.getHomePage?.()

    const onConnect = async (provider: typeof providers[0]) => {
        if (!persona) return
        if (!Flags.no_web_extension_dynamic_permission_request) {
            if (!(await activatedSocialNetworkUI.permission.request())) return
        }

        // FIXME:
        // setting storage race condition here
        currentSetupGuideStatus[provider.network].value = stringify({
            status: SetupGuideStep.FindUsername,
            persona: persona.identifier.toText(),
        } as SetupGuideCrossContextStatus)
        await delay(100)
        home &&
            exclusiveTasks(home, {
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
