import * as React from 'react'
import Paper from '@material-ui/core/Paper/Paper'
import Typography from '@material-ui/core/Typography/Typography'
import { withStylesTyped } from '../../utils/theme'
import { Theme } from '@material-ui/core/styles/createMuiTheme'
import createStyles from '@material-ui/core/styles/createStyles'
import Button from '@material-ui/core/Button/Button'
import { createBox } from '../../utils/Flex'

import ArrowBack from '@material-ui/icons/ArrowBack'

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
}))
interface Props {
    back(): void
    restore(blob: string): void
}
export default withStylesTyped((theme: Theme) =>
    createStyles({
        paper: {
            maxWidth: '35rem',
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
    const [[name, blob], setJSON] = React.useState<[string, string]>(['', ''])
    return (
        <Paper className={classes.paper}>
            <nav className={classes.nav}>
                <Button onClick={back} disableFocusRipple disableRipple className={classes.navButton}>
                    <ArrowBack className={classes.navButtonIcon} />
                    Back
                </Button>
            </nav>
            <main className={classes.main}>
                <Typography variant="h5">Restore Keypairs</Typography>
                <form>
                    <input
                        style={{ display: 'none' }}
                        type="file"
                        accept="application/json"
                        ref={ref}
                        onChange={e => setJSON(getBlob(e))}
                    />
                    <RestoreBox onClick={() => ref.current && ref.current.click()}>
                        {!name ? 'Select exported keystore file' : `Selected exported keystore file ${name}`}
                    </RestoreBox>
                </form>
                <Button
                    onClick={() => restore(blob)}
                    disabled={!name}
                    variant="contained"
                    color="primary"
                    className={classes.button}>
                    Restore
                </Button>
            </main>
        </Paper>
    )
})

function getBlob(event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>): [string, string] {
    const files = (
        (event as React.DragEvent).dataTransfer || (event as React.ChangeEvent<HTMLInputElement>).currentTarget
    ).files
    if (!files) return ['', '']
    const file = files.item(0)
    if (!file) return ['', '']
    return [file.name, URL.createObjectURL(file)]
}
