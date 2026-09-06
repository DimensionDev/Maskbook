import { useState } from 'react'
import { Button, Stack, Typography } from '@mui/material'
import { SetupGuideStep } from '@masknet/shared-base'
import { WizardDialog } from '@masknet/injected-ui/WizardDialog'

export const meta = {
    title: 'WizardDialog',
    description:
        "The floating card frame used by the setup guide's wizard steps (packages/injected-ui/src/WizardDialog.tsx). PinExtension is the only step implemented today; content/tip/footer are supplied by the caller.",
}

export default function WizardDialogDemo() {
    const [open, setOpen] = useState(true)

    return (
        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Button variant="outlined" onClick={() => setOpen(true)} disabled={open}>
                Reopen
            </Button>
            {open ?
                <WizardDialog
                    dialogType={SetupGuideStep.PinExtension}
                    title="Setup Mask Network"
                    content={<Typography>Wizard step content goes here.</Typography>}
                    tip={<Typography variant="body2">A tip about this step.</Typography>}
                    footer={<Button variant="contained">Continue</Button>}
                    onClose={() => setOpen(false)}
                />
            :   null}
        </Stack>
    )
}
