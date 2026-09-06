import { useState } from 'react'
import { MenuItem, Select, Stack } from '@mui/material'
import { AccountConnectStatus } from '@masknet/injected-ui/AccountConnectStatus'

export const meta = {
    title: 'AccountConnectStatus',
    description:
        "The status message shown inside the setup guide's \"connect persona\" step, after creating a persona and verifying the linked social account (packages/injected-ui/src/AccountConnectStatus.tsx). The container wraps this in BindingDialog chrome and handles the loading state - only the state-dependent message is shown here.",
}

type Scenario = 'first-connection' | 'first-connection-twitter' | 'connected' | 'wrong-account' | 'not-signed-in'

const SCENARIOS: Record<Scenario, string> = {
    'first-connection': 'First connection (non-Twitter)',
    'first-connection-twitter': 'First connection (Twitter verification post)',
    connected: 'Already connected',
    'wrong-account': 'Signed in as a different account',
    'not-signed-in': 'Not signed in',
}

export default function AccountConnectStatusDemo() {
    const [scenario, setScenario] = useState<Scenario>('first-connection')
    const [doneClicked, setDoneClicked] = useState(0)

    const props = (() => {
        switch (scenario) {
            case 'first-connection':
                return { isFirstConnection: true, isTwitterPage: false, expectAccount: 'alice' }
            case 'first-connection-twitter':
                return { isFirstConnection: true, isTwitterPage: true, expectAccount: 'alice' }
            case 'connected':
                return { connected: true, currentUserId: 'alice', expectAccount: 'alice' }
            case 'wrong-account':
                return { currentUserId: 'bob', expectAccount: 'alice' }
            case 'not-signed-in':
                return { expectAccount: 'alice' }
        }
    })()

    return (
        <Stack spacing={2} sx={{ alignItems: 'flex-start', maxWidth: 320 }}>
            <Select value={scenario} onChange={(e) => setScenario(e.target.value as Scenario)} size="small" fullWidth>
                {Object.entries(SCENARIOS).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                        {label}
                    </MenuItem>
                ))}
            </Select>
            <div>Done clicked {doneClicked} time(s)</div>
            <Stack sx={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: 2, p: 2, width: '100%' }}>
                <AccountConnectStatus
                    siteName="Twitter"
                    {...props}
                    onDone={() => setDoneClicked((c) => c + 1)}
                />
            </Stack>
        </Stack>
    )
}
