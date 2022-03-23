import { MaskDialog } from '../../../../theme/src/Components'

interface TestDialogProps {
    open: boolean
    onClose: () => void
}

const TestDialog: React.FC<TestDialogProps> = (props) => {
    return (
        <MaskDialog open={props.open} title="test" onClose={props.onClose}>
            sss
        </MaskDialog>
    )
}

export default TestDialog
