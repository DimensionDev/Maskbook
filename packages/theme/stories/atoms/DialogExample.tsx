import { Button, DialogActions, DialogContent, DialogContentText, Box } from '@mui/material'
import { MaskDialog } from '../../src/Components/Dialogs'
export interface DialogExampleProps {
    withExit: boolean
    withBack: boolean
    withLeftAction: boolean
}
const f = () => {}
export function DialogExample(props: DialogExampleProps) {
    const { withBack, withExit, withLeftAction } = props
    return (
        <MaskDialog title="Modal" onBack={withBack ? f : void 0} onClose={withExit ? f : void 0} open>
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
        </MaskDialog>
    )
}
