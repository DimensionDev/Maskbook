import { MaskDialog } from '@masknet/theme'
import { Box, Checkbox, DialogContent, FormControlLabel } from '@mui/material'
import { useState } from 'react'
import SetupTutorial from '../../../assets/images/SetupTutorial.svg'
import { useDashboardI18N } from '../../../locales'

export interface TutorialDialogProps {
    open: boolean
    onClose(checked: boolean): void
}

export default function TutorialDialog({ open, onClose }: TutorialDialogProps) {
    const t = useDashboardI18N()
    const [checked, setChecked] = useState(true)

    return (
        <MaskDialog maxWidth="lg" title={t.labs_setup_tutorial()} open={open} onClose={() => onClose(checked)}>
            <DialogContent>
                <Box width={800}>
                    <SetupTutorial />
                    <FormControlLabel
                        control={<Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />}
                        label={t.labs_do_not_show_again()}
                        sx={{ marginTop: '8px' }}
                    />
                </Box>
            </DialogContent>
        </MaskDialog>
    )
}
