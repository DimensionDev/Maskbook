import * as React from 'react'
import Paper from '@material-ui/core/Paper/Paper'
import Typography from '@material-ui/core/Typography/Typography'
import { withStylesTyped } from '../../utils/theme'
import createStyles from '@material-ui/core/styles/createStyles'
import Button from '@material-ui/core/Button/Button'

import Auto from './1a4.auto'
import Manual from './1a4.manual'
import { geti18nString } from '../../utils/i18n'

interface Props {
    bioDisabled?: boolean
    provePost: string
    requestAutoVerify(type: 'bio' | 'post'): void
    requestManualVerify(): void
}
export default withStylesTyped(theme =>
    createStyles({
        paper: {
            padding: '2rem 2rem 1rem 2rem',
            textAlign: 'center',
            width: 600,
            boxSizing: 'border-box',
            '& > *': {
                marginBottom: theme.spacing.unit * 3,
            },
        },
        button: { minWidth: 180 },
        textFieldShort: { minHeight: '10em' },
        textFieldLong: { minHeight: '11em' },
        red: { color: 'red' },
    }),
)<Props>(function Welcome({ classes, provePost, requestAutoVerify, requestManualVerify, bioDisabled }) {
    const [actionType, setActionType] = React.useState<'auto' | 'manual'>('auto')
    const [type, setType] = React.useState<'bio' | 'post'>(bioDisabled ? 'post' : 'bio')

    const setManual = React.useCallback(() => setActionType('manual'), [])
    const setAuto = React.useCallback(() => setActionType('auto'), [])
    const finish = React.useCallback(() => requestAutoVerify(type), [type])

    const auto = (
        <>
            <Typography variant="subtitle1">
                {geti18nString('welcome-1a4-type-auto-subtitle1')}
                <br />
                {geti18nString('welcome-1a4-type-auto-subtitle2')}
            </Typography>
            <Button onClick={finish} variant="contained" color="primary" className={classes.button}>
                {geti18nString('finish')}
            </Button>
            <br />
            <Button color="primary" onClick={setManual}>
                {geti18nString('welcome-1a4-type-auto-switch')}
            </Button>
        </>
    )
    const manual = (
        <>
            <Typography variant="subtitle1">
                {geti18nString('welcome-1a4-type-manual-subtitle1')}
                <br />
                {geti18nString('welcome-1a4-type-manual-subtitle2')}
            </Typography>
            <Button onClick={requestManualVerify} variant="contained" color="primary" className={classes.button}>
                {geti18nString('welcome-1a4-type-manual-goto')}
            </Button>
            <br />
            <Button color="primary" onClick={setAuto}>
                {geti18nString('welcome-1a4-type-manual-switch')}
            </Button>
        </>
    )
    return (
        <Paper className={classes.paper}>
            <Typography variant="h5">{geti18nString('welcome-1a4-title')}</Typography>
            {actionType === 'auto' ? (
                <Auto bioDisabled={!!bioDisabled} type={type} setType={setType} />
            ) : (
                <Manual provePost={provePost} />
            )}
            {actionType === 'auto' && bioDisabled && (
                <span className={classes.red}>{geti18nString('welcome-1a4-bio-disabled')}</span>
            )}
            {actionType === 'auto' ? auto : manual}
        </Paper>
    )
})
