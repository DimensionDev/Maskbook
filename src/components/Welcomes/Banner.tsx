import * as React from 'react'
import { useCallback } from 'react'
import { useI18N } from '../../utils/i18n-next-ui'
import { makeStyles } from '@material-ui/styles'
import { AppBar, Button, Theme, ListItemText, ListItemIcon } from '@material-ui/core'
import { useLastRecognizedIdentity } from '../DataSource/useActivatedUI'
import Services from '../../extension/service'
import { getActivatedUI } from '../../social-network/ui'
import { env } from '../../social-network/shared'
import { setStorage } from '../../utils/browser.storage'
import { useStylesExtends } from '../custom-ui-helper'
import { ProfileIdentifier } from '../../database/type'
import { getUrl } from '../../utils/utils'

interface BannerUIProps
    extends withClasses<KeysInferFromUseStyles<typeof useStyles> | 'header' | 'content' | 'actions' | 'button'> {
    title?: string
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
const useStyles = makeStyles((theme: Theme) => ({
    root: {
        border: '1px solid #ccc',
        borderRadius: 4,
        marginBottom: 10,
    },
    title: {
        color: theme.palette.text.primary,
        paddingBottom: 0,
    },
    wrapper: {
        margin: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
    },
    maskicon: {
        width: 56,
        height: 56,
        margin: theme.spacing(0, 1),
    },
}))
export function BannerUI(props: BannerUIProps) {
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    const Title = props.title ?? t('banner_title')
    const Description = props.description ?? t('banner_preparing_setup')

    const GetStarted =
        props.nextStep === 'hidden' ? null : (
            <Button
                className={classes.button}
                // disabled={username === 'hidden' ? false : !username.isValid(usedValue)}
                onClick={props.nextStep.onClick}
                variant="contained"
                color="primary">
                {t('banner_get_started')}
            </Button>
        )

    return (
        <AppBar
            style={{ paddingBottom: 0 }}
            position="static"
            color="inherit"
            elevation={0}
            classes={{ root: classes.root }}>
            <div className={classes.wrapper}>
                <ListItemIcon>
                    <img alt="" className={classes.maskicon} src={getUrl('/maskbook-icon-padded.png')} />
                </ListItemIcon>
                <ListItemText
                    className={classes.header}
                    classes={{ primary: classes.title, secondary: classes.content }}
                    primary={Title}
                    secondary={Description}></ListItemText>
                {GetStarted}
            </div>
        </AppBar>
    )
}

export interface BannerProps extends Partial<BannerUIProps> {
    unmount?(): void
}
export function Banner(props: BannerProps) {
    const lastRecognizedIdentity = useLastRecognizedIdentity()
    const { nextStep, unmount } = props
    const defaultClose = useCallback(() => {
        getActivatedUI().ignoreSetupAccount(env, {})
        unmount?.()
    }, [unmount])

    const networkIdentifier = getActivatedUI()?.networkIdentifier

    const [value, onChange] = React.useState('')
    const defaultNextStep = useCallback(() => {
        if (nextStep === 'hidden') return
        if (!networkIdentifier) {
            nextStep?.onClick()
            nextStep ?? console.warn('You must provide one of networkIdentifier or nextStep.onClick')
            return
        }
        setStorage(networkIdentifier, { forceDisplayWelcome: false })
        const id = { ...lastRecognizedIdentity }
        id.identifier =
            value === '' ? lastRecognizedIdentity.identifier : new ProfileIdentifier(networkIdentifier, value)
        Services.Welcome.openWelcomePage(id)
    }, [lastRecognizedIdentity, networkIdentifier, nextStep, value])
    const defaultUserName = networkIdentifier
        ? {
              defaultValue: lastRecognizedIdentity.identifier.isUnknown ? '' : lastRecognizedIdentity.identifier.userId,
              value,
              onChange,
              isValid: getActivatedUI().isValidUsername,
          }
        : ('hidden' as const)
    return (
        <BannerUI
            {...props}
            username={props.username ?? defaultUserName}
            nextStep={props.nextStep ?? { onClick: defaultNextStep }}
        />
    )
}
