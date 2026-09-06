import { useCallback, useState } from 'react'
import { useMount } from 'react-use'
import { Banner as BannerUI, type BannerProps as BannerUIProps } from '@masknet/injected-ui/Banner'
import { useCurrentPersonaConnectStatus } from '@masknet/shared'
import { DashboardRoutes, currentPersonaIdentifier } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import Services from '#services'
import { activatedSiteAdaptorUI, activatedSiteAdaptor_state } from '../../site-adaptor-infra/index.js'
import { useLastRecognizedIdentity } from '../DataSource/useActivatedUI.js'
import { usePersonasFromDB } from '../../../shared-ui/hooks/usePersonasFromDB.js'

interface BannerProps extends Partial<BannerUIProps> {}

export function Banner(props: BannerProps) {
    const lastRecognizedIdentity = useLastRecognizedIdentity()
    const allPersonas = usePersonasFromDB()
    const currentIdentifier = useValueRef(currentPersonaIdentifier)
    const { value: personaConnectStatus } = useCurrentPersonaConnectStatus(
        allPersonas,
        currentIdentifier,
        Services.Helper.openDashboard,
        lastRecognizedIdentity,
    )
    const { nextStep } = props
    const networkIdentifier = activatedSiteAdaptorUI!.networkIdentifier
    const identities = useValueRef(activatedSiteAdaptor_state!.profiles)
    const [value, onChange] = useState('')
    const defaultNextStep = useCallback(() => {
        if (nextStep === 'hidden') return
        if (!networkIdentifier) {
            nextStep?.onClick()
            if (nextStep) console.warn('You must provide one of networkIdentifier or nextStep.onClick')
            return
        }

        Services.Helper.openDashboard(
            personaConnectStatus.hasPersona ? DashboardRoutes.Personas : DashboardRoutes.SignUpPersona,
        )
    }, [networkIdentifier, nextStep])
    const defaultUserName =
        networkIdentifier ?
            {
                defaultValue: lastRecognizedIdentity.identifier?.userId ?? '',
                value,
                onChange,
                isValid: activatedSiteAdaptorUI!.utils.isValidUsername || (() => true),
            }
        :   ('hidden' as const)

    const [mounted, setMounted] = useState(false)
    useMount(() => setMounted(true))

    return identities.length === 0 && mounted ?
            <BannerUI
                {...props}
                username={props.username ?? defaultUserName}
                nextStep={props.nextStep ?? { onClick: defaultNextStep }}
            />
        :   null
}
