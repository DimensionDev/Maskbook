import { useState } from 'react'
import { Button, Stack } from '@mui/material'
import { PinExtension } from '@masknet/injected-ui/PinExtension'

export const meta = {
    title: 'PinExtension',
    description:
        'The "pin the extension" step of the cross-platform setup guide (packages/injected-ui/src/PinExtension.tsx), shown after a user creates their first persona. tip/startLabel are supplied by the caller so this stays translation-agnostic.',
}

export default function PinExtensionDemo() {
    const [open, setOpen] = useState(true)
    const [done, setDone] = useState(0)

    return (
        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Button variant="outlined" onClick={() => setOpen(true)} disabled={open}>
                Reopen
            </Button>
            <div>Done clicked {done} time(s)</div>
            {open ?
                <PinExtension
                    startLabel="Start"
                    tip={
                        <>
                            <div>Don't forget to pin Mask Network in the browser toolbar to access Web3 easily.</div>
                            <ol style={{ paddingLeft: '24px' }}>
                                <li>Click on the puzzle icon at the top-right of your browser.</li>
                                <li>Find Mask Network in the extension list and click the pin button.</li>
                                <li>Pinned successfully.</li>
                            </ol>
                        </>
                    }
                    onDone={() => setDone((c) => c + 1)}
                    onClose={() => setOpen(false)}
                />
            :   null}
        </Stack>
    )
}
