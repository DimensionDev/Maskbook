import React from 'react'
import type { Persona } from '../../../database'
import { definedSocialNetworkWorkers } from '../../../social-network/worker'

import ProviderLine from './ProviderLine'
import type { ProfileIdentifier } from '../../../database/type'
import { DialogRouter } from '../DashboardDialogs/DialogBase'
import { ProfileDisconnectDialog, ProfileConnectDialog } from '../DashboardDialogs/Profile'
import getCurrentNetworkUI from '../../../social-network/utils/getCurrentNetworkUI'
import {
    currentImmersiveSetupStatus,
    ImmersiveSetupCrossContextStatus,
} from '../../../components/shared-settings/settings'
import { exclusiveTasks } from '../../content-script/tasks'

interface Props {
    persona: Persona | null
    border?: true
}

export default function ProfileBox({ persona }: Props) {
    const profiles = persona ? [...persona.linkedProfiles] : []

    const providers = [...definedSocialNetworkWorkers]
        .filter((i) => {
            if (webpackEnv.genericTarget === 'facebookApp') {
                if (i.networkIdentifier !== 'facebook.com') return false
            }
            return true
        })
        .map((i) => {
            const profile = profiles.find(([key, value]) => key.network === i.networkIdentifier)
            return {
                network: i.networkIdentifier,
                connected: !!profile,
                userId: profile?.[0].userId,
                identifier: profile?.[0],
            }
        })

    const [connectIdentifier, setConnectIdentifier] = React.useState<ProfileIdentifier | null>(null)
    const [detachProfile, setDetachProfile] = React.useState<ProfileIdentifier | null>(null)

    const deletedOrNot = () => setDetachProfile(null)
    const dismissConnect = () => {
        setConnectIdentifier(null)
    }

    const onConnect = async (provider: typeof providers[0]) => {
        if (!persona) return
        if (!(await getCurrentNetworkUI(provider.network).requestPermission())) return
        currentImmersiveSetupStatus[provider.network].value = JSON.stringify({
            status: 'during',
            persona: persona.identifier.toText(),
        } as ImmersiveSetupCrossContextStatus)
        exclusiveTasks(getCurrentNetworkUI(provider.network).getHomePage(), {
            active: true,
            autoClose: false,
            important: true,
            memorable: false,
        }).immersiveSetup(persona.identifier)
    }

    const onDisconnect = (provider: typeof providers[0]) => {
        // TODO:
    }

    return (
        <>
            {providers.map((provider) => (
                <ProviderLine
                    onAction={() => (provider.connected ? onDisconnect(provider) : onConnect(provider))}
                    {...provider}></ProviderLine>
            ))}
            {connectIdentifier && (
                <DialogRouter
                    onExit={dismissConnect}
                    children={
                        <ProfileConnectDialog
                            onClose={dismissConnect}
                            nickname={persona?.nickname!}
                            identifier={connectIdentifier}
                        />
                    }></DialogRouter>
            )}
            {detachProfile && (
                <DialogRouter
                    onExit={deletedOrNot}
                    children={
                        <ProfileDisconnectDialog
                            onConfirm={deletedOrNot}
                            onDecline={deletedOrNot}
                            nickname={persona?.nickname}
                            identifier={detachProfile}
                        />
                    }></DialogRouter>
            )}
        </>
    )
}
