import * as React from 'react'
import Paper from '@material-ui/core/Paper/Paper'
import Typography from '@material-ui/core/Typography/Typography'
import { withStylesTyped } from '../../utils/theme'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import Button from '@material-ui/core/Button/Button'
import { createBox } from '../../utils/Flex'

const TextField = createBox(
    theme => ({
        background: theme.palette.background.default,
        color: theme.palette.text.hint,
        padding: `${theme.spacing.unit * 2}px`,
        border: `1px solid ${theme.palette.divider}`,
        textAlign: 'start',
        whiteSpace: 'pre-line',
        borderRadius: theme.shape.borderRadius,
        fontSize: '1.15rem',
        wordBreak: 'break-all',
        display: 'block',
        resize: 'none',
        width: '100%',
        boxSizing: 'border-box',
    }),
    'textarea',
)
interface Props {
    copyToClipboard(text: string, gotoBio: boolean): void
    provePost: string
}
export default withStylesTyped((theme: Theme) =>
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
    }),
)<Props>(function Welcome({ classes, copyToClipboard, provePost }) {
    const full = `I'm using https://maskbook.io/ to encrypt my posts to prevent Facebook from peeping into them.
Install Maskbook as well, so that you may read my encrypted posts, and prevent Facebook from imposing surveillance on our communication.
Privacy, enforced.
${provePost}`
    const [showShort, setShort] = React.useState(false)
    const ref = React.createRef<HTMLTextAreaElement>()
    function onFocus() {
        setTimeout(() => {
            if (!ref.current) return
            ref.current.select()
        }, 20)
    }
    const onBlur = React.useCallback(() => {
        const selection = getSelection()
        if (!selection) return
        selection.removeAllRanges()
    }, [])
    return (
        <Paper className={classes.paper}>
            <Typography variant="h5">Let your friends join Maskbook</Typography>
            <TextField
                ref={ref}
                readOnly
                onClick={onFocus}
                onFocus={onFocus}
                onBlur={onBlur}
                value={showShort ? provePost : full}
                style={{ minHeight: showShort ? '10em' : '11em' }}
            />
            <Typography variant="subtitle1">
                {showShort
                    ? 'Paste this into your profile bio, then your friends can verify the connection between your Maskbook and your Facebook account.'
                    : 'Avoid any confusion before your first encrypted post.'}
            </Typography>
            <Button
                onClick={() => copyToClipboard(showShort ? provePost : full, showShort)}
                variant="contained"
                color="primary"
                className={classes.button}>
                {showShort ? 'Copy & Go to profile' : 'Copy to clipboard'}
            </Button>
            <br />
            <Button color="primary" onClick={() => setShort(!showShort)}>
                But I want to {showShort ? 'create a post' : 'add it to my bio'} instead ...
            </Button>
        </Paper>
    )
})
