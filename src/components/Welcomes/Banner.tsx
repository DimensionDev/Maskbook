import * as React from 'react'
import { useCallback } from 'react'
import { geti18nString } from '../../utils/i18n'
import { makeStyles } from '@material-ui/styles'
import {
    AppBar,
    Button,
    Theme,
    TextField,
    InputAdornment,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@material-ui/core'
import { useLastRecognizedIdentity } from '../DataSource/useActivatedUI'
import Services from '../../extension/service'
import { getActivatedUI } from '../../social-network/ui'
import { env } from '../../social-network/shared'
import { setStorage } from '../../utils/browser.storage'
import { useStylesExtends } from '../custom-ui-helper'
import { useCapturedInput } from '../../utils/hooks/useCapturedEvents'
import { ProfileIdentifier } from '../../database/type'

interface BannerUIProps
    extends withClasses<KeysInferFromUseStyles<typeof useStyles> | 'header' | 'content' | 'actions' | 'button'> {
    title?: string
    description?: string
    nextStep: 'hidden' | { onClick(): void }
    close: 'hidden' | { onClose(): void }
    username:
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
        paddingBottom: 0,
    },
}))
export function BannerUI(props: BannerUIProps) {
    const classes = useStylesExtends(useStyles(), props)

    const Title = props.title ?? geti18nString('banner_title')
    const Description = props.description ?? geti18nString('banner_preparing_setup')

    const emptyUsernameHelperText = geti18nString('banner_empty_username')
    const invalidUsernameHelperText = geti18nString('banner_invalid_username')

    const { username } = props

    //#region Input
    const [touched, isTouched] = React.useState(false)
    const usedValue = username === 'hidden' ? '' : touched ? username.value : username.defaultValue
    const isInvalid = username === 'hidden' ? false : touched ? !username.isValid(usedValue) : false
    const helperText =
        username === 'hidden'
            ? ''
            : isInvalid
            ? (username.value + username.defaultValue).length
                ? invalidUsernameHelperText
                : emptyUsernameHelperText
            : ' '
    const ref = React.useRef<HTMLInputElement>()
    useCapturedInput(
        ref,
        e => {
            if (username === 'hidden') return
            isTouched(true)
            username.onChange(e)
        },
        [username],
    )
    const UserNameInput =
        username === 'hidden' ? null : (
            <TextField
                label="Username"
                onChange={() => {}}
                value={usedValue}
                error={isInvalid}
                helperText={helperText}
                fullWidth
                InputProps={{
                    startAdornment: <InputAdornment position="start">@</InputAdornment>,
                    inputRef: ref,
                }}
                margin="dense"
                variant="standard"
            />
        )
    //#endregion
    const GetStarted =
        props.nextStep === 'hidden' ? null : (
            <Button
                className={classes.button}
                disabled={username === 'hidden' ? false : !username.isValid(usedValue)}
                onClick={props.nextStep.onClick}
                variant="contained"
                color="primary">
                {geti18nString('banner_get_started')}
            </Button>
        )
    const DismissButton =
        props.close !== 'hidden' ? (
            <Button className={classes.button} color="primary" onClick={props.close.onClose}>
                {geti18nString('cancel')}
            </Button>
        ) : null
    return (
        <AppBar position="static" color="inherit" elevation={0} classes={{ root: classes.root }}>
            <DialogTitle classes={{ root: classes.title }} className={classes.header}>
                {Title}
            </DialogTitle>
            <DialogContent className={classes.content}>
                <DialogContentText>{Description}</DialogContentText>
                {UserNameInput}
            </DialogContent>
            <DialogActions className={classes.actions}>
                {DismissButton}
                {GetStarted}
            </DialogActions>
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
            close={props.close ?? { onClose: defaultClose }}
            nextStep={props.nextStep ?? { onClick: defaultNextStep }}
        />
    )
}
