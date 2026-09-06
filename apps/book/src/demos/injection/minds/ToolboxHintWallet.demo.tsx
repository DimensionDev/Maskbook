import { useState } from 'react'
import { Stack } from '@mui/material'
import { Icons } from '@masknet/icons'
import { ToolboxHint } from '@masknet/injected-ui/ToolboxHint'

export const meta = {
    title: 'ToolboxHintWallet',
    description:
        'The connected-wallet entry injected into the sidebar on Minds — the wallet slot of the same ToolboxHint component (packages/injected-ui/src/ToolboxHint.tsx), shown in its compact ("mini") form.',
}

export default function ToolboxHintWalletMindsDemo() {
    const [clicked, setClicked] = useState(0)

    return (
        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <div>Clicked {clicked} time(s)</div>
            <ToolboxHint mini onClick={() => setClicked((c) => c + 1)} icon={<Icons.Wallet size={24} />} />
        </Stack>
    )
}
