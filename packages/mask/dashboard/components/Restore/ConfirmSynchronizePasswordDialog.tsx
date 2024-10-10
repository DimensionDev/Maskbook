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
                            <Trans>Success</Trans>
                        </Typography>
                    </Stack>
                    <Typography variant="caption">
                        <Trans>
                            You have verified your cloud password and recovered your backup. Do you want to let your
                            cloud password and local backup password be the same?
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
