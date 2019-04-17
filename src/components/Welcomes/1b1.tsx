import * as React from 'react'
import Paper from '@material-ui/core/Paper/Paper'
import Typography from '@material-ui/core/Typography/Typography'
import { withStylesTyped } from '../../utils/theme'
import createStyles from '@material-ui/core/styles/createStyles'
import Button from '@material-ui/core/Button/Button'
import { createBox } from '../../utils/Flex'

import ArrowBack from '@material-ui/icons/ArrowBack'
import { useDragAndDrop } from '../../utils/useDragAndDrop'

const RestoreBox = createBox(theme => ({
    color: theme.palette.text.hint,
    border: `2px dashed ${theme.palette.divider}`,
    whiteSpace: 'pre-line',
    minHeight: 160 - theme.spacing.unit * 8,
    width: 300,
    borderRadius: theme.shape.borderRadius,
    display: 'inline-flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    padding: theme.spacing.unit * 4,
    transition: '0.4s',
}))
interface Props {
    back(): void
    restore(file: File): void
}
export default withStylesTyped(theme =>
    createStyles({
        paper: {
            width: 600,
            boxSizing: 'border-box',
        },
        nav: {
            paddingTop: theme.spacing.unit,
            paddingLeft: theme.spacing.unit,
        },
        navButton: {
            color: theme.palette.text.hint,
        },
        navButtonIcon: {
            marginRight: theme.spacing.unit,
        },
        main: {
            padding: '2rem 2rem 1rem 2rem',
            textAlign: 'center',
            '& > *': {
                marginBottom: theme.spacing.unit * 3,
            },
        },
        button: {
            minWidth: 180,
        },
    }),
)<Props>(function Welcome({ classes, back, restore }) {
    const ref = React.useRef<HTMLInputElement>(null)
    const { dragEvents, fileReceiver, fileRef, dragStatus } = useDragAndDrop()
    return (
        <Paper {...dragEvents} className={classes.paper}>
            <nav className={classes.nav}>
                <Button onClick={back} disableFocusRipple disableRipple className={classes.navButton}>
                    <ArrowBack className={classes.navButtonIcon} />
                    Back
                </Button>
            </nav>
            <main className={classes.main}>
                <Typography variant="h5">Restore your keypair</Typography>
                <form>
                    <input
                        style={{ display: 'none' }}
                        type="file"
                        accept="application/json"
                        ref={ref}
                        onChange={fileReceiver}
                    />
                    <RestoreBox
                        style={{
                            color: dragStatus === 'drag-enter' ? 'black' : 'gray',
                        }}
                        onClick={() => ref.current && ref.current.click()}>
                        {dragStatus === 'drag-enter'
                            ? 'Drag your key backup into this dialog'
                            : fileRef.current
                            ? `Selected exported key backup: ${fileRef.current.name}`
                            : 'Select your exported key backup'}
                    </RestoreBox>
                </form>
                <Button
                    onClick={() => restore(fileRef.current!)}
                    disabled={!fileRef.current}
                    variant="contained"
                    color="primary"
                    className={classes.button}>
                    Restore
                </Button>
            </main>
        </Paper>
    )
})
