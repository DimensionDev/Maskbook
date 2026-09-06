import { useState } from 'react'
import { Button, Stack, Typography } from '@mui/material'
import { AutoPasteFailedDialog } from '@masknet/injected-ui/AutoPasteFailedDialog'

export const meta = {
    title: 'AutoPasteFailedDialog',
    description:
        "Fallback dialog shown when Mask can't auto-paste an encrypted comment/post into the page, so the user can copy/download it manually (packages/injected-ui/src/AutoPasteFailedDialog.tsx). Normally wrapped in a draggable overlay by the container.",
}

export default function AutoPasteFailedDialogDemo() {
    const [open, setOpen] = useState(true)
    const [lastDownload, setLastDownload] = useState<string>()

    return (
        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Button variant="outlined" onClick={() => setOpen(true)} disabled={open}>
                Reopen
            </Button>
            {lastDownload ?
                <Typography variant="body2">Would download as: {lastDownload}</Typography>
            :   null}
            {open ?
                <AutoPasteFailedDialog
                    data={{ text: 'Hello Mask world. This is my first encrypted message.' }}
                    onClose={() => setOpen(false)}
                    onDownload={(_url, fileName) => setLastDownload(fileName)}
                />
            :   null}
        </Stack>
    )
}
