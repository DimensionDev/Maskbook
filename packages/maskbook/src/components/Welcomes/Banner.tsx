import { useState, useCallback } from 'react'
import { useI18N } from '../../utils/i18n-next-ui'
import { makeStyles } from '@material-ui/core/styles'
import { Theme, Button } from '@material-ui/core'
import { useLastRecognizedIdentity, useMyIdentities } from '../DataSource/useActivatedUI'
import Services from '../../extension/service'
import { getActivatedUI } from '../../social-network/ui'
import { setStorage } from '../../utils/browser.storage'
import { useStylesExtends } from '../custom-ui-helper'
import { DashboardRoute } from '../../extension/options-page/Route'
import { MaskbookSharpIcon } from '../../resources/MaskbookIcon'

interface BannerUIProps
    extends withClasses<KeysInferFromUseStyles<typeof useStyles> | 'header' | 'content' | 'actions' | 'button'> {
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
const useStyles = makeStyles((theme: Theme) => {
    return {
        buttonText: {
            margin: '10px 0',
        },
        span: {
            paddingLeft: 8,
        },
    }
})

export function BannerUI(props: BannerUIProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)
    return props.nextStep === 'hidden' ? null : (
        <Button variant="outlined" onClick={props.nextStep.onClick} className={classes.buttonText}>
            <MaskbookSharpIcon />
            <span className={classes.span}>{t('banner_get_started')}</span>
        </Button>
    )
}

export interface BannerProps extends Partial<BannerUIProps> {}

export function Banner(props: BannerProps) {
    const lastRecognizedIdentity = useLastRecognizedIdentity()
    const { nextStep } = props
    const networkIdentifier = getActivatedUI()?.networkIdentifier
    const identities = useMyIdentities()
    console.log('identities', identities)
    const [value, onChange] = useState('')
    const defaultNextStep = useCallback(() => {
        if (nextStep === 'hidden') return
        if (!networkIdentifier) {
            nextStep?.onClick()
            nextStep ?? console.warn('You must provide one of networkIdentifier or nextStep.onClick')
            return
        }
        setStorage(networkIdentifier, { forceDisplayWelcome: false })
        Services.Welcome.openOptionsPage(DashboardRoute.Setup)
    }, [networkIdentifier, nextStep])
    const defaultUserName = networkIdentifier
        ? {
              defaultValue: lastRecognizedIdentity.identifier.isUnknown ? '' : lastRecognizedIdentity.identifier.userId,
              value,
              onChange,
              isValid: getActivatedUI().isValidUsername,
          }
        : ('hidden' as const)
    return identities.length === 0 ? (
        <BannerUI
            {...props}
            username={props.username ?? defaultUserName}
            nextStep={props.nextStep ?? { onClick: defaultNextStep }}
        />
    ) : null
}
