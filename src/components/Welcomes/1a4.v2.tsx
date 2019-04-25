import * as React from 'react'
import Paper from '@material-ui/core/Paper/Paper'
import Typography from '@material-ui/core/Typography/Typography'
import { withStylesTyped } from '../../utils/theme'
import createStyles from '@material-ui/core/styles/createStyles'
import Button from '@material-ui/core/Button/Button'

import Auto from './1a4.auto'
import Manual from './1a4.manual'

interface Props {
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
        button: {
            minWidth: 180,
        },
        textFieldShort: {
            minHeight: '10em',
        },
        textFieldLong: {
            minHeight: '11em',
        },
    }),
)<Props>(function Welcome({ classes, provePost, requestAutoVerify, requestManualVerify }) {
    const [actionType, setActionType] = React.useState<'auto' | 'manual'>('auto')
    const [type, setType] = React.useState<'bio' | 'post'>('bio')

    const setManual = React.useCallback(() => setActionType('manual'), [])
    const setAuto = React.useCallback(() => setActionType('auto'), [])
    const finish = React.useCallback(() => requestAutoVerify(type), [type])

    const auto = (
        <>
            <Typography variant="subtitle1">
                Avoid any confusion before your first encrypted post.
                <br />
                This allows your friends to verify the connection between your Facebook account and your keypair.
            </Typography>
            <Button onClick={finish} variant="contained" color="primary" className={classes.button}>
                Finish
            </Button>
            <br />
            <Button color="primary" onClick={setManual}>
                Prefer doing it manually?
            </Button>
        </>
    )
    const manual = (
        <>
            <Typography variant="subtitle1">
                Add this to bio, or post on timeline, before your first encrypted post.
                <br />
                This allows your friends to verify the connection between your Facebook account and your keypair.
            </Typography>
            <Button onClick={requestManualVerify} variant="contained" color="primary" className={classes.button}>
                Copy & Go to Profile
            </Button>
            <br />
            <Button color="primary" onClick={setAuto}>
                Prefer automating the steps?
            </Button>
        </>
    )
    return (
        <Paper className={classes.paper}>
            <Typography variant="h5">Verify Account Ownership</Typography>
            {actionType === 'auto' ? <Auto type={type} setType={setType} /> : <Manual provePost={provePost} />}
            {actionType === 'auto' ? auto : manual}
        </Paper>
    )
})
