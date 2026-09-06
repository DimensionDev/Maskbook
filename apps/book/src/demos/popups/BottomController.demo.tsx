import { useState } from 'react'
import { Button, Stack, Typography } from '@mui/material'
import { BottomController } from '../../../../../packages/mask/popups/components/BottomController/index.js'

export const meta = {
    title: 'BottomController',
    description:
        'Fixed action bar docked to the bottom of a popups page (packages/mask/popups/components/BottomController). Note: it renders `position: fixed` to the viewport — in the real extension that viewport is the ~400px popup window, so it docks to the bottom of this page here instead.',
}

export default function BottomControllerDemo() {
    const [clicked, setClicked] = useState<string>()

    return (
        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Typography variant="body2" color="text.secondary">
                {clicked ? `Clicked "${clicked}"` : 'Scroll down — the bar is docked to the bottom of this page.'}
            </Typography>
            <BottomController>
                <Button fullWidth variant="outlined" onClick={() => setClicked('Cancel')}>
                    Cancel
                </Button>
                <Button fullWidth variant="contained" onClick={() => setClicked('Confirm')}>
                    Confirm
                </Button>
            </BottomController>
        </Stack>
    )
}
