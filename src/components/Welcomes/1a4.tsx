import * as React from 'react'
import Paper from '@material-ui/core/Paper/Paper'
import Typography from '@material-ui/core/Typography/Typography'
import { withStylesTyped } from '../../utils/theme'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import Button from '@material-ui/core/Button/Button'
import { createThemedBox } from '../../utils/Flex'

const TextField = createThemedBox(theme => ({
    background: theme.palette.background.default,
    color: theme.palette.grey[700],
    padding: `${theme.spacing.unit * 2}px`,
    border: `1px solid ${theme.palette.divider}`,
    textAlign: 'start',
    whiteSpace: 'pre-line',
    minHeight: '10em',
    borderRadius: theme.shape.borderRadius,
}))
interface Props {}
export default withStylesTyped((theme: Theme) =>
    createStyles({
        paper: {
            padding: '2rem 2rem 1rem 2rem',
            textAlign: 'center',
            maxWidth: '35rem',
            '& > *': {
                marginBottom: theme.spacing.unit * 3,
            },
        },
        button: {
            minWidth: 180,
        },
    }),
)<{}>(function Welcome({ classes }) {
    return (
        <Paper className={classes.paper}>
            <Typography variant="h5">Let your friends join Maskbook</Typography>
            <TextField>
                I'm using Maskbook to encrypt my posts to prevent Facebook from peeping into them. Install Maskbook as
                well so that you may read my encrypted posts, and may prevent Facebook from intercepting our
                communication.
                {`
Link: https://maskbook.app/s/#mQINBF-BxAcBEA-zyfSodx`}
            </TextField>
            <Typography variant="subtitle1">
                Mathematically, you have to post this. Or your friends cannot verify the connection between your keypair
                and your account.
            </Typography>
            <Button variant="raised" color="primary" className={classes.button}>
                Post Now
            </Button>
        </Paper>
    )
})
