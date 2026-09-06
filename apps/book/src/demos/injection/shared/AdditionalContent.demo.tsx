import { useState } from 'react'
import { MenuItem, Select, Stack } from '@mui/material'
import { AdditionalContent } from '@masknet/injected-ui/AdditionalContent'

export const meta = {
    title: 'AdditionalContent',
    description:
        'The card injected above a post for its Mask-related status: decrypting in progress, decryption failed, or (in production, via a container that pre-renders the message) the decrypted content itself (packages/injected-ui/src/AdditionalContent.tsx).',
}

type Scenario = 'progress' | 'error' | 'success'

const SCENARIOS: Record<Scenario, string> = {
    progress: 'Decrypting...',
    error: 'Decryption failed',
    success: 'Decrypted content',
}

export default function AdditionalContentDemo() {
    const [scenario, setScenario] = useState<Scenario>('progress')

    return (
        <Stack spacing={2} sx={{ alignItems: 'flex-start', maxWidth: 400 }}>
            <Select value={scenario} onChange={(e) => setScenario(e.target.value as Scenario)} size="small" fullWidth>
                {Object.entries(SCENARIOS).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                        {label}
                    </MenuItem>
                ))}
            </Select>
            {scenario === 'progress' && <AdditionalContent title="Mask is decrypting..." progress />}
            {scenario === 'error' && (
                <AdditionalContent title="Failed to decrypt." titleIcon="error" message="Payload is corrupted." />
            )}
            {scenario === 'success' && (
                <AdditionalContent title="Decrypted by Mask Network" message="Hello Mask world!" />
            )}
        </Stack>
    )
}
