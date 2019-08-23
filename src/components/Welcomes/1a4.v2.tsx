import * as React from 'react'

import Auto from './1a4.auto'
import Manual from './1a4.manual'
import { geti18nString } from '../../utils/i18n'
import { makeStyles, Typography, Button } from '@material-ui/core'
import WelcomeContainer from './WelcomeContainer'

interface Props {
    hasBio: boolean
    hasPost: boolean
    hasManual: boolean
    postDisabled?: boolean
    bioDisabled?: boolean
    provePost: string
    requestAutoVerify(type: 'bio' | 'post'): void
    requestManualVerify(): void
}
const useStyles = makeStyles(theme => ({
    paper: {
        padding: '2rem 2rem 1rem 2rem',
        textAlign: 'center',
        '& > *': {
            marginBottom: theme.spacing(3),
        },
    },
    button: { minWidth: 180 },
    textFieldShort: { minHeight: '10em' },
    textFieldLong: { minHeight: '11em' },
    red: { color: 'red' },
}))
export default function Welcome(props: Props) {
    const { provePost, requestAutoVerify, requestManualVerify } = props
    const { bioDisabled, postDisabled, hasBio, hasPost, hasManual } = props

    const classes = useStyles()

    const [actionType, setActionType] = React.useState<'auto' | 'manual'>(hasBio || hasPost ? 'auto' : 'manual')

    const bioAvailable = hasBio && !bioDisabled
    const postAvailable = hasPost && !postDisabled
    const autoAvailable = bioAvailable || postAvailable

    const [type, setType] = React.useState<'bio' | 'post' | undefined>(undefined)
    const setManual = React.useCallback(() => setActionType('manual'), [])
    const setAuto = React.useCallback(() => setActionType('auto'), [])
    const finish = React.useCallback(() => requestAutoVerify(type!), [requestAutoVerify, type])

    if (!autoAvailable && !hasManual) return <>There is no way to setup Maskbook</>
    if (type === undefined) {
        if (bioAvailable) setType('bio')
        else if (postAvailable) setType('post')
    }
    if (!bioAvailable && type === 'bio' && postAvailable) setType('post')
    if (!postAvailable && type === 'post' && bioAvailable) setType('bio')
    if (!autoAvailable && actionType === 'auto') {
        setType(undefined)
        setManual()
    }
    if (!hasManual && actionType === 'manual') setAuto()

    const auto = (
        <>
            <Typography variant="subtitle1">
                {geti18nString('welcome_1a4_type_auto_subtitle1')}
                <br />
                {geti18nString('welcome_1a4_type_auto_subtitle2')}
            </Typography>
            {(bioAvailable || postAvailable) && (
                <Button onClick={finish} variant="contained" color="primary" className={classes.button}>
                    {geti18nString('finish')}
                </Button>
            )}
            <br />
            {hasManual && (
                <Button color="primary" onClick={setManual}>
                    {geti18nString('welcome_1a4_type_auto_switch')}
                </Button>
            )}
        </>
    )
    const manual = (
        <>
            <Typography variant="subtitle1">
                {geti18nString('welcome_1a4_type_manual_subtitle1')}
                <br />
                {geti18nString('welcome_1a4_type_manual_subtitle2')}
            </Typography>
            <Button onClick={requestManualVerify} variant="contained" color="primary" className={classes.button}>
                {geti18nString('welcome_1a4_type_manual_goto')}
            </Button>
            <br />
            {autoAvailable && (
                <Button color="primary" onClick={setAuto}>
                    {geti18nString('welcome_1a4_type_manual_switch')}
                </Button>
            )}
        </>
    )
    return (
        <WelcomeContainer className={classes.paper}>
            <Typography variant="h5">{geti18nString('welcome_1a4_title')}</Typography>
            {actionType === 'auto' ? (
                <Auto
                    hasBio={hasBio}
                    hasPost={hasPost}
                    postDisabled={!!postDisabled}
                    bioDisabled={!!bioDisabled}
                    type={type}
                    setType={setType}
                />
            ) : (
                <Manual provePost={provePost} />
            )}
            {actionType === 'auto' && ((bioDisabled && hasBio) || (postDisabled && hasPost)) && (
                <span className={classes.red}>{geti18nString('welcome_1a4_disabled')}</span>
            )}
            {actionType === 'auto' ? auto : manual}
        </WelcomeContainer>
    )
}
