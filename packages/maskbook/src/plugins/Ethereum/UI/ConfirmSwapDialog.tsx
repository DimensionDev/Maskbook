import { makeNumberCaptcha } from '@dimensiondev/kit'
import { Button, createStyles, DialogContent, Grid, makeStyles, TextField } from '@material-ui/core'
import { FC, useCallback, useEffect, useState, MouseEvent } from 'react'
import { InjectedDialog } from '../../../components/shared/InjectedDialog'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { useI18N } from '../../../utils/i18n-next-ui'
import { EthereumMessages } from '../messages'

interface Props {}

const useStyles = makeStyles(() =>
    createStyles({
        padding: {
            paddingTop: '1em',
            paddingBottom: '1em',
        },
        math: {
            fontSize: '3em',
            userSelect: 'none',
            cursor: 'pointer',
            width: '100%',
        },
        value: {
            width: '1em',
            display: 'inline-block',
            textAlign: 'center',
        },
    }),
)

const operations: Record<string, string> = {
    '+': '\u002B', // https://unicode-table.com/en/002B/
    '-': '\u2212', // https://unicode-table.com/en/2212/
    '*': '\u00D7', // https://unicode-table.com/en/00D7/
    '/': '\u00F7', // https://unicode-table.com/en/00F7/
}

export const ConfirmSwapDialog: FC<Props> = () => {
    const classes = useStyles()
    const { t } = useI18N()
    const [value, setValue] = useState(0)
    const [problem, setProblem] = useState(makeNumberCaptcha())

    const [, , , result] = problem
    const handleRefresh = () => setProblem(makeNumberCaptcha())

    //#region remote controlled dialog
    const [open, setOpen] = useRemoteControlledDialog(EthereumMessages.events.confirmSwapDialogUpdated)
    const handleConfirm = useCallback(() => {
        if (value !== result) return
        setOpen({ open: false, result: true })
    }, [value, result, setOpen])
    const handleClose = useCallback(() => setOpen({ open: false, result: false }), [setOpen])
    //#endregion

    useEffect(() => {
        if (open) {
            setProblem(makeNumberCaptcha())
        }
    }, [open])

    return (
        <InjectedDialog
            open={open}
            onClose={handleClose}
            title={t('plugin_wallet_captcha')}
            DialogProps={{ maxWidth: 'xs' }}>
            <DialogContent>
                <Grid>
                    <Grid item className={classes.padding}>
                        <Formula onClick={handleRefresh} problem={problem} variable={1} />
                    </Grid>
                    <Grid item className={classes.padding}>
                        <TextField
                            fullWidth
                            type="number"
                            onChange={(event) => setValue(+event.currentTarget.value)}
                            placeholder={t('plugin_wallet_captcha_hint')}
                        />
                    </Grid>
                    <Grid item className={classes.padding}>
                        <Button disabled={value !== result} fullWidth variant="contained" onClick={handleConfirm}>
                            {t('plugin_wallet_captcha_confirm')}
                        </Button>
                    </Grid>
                </Grid>
            </DialogContent>
        </InjectedDialog>
    )
}

interface FormulaProps {
    onClick: () => void
    problem: ReturnType<typeof makeNumberCaptcha>
    variable: number
}

const Formula: FC<FormulaProps> = ({ onClick, problem, variable }) => {
    const classes = useStyles()
    const [operation] = problem
    const makeValue = (index: number) => {
        if (variable === index) {
            return <var className={classes.value}>?</var>
        }
        return <b className={classes.value}>{problem[index]}</b>
    }
    return (
        <section
            onClick={onClick}
            onDoubleClick={onPreventDefault}
            onContextMenu={onPreventDefault}
            onDrag={onPreventDefault}
            onDrop={onPreventDefault}
            className={classes.math}>
            {makeValue(1)}
            <span className={classes.value}> {operations[operation]} </span>
            {makeValue(2)}
            <span> = </span>
            {makeValue(3)}
        </section>
    )
}

function onPreventDefault(event: MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
}
