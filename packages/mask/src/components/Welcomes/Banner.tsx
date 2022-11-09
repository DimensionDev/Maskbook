import { useState, useCallback } from 'react'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { IconButton } from '@mui/material'
import { useLastRecognizedIdentity } from '../DataSource/useActivatedUI.js'
import Services from '../../extension/service.js'
import { activatedSocialNetworkUI, globalUIState } from '../../social-network/index.js'
import { DashboardRoutes } from '@masknet/shared-base'
import { MaskIconInMinds, MaskSharpIcon } from '@masknet/shared'
import { useMount } from 'react-use'
import { useCurrentPersonaConnectStatus } from '../DataSource/usePersonaConnectStatus.js'
import { hasNativeAPI, nativeAPI } from '../../../shared/native-rpc/index.js'
import { useValueRef } from '@masknet/shared-base-ui'

interface BannerUIProps extends withClasses<never | 'header' | 'content' | 'actions' | 'buttonText'> {
    description?: string
    nextStep:
        | 'hidden'
        | {
              onClick(): void
          }
    username?:
        | 'hidden'
        | {
              isValid(username: string): boolean
              value: string
              defaultValue: string
              onChange(nextValue: string): void
          }
    iconType?: string
}

const ICON_MAP: Record<string, JSX.Element> = {
    minds: <MaskIconInMinds />,
    default: <MaskSharpIcon color="primary" />,
}
const useStyles = makeStyles()({
    buttonText: {
        width: 38,
        height: 38,
        margin: '10px 0',
    },
})

export function BannerUI(props: BannerUIProps) {
    const { classes } = useStylesExtends(useStyles(), props)

    return props.nextStep === 'hidden' ? null : (
        <IconButton size="large" className={classes.buttonText} onClick={props.nextStep.onClick}>
            {ICON_MAP?.[props?.iconType ?? 'default']}
        </IconButton>
    )
}

export interface BannerProps extends Partial<BannerUIProps> {}

export function Banner(props: BannerProps) {
    const lastRecognizedIdentity = useLastRecognizedIdentity()
    const { value: personaConnectStatus } = useCurrentPersonaConnectStatus()
    const { nextStep } = props
    const networkIdentifier = activatedSocialNetworkUI.networkIdentifier
    const identities = useValueRef(globalUIState.profiles)
    const [value, onChange] = useState('')
    const defaultNextStep = useCallback(() => {
        if (nextStep === 'hidden') return
        if (!networkIdentifier) {
            nextStep?.onClick()
            nextStep ?? console.warn('You must provide one of networkIdentifier or nextStep.onClick')
            return
        }

        hasNativeAPI
            ? nativeAPI?.api.misc_openDashboardView()
            : Services.Helper.openDashboard(
                  personaConnectStatus.hasPersona ? DashboardRoutes.Personas : DashboardRoutes.Setup,
              )
    }, [networkIdentifier, nextStep])
    const defaultUserName = networkIdentifier
        ? {
              defaultValue: lastRecognizedIdentity.identifier?.userId ?? '',
              value,
              onChange,
              isValid: activatedSocialNetworkUI.utils.isValidUsername || (() => true),
          }
        : ('hidden' as const)

    const [mounted, setMounted] = useState(false)
    useMount(() => setMounted(true))

    return identities.length === 0 && mounted ? (
        <BannerUI
            {...props}
            username={props.username ?? defaultUserName}
            nextStep={props.nextStep ?? { onClick: defaultNextStep }}
        />
    ) : null
}
