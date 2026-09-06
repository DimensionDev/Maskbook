import { useState } from 'react'
import { Button, Typography } from '@mui/material'
import { BottomDrawer } from '../../../../../packages/mask/popups/components/BottomDrawer/index.js'

export const meta = {
    title: 'BottomDrawer',
    description:
        'The bottom sheet used for in-place pickers and confirmations in popups (packages/mask/popups/components/BottomDrawer).',
}

export default function BottomDrawerDemo() {
    const [open, setOpen] = useState(false)

    return (
        <>
            <Button variant="contained" onClick={() => setOpen(true)}>
                Open drawer
            </Button>
            <BottomDrawer open={open} onClose={() => setOpen(false)} title="Select a network">
                <Typography sx={{ padding: 2 }}>Drawer content goes here.</Typography>
            </BottomDrawer>
        </>
    )
}
