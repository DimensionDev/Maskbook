import * as React from 'react'
import Paper from '@material-ui/core/Paper/Paper'
import Typography from '@material-ui/core/Typography/Typography'
import { withStylesTyped } from '../../utils/theme'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import Button from '@material-ui/core/Button/Button'
import { createBox } from '../../utils/Flex'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel/FormControlLabel'

const TextField = createBox(theme => ({
    background: theme.palette.background.default,
    color: theme.palette.text.hint,
    padding: `${theme.spacing.unit * 2}px`,
    border: `1px solid ${theme.palette.divider}`,
    textAlign: 'start',
    whiteSpace: 'pre-line',
    minHeight: '10em',
    borderRadius: theme.shape.borderRadius,
    fontSize: '1.15rem',
    wordBreak: 'break-all',
}))
interface Props {
    copyToClipboard(text: string): void
    provePost: string
}
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
)<Props>(function Welcome({ classes, copyToClipboard, provePost }) {
    const full = `I'm using Maskbook to encrypt my posts to prevent Facebook from peeping into them.
Install Maskbook as well so that you may read my encrypted posts,
and may prevent Facebook from intercepting our communication.
Here is my public key ${provePost}`
    const [showShort, setShort] = React.useState(false)
    return (
        <Paper className={classes.paper}>
            <Typography variant="h5">Let your friends join Maskbook</Typography>
            <TextField>{showShort ? provePost : full}</TextField>
            <Typography variant="subtitle1">
                Mathematically, you have to {!showShort ? 'post this' : 'add it to your bio'}. Or your friends cannot
                verify the connection between your keypair and your account.
            </Typography>
            <FormControlLabel
                control={<Checkbox onChange={e => setShort(e.currentTarget.checked)} checked={showShort} />}
                label="No, I don't want to create a post."
            />
            <br />
            <Button
                onClick={() => copyToClipboard(showShort ? provePost : full)}
                variant="contained"
                color="primary"
                className={classes.button}>
                Copy to clipboard
            </Button>
        </Paper>
    )
})
