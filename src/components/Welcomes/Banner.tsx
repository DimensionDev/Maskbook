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
import { getActivatedUI, SocialNetworkUI } from '../../social-network/ui'
import { env } from '../../social-network/shared'
import { setStorage } from '../../utils/browser.storage'
import { useStylesExtends } from '../custom-ui-helper'
import { useCapturedInput } from '../../utils/hooks/useCapturedEvents'
import { PersonIdentifier } from '../../database/type'

interface Props extends withClasses<KeysInferFromUseStyles<typeof useStyles>> {
    nextStep: { onClick(): void }
    close: 'hidden' | { onClose(): void }
    title?: string
    description?: string
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
export function BannerUI(props: Props) {
    const classes = useStylesExtends(useStyles(), props)

    const Title = props.title ?? geti18nString('banner_title')
    const Description = props.description ?? geti18nString('banner_preparing_setup')

    const emptyUsernameHelperText = geti18nString('banner_empty_username')
    const invalidUsernameHelperText = geti18nString('banner_invalid_username')

    const { username } = props

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
    const GetStarted = (
        <Button
            disabled={username === 'hidden' ? false : !username.isValid(usedValue)}
            onClick={props.nextStep.onClick}
            variant="contained"
            color="primary">
            {geti18nString('banner_get_started')}
        </Button>
    )
    const DismissButton =
        props.close !== 'hidden' ? (
            <Button onClick={props.close.onClose} color="primary">
                {geti18nString('cancel')}
            </Button>
        ) : null
    return (
        <AppBar position="static" color="inherit" elevation={0} classes={{ root: classes.root }}>
            <DialogTitle classes={{ root: classes.title }}>{Title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{Description}</DialogContentText>
                {UserNameInput}
            </DialogContent>
            <DialogActions>
                {DismissButton}
                {GetStarted}
            </DialogActions>
        </AppBar>
    )
}

type networkIdentifier = { networkIdentifier: SocialNetworkUI['networkIdentifier'] }
export type BannerProps = Partial<Props> &
    Partial<networkIdentifier> &
    (networkIdentifier | Required<Pick<Props, 'nextStep'>>)
export function Banner(props: BannerProps) {
    const lastRecognizedIdentity = useLastRecognizedIdentity()
    const closeDefault = useCallback(() => {
        getActivatedUI().ignoreSetupAccount(env, {})
    }, [])
    const [value, onChange] = React.useState('')
    const getStartDefault = useCallback(() => {
        if (!props.networkIdentifier)
            return (
                props.nextStep?.onClick() ??
                (() => console.warn('You must provide one of networkIdentifier or nextStep.onClick'))
            )
        setStorage(props.networkIdentifier, { forceDisplayWelcome: false })
        const id = { ...lastRecognizedIdentity }
        id.identifier =
            value === '' ? lastRecognizedIdentity.identifier : new PersonIdentifier(props.networkIdentifier, value)
        Services.Welcome.openWelcomePage(id)
    }, [lastRecognizedIdentity, props.networkIdentifier, props.nextStep, value])

    return (
        <BannerUI
            {...props}
            username={
                props.username ?? {
                    defaultValue: lastRecognizedIdentity.identifier.isUnknown
                        ? ''
                        : lastRecognizedIdentity.identifier.userId,
                    value,
                    onChange,
                    isValid: getActivatedUI().isValidUsername,
                }
            }
            close={props.close ?? { onClose: closeDefault }}
            nextStep={
                props.nextStep ?? {
                    onClick: getStartDefault,
                }
            }
        />
    )
}
