import { Button, Dialog, DialogActions, DialogContent, DialogContentText, Box } from '@material-ui/core'
import { MaskDialogTitle } from '../src/Components/Dialogs/DialogTitle'
export interface DialogExampleProps {
    withExit: boolean
    withBack: boolean
    withLeftAction: boolean
}
const f = () => {}
export function DialogExample(props: DialogExampleProps) {
    const { withBack, withExit, withLeftAction } = props
    return (
        <Dialog open>
            <MaskDialogTitle onBack={withBack ? f : void 0} onClose={withExit ? f : void 0}>
                Modal-S
            </MaskDialogTitle>
            <DialogContent>
                <DialogContentText>Text</DialogContentText>
            </DialogContent>
            <DialogActions>
                {withLeftAction ? (
                    <>
                        <Button variant="text">Left action</Button>
                        <Box sx={{ flex: 1 }} />
                    </>
                ) : null}
                <Button color="secondary">Cancel</Button>
                <Button>Confirm</Button>
            </DialogActions>
        </Dialog>
    )
}
