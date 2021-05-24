import { memo, useState } from 'react'
import { MaskDialog } from '@dimensiondev/maskbook-theme'
import { Button, DialogActions, DialogContent, makeStyles, TextField } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
    content: {
        padding: theme.spacing(3.5, 5, 6.75),
        minWidth: 600,
    },
    actions: {
        padding: theme.spacing(1, 5, 6.75, 5),
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: theme.spacing(3.5),
    },
    button: {
        borderRadius: Number(theme.shape.borderRadius) * 5,
    },
}))

export interface AddTokenDialogProps {
    open: boolean
    onClose: () => void
}

enum AddTokenStep {
    INFORMATION,
    CONFIRM,
}

export const AddTokenDialog = memo<AddTokenDialogProps>(({ open, onClose }) => {
    const classes = useStyles()
    const [step, setStep] = useState<AddTokenStep>(AddTokenStep.INFORMATION)
    return (
        <MaskDialog open={open} title="Add Token">
            {step === AddTokenStep.INFORMATION ? (
                <>
                    <DialogContent className={classes.content}>
                        <AddTokenFormUI />
                    </DialogContent>
                    <DialogActions className={classes.actions}>
                        <Button color="secondary" className={classes.button} onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            color="primary"
                            className={classes.button}
                            onClick={() => setStep(AddTokenStep.CONFIRM)}>
                            Next
                        </Button>
                    </DialogActions>
                </>
            ) : null}
            {step === AddTokenStep.CONFIRM ? (
                <>
                    <DialogContent className={classes.content}>
                        <AddTokenConfirmUI />
                    </DialogContent>
                    <DialogActions className={classes.actions}>
                        <Button
                            color="secondary"
                            className={classes.button}
                            onClick={() => setStep(AddTokenStep.INFORMATION)}>
                            Back
                        </Button>
                        <Button color="primary" className={classes.button}>
                            Add Token
                        </Button>
                    </DialogActions>
                </>
            ) : null}
        </MaskDialog>
    )
})

const useAddTokenFormUIStyles = makeStyles((theme) => ({
    item: {
        display: 'flex',
        flexDirection: 'column',
        marginBottom: theme.spacing(3.75),
    },
    title: {
        fontSize: theme.typography.pxToRem(12),
        color: '#15181B',
        marginBottom: theme.spacing(1.2),
    },
}))

//TODO: Auto fill symbol and decimals when contract address be input
//TODO: check field
export const AddTokenFormUI = memo(() => {
    const classes = useAddTokenFormUIStyles()
    return (
        <form>
            <div className={classes.item}>
                <label className={classes.title}>Token Contract Address</label>
                <TextField variant="filled" InputProps={{ disableUnderline: true }} placeholder="Contract address" />
            </div>
            <div className={classes.item}>
                <label className={classes.title}>Token Symbol</label>
                <TextField variant="filled" InputProps={{ disableUnderline: true }} />
            </div>
            <div className={classes.item}>
                <label className={classes.title}>Decimals of Precision</label>
                <TextField variant="filled" InputProps={{ disableUnderline: true }} />
            </div>
        </form>
    )
})

export const AddTokenConfirmUI = memo(() => {
    return <div>confirm</div>
})
