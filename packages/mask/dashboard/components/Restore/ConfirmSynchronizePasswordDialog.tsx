import { memo } from 'react'
import { Icons } from '@masknet/icons'
import { getMaskColor, MaskDialog } from '@masknet/theme'
import { Button, DialogActions, DialogContent, Stack, Typography } from '@mui/material'
import { Trans } from '@lingui/macro'

interface ConfirmSynchronizePasswordDialogProps {
    open: boolean
    onClose(): void
    onConform(): void
}

export const ConfirmSynchronizePasswordDialog = memo<ConfirmSynchronizePasswordDialogProps>(
    function ConfirmSynchronizePasswordDialog({ open, onClose, onConform }) {
        return (
            <MaskDialog open={open} title={<Trans>Cloud Backup</Trans>} onClose={onClose} maxWidth="xs">
                <DialogContent>
                    <Stack alignItems="center" py={2}>
                        <Icons.Success size={54} />
                        <Typography variant="caption" sx={{ color: (t) => getMaskColor(t).greenMain }} fontSize={24}>
                            <Trans>Successful</Trans>
                        </Typography>
                    </Stack>
                    <Typography variant="caption">
                        <Trans>
                            You have successfully verified your cloud password and recovered your backup. To unify
                            backup passwords, do you want to synchronize your cloud password as local backup password?
                        </Trans>
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button color="secondary" onClick={onClose}>
                        <Trans>Cancel</Trans>
                    </Button>
                    <Button onClick={onConform}>
                        <Trans>Confirm</Trans>
                    </Button>
                </DialogActions>
            </MaskDialog>
        )
    },
)
