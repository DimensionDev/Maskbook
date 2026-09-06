import { useState } from 'react'
import { Avatar, Stack } from '@mui/material'
import { ToolboxHint } from '@masknet/injected-ui/ToolboxHint'

export const meta = {
    title: 'ToolboxHintWallet',
    description:
        'The connected-wallet entry injected into the left rail on Facebook — the wallet slot of the same ToolboxHint component (packages/injected-ui/src/ToolboxHint.tsx).',
}

export default function ToolboxHintWalletFacebookDemo() {
    const [clicked, setClicked] = useState(0)

    return (
        <Stack spacing={2} sx={{ alignItems: 'flex-start', maxWidth: 280 }}>
            <div>Clicked {clicked} time(s)</div>
            <ToolboxHint
                iconSize={32}
                onClick={() => setClicked((c) => c + 1)}
                icon={<Avatar sx={{ width: 32, height: 32 }}>W</Avatar>}
                title="0x1234…5678"
            />
        </Stack>
    )
}
