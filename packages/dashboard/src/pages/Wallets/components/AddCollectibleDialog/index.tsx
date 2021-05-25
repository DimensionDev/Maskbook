import React, { memo } from 'react'
import { MaskColorVar, MaskDialog } from '@dimensiondev/maskbook-theme'
import { Box, DialogContent, makeStyles, TextField } from '@material-ui/core'

export interface AddCollectibleDialogProps {
    open: boolean
    onClose: () => void
}

const useStyles = makeStyles((theme) => ({
    title: {
        fontSize: theme.typography.pxToRem(12),
        color: MaskColorVar.textPrimary,
    },
}))

export const AddCollectibleDialog = memo<AddCollectibleDialogProps>(({ open, onClose }) => {
    const classes = useStyles()
    return (
        <MaskDialog open={open} title="Add Collectible">
            <DialogContent>
                <form>
                    <Box style={{ display: 'flex', flexDirection: 'column' }}>
                        <label className={classes.title}>Collectible Address</label>
                        <TextField variant="filled" InputProps={{ disableUnderline: true }} />
                    </Box>
                </form>
            </DialogContent>
        </MaskDialog>
    )
})
