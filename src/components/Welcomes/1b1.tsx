import * as React from 'react'
import { createBox } from '../../utils/components/Flex'

import ArrowBack from '@material-ui/icons/ArrowBack'
import { useDragAndDrop } from '../../utils/hooks/useDragAndDrop'
import { geti18nString } from '../../utils/i18n'
import { makeStyles, Paper, Button, Typography } from '@material-ui/core'

const RestoreBox = createBox(theme => ({
    color: theme.palette.text.hint,
    border: `2px dashed ${theme.palette.divider}`,
    whiteSpace: 'pre-line',
    minHeight: 160 - theme.spacing(8),
    width: 300,
    borderRadius: theme.shape.borderRadius,
    display: 'inline-flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign: 'center',
    cursor: 'pointer',
    padding: theme.spacing(4),
    transition: '0.4s',
}))
interface Props {
    back(): void
    restore(file: File): void
}
const useStyles = makeStyles(theme => ({
    paper: {
        width: 600,
        boxSizing: 'border-box',
    },
    nav: {
        paddingTop: theme.spacing(1),
        paddingLeft: theme.spacing(1),
    },
    navButton: {
        color: theme.palette.text.hint,
    },
    navButtonIcon: {
        marginRight: theme.spacing(1),
    },
    main: {
        padding: '2rem 2rem 1rem 2rem',
        textAlign: 'center',
        '& > *': {
            marginBottom: theme.spacing(3),
        },
    },
    button: {
        minWidth: 180,
    },
    file: {
        display: 'none',
    },
    restoreBox: {
        color: 'gray',
        transition: '0.4s',
        '&[data-active=true]': {
            color: 'black',
        },
    },
}))
export default function Welcome({ back, restore }: Props) {
    const classes = useStyles()
    const ref = React.useRef<HTMLInputElement>(null)
    const { dragEvents, fileReceiver, fileRef, dragStatus } = useDragAndDrop()
    return (
        <Paper elevation={2} {...dragEvents} className={classes.paper}>
            <nav className={classes.nav}>
                <Button onClick={back} disableFocusRipple disableRipple className={classes.navButton}>
                    <ArrowBack className={classes.navButtonIcon} />
                    {geti18nString('back')}
                </Button>
            </nav>
            <main className={classes.main}>
                <Typography variant="h5">{geti18nString('welcome_1b_title')}</Typography>
                <form>
                    <input
                        className={classes.file}
                        type="file"
                        accept="application/json"
                        ref={ref}
                        onChange={fileReceiver}
                    />
                    <RestoreBox
                        className={classes.restoreBox}
                        data-active={dragStatus === 'drag-enter'}
                        onClick={() => ref.current && ref.current.click()}>
                        {dragStatus === 'drag-enter'
                            ? geti18nString('welcome_1b_dragging')
                            : fileRef.current
                            ? geti18nString('welcome_1b_file_selected', fileRef.current.name)
                            : geti18nString('welcome_1b_no_file_selected')}
                    </RestoreBox>
                </form>
                <Button
                    onClick={() => restore(fileRef.current!)}
                    disabled={!fileRef.current}
                    variant="contained"
                    color="primary"
                    className={classes.button}>
                    {geti18nString('restore')}
                </Button>
            </main>
        </Paper>
    )
}
