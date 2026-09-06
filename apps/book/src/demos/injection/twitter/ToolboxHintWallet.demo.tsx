import { useState } from 'react'
import { Avatar, FormControlLabel, Stack, Switch } from '@mui/material'
import { Icons } from '@masknet/icons'
import { ToolboxHint } from '@masknet/injected-ui/ToolboxHint'

export const meta = {
    title: 'ToolboxHintWallet',
    description:
        'The connected-wallet entry injected into the sidebar/toolbox on X/Twitter — the wallet slot of the same ToolboxHint component (packages/injected-ui/src/ToolboxHint.tsx). Needs live chain state in production; the icon/title/chain-indicator here are just mocked for the demo.',
}

export default function ToolboxHintWalletTwitterDemo() {
    const [connected, setConnected] = useState(false)
    const [wrongNetwork, setWrongNetwork] = useState(false)
    const [clicked, setClicked] = useState(0)

    return (
        <Stack spacing={2} sx={{ alignItems: 'flex-start', maxWidth: 280 }}>
            <FormControlLabel
                control={<Switch checked={connected} onChange={(_, checked) => setConnected(checked)} />}
                label="Wallet connected"
            />
            <FormControlLabel
                control={<Switch checked={wrongNetwork} onChange={(_, checked) => setWrongNetwork(checked)} />}
                label="Wrong network (shows the chain indicator dot)"
                disabled={!connected}
            />
            <div>Clicked {clicked} time(s)</div>
            <ToolboxHint
                onClick={() => setClicked((c) => c + 1)}
                icon={connected ? <Avatar sx={{ width: 24, height: 24 }}>W</Avatar> : <Icons.Wallet size={24} />}
                title={connected ? '0x1234…5678' : 'Connect Wallet'}
                extra={
                    wrongNetwork && connected ?
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'red' }} />
                    :   null
                }
            />
        </Stack>
    )
}
