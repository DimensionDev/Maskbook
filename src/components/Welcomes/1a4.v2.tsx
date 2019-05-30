import * as React from 'react'

import Auto from './1a4.auto'
import Manual from './1a4.manual'
import { geti18nString } from '../../utils/i18n'
import { withStatement } from '@babel/types'
import { makeStyles, Typography, Button, Paper } from '@material-ui/core'

interface Props {
    bioDisabled?: boolean
    provePost: string
    requestAutoVerify(type: 'bio' | 'post'): void
    requestManualVerify(): void
}
const useStyles = makeStyles(theme => ({
    paper: {
        padding: '2rem 2rem 1rem 2rem',
        textAlign: 'center',
        width: 600,
        boxSizing: 'border-box',
        '& > *': {
            marginBottom: theme.spacing(3),
        },
    },
    button: { minWidth: 180 },
    textFieldShort: { minHeight: '10em' },
    textFieldLong: { minHeight: '11em' },
    red: { color: 'red' },
}))
export default function Welcome({ provePost, requestAutoVerify, requestManualVerify, bioDisabled }: Props) {
    const classes = useStyles()
    const [actionType, setActionType] = React.useState<'auto' | 'manual'>('auto')
    const [type, setType] = React.useState<'bio' | 'post'>(bioDisabled ? 'post' : 'bio')

    const setManual = React.useCallback(() => setActionType('manual'), [])
    const setAuto = React.useCallback(() => setActionType('auto'), [])
    const finish = React.useCallback(() => requestAutoVerify(type), [type])

    const auto = (
        <>
            <Typography variant="subtitle1">
                {geti18nString('welcome_1a4_type_auto_subtitle1')}
                <br />
                {geti18nString('welcome_1a4_type_auto_subtitle2')}
            </Typography>
            <Button onClick={finish} variant="contained" color="primary" className={classes.button}>
                {geti18nString('finish')}
            </Button>
            <br />
            <Button color="primary" onClick={setManual}>
                {geti18nString('welcome_1a4_type_auto_switch')}
            </Button>
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
            <Button color="primary" onClick={setAuto}>
                {geti18nString('welcome_1a4_type_manual_switch')}
            </Button>
        </>
    )
    return (
        <Paper elevation={2} className={classes.paper}>
            <Typography variant="h5">{geti18nString('welcome_1a4_title')}</Typography>
            {actionType === 'auto' ? (
                <Auto bioDisabled={!!bioDisabled} type={type} setType={setType} />
            ) : (
                <Manual provePost={provePost} />
            )}
            {actionType === 'auto' && bioDisabled && (
                <span className={classes.red}>{geti18nString('welcome_1a4_bio_disabled')}</span>
            )}
            {actionType === 'auto' ? auto : manual}
        </Paper>
    )
}
