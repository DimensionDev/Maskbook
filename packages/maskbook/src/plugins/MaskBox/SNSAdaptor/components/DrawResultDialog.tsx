import { useCallback } from 'react'
import { makeStyles } from '@masknet/theme'
import { Box, DialogContent } from '@material-ui/core'
import { InjectedDialog } from '../../../../components/shared/InjectedDialog'
import ActionButton from '../../../../extension/options-page/DashboardComponents/ActionButton'

const useStyles = makeStyles()((theme) => ({
    main: {},
}))

export interface DrawResultDialogProps {
    open: boolean
    onClose: () => void
    tokenIds: string[]
    tokenContractAddress: string
}

export function DrawResultDialog(props: DrawResultDialogProps) {
    const { open, onClose } = props
    const { classes } = useStyles()
    const onShare = useCallback(() => {}, [])

    return (
        <InjectedDialog title="Draw Succeed" open={open} onClose={onClose}>
            <DialogContent>
                <Box className={classes.main}>
                    <ActionButton size="medium" fullWidth variant="contained" onClick={onShare}>
                        Share
                    </ActionButton>
                </Box>
            </DialogContent>
        </InjectedDialog>
    )
}
