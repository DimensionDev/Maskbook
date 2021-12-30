import { useState, useCallback } from 'react'
import { makeStyles, useStylesExtends } from '@masknet/theme'
import { IconButton } from '@mui/material'
import { useLastRecognizedIdentity, useMyIdentities } from '../DataSource/useActivatedUI'
import Services from '../../extension/service'
import { activatedSocialNetworkUI } from '../../social-network'
import { useValueRef } from '@masknet/shared'
import { DashboardRoutes } from '@masknet/shared-base'
import { MaskSharpIcon } from '../../resources/MaskIcon'
import { useMount } from 'react-use'
import { hasNativeAPI, nativeAPI } from '../../utils'
import { userGuideStatus } from '../../settings/settings'

interface BannerUIProps extends withClasses<never | 'header' | 'content' | 'actions' | 'buttonText'> {
    description?: string
    nextStep: 'hidden' | { onClick(): void }
    username?:
        | 'hidden'
        | {
              isValid(username: string): boolean
              value: string
              defaultValue: string
              onChange(nextValue: string): void
          }
}
const useStyles = makeStyles()({
    buttonText: {
        width: 38,
        height: 38,
        margin: '10px 0',
    },
    span: {
        paddingLeft: 8,
    },
})

export function BannerUI(props: BannerUIProps) {
    const classes = useStylesExtends(useStyles(), props)

    return props.nextStep === 'hidden' ? null : (
        <IconButton size="large" className={classes.buttonText} onClick={props.nextStep.onClick}>
            <MaskSharpIcon color="primary" />
        </IconButton>
    )
}

export interface BannerProps extends Partial<BannerUIProps> {}

export function Banner(props: BannerProps) {
    const lastRecognizedIdentity = useLastRecognizedIdentity()
    const { nextStep } = props
    const networkIdentifier = activatedSocialNetworkUI.networkIdentifier
    const identities = useMyIdentities()
    const [value, onChange] = useState('')
    const userGuideVal = useValueRef(userGuideStatus[networkIdentifier])
    const defaultNextStep = useCallback(() => {
        if (nextStep === 'hidden') return
        if (!networkIdentifier) {
            nextStep?.onClick()
            nextStep ?? console.warn('You must provide one of networkIdentifier or nextStep.onClick')
            return
        }

        hasNativeAPI ? nativeAPI?.api.misc_openDashboardView() : Services.Welcome.openOptionsPage(DashboardRoutes.Setup)
    }, [networkIdentifier, nextStep])
    const defaultUserName = networkIdentifier
        ? {
              defaultValue: lastRecognizedIdentity.identifier.isUnknown ? '' : lastRecognizedIdentity.identifier.userId,
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
