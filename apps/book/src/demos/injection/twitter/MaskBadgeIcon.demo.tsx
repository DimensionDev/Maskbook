import { Stack, Typography } from '@mui/material'
import { MaskBadgeIcon } from '@masknet/injected-ui/MaskBadgeIcon'

export const meta = {
    title: 'MaskBadgeIcon',
    description:
        'Marks a linked account as Mask-enabled next to its name on X/Twitter — profile, floating bio card, and posts (packages/injected-ui/src/MaskBadgeIcon.tsx).',
}

export default function MaskBadgeIconDemo() {
    return (
        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography sx={{ fontWeight: 700 }}>Vitalik Buterin</Typography>
                <MaskBadgeIcon size={24} />
                <Typography variant="caption" color="text.secondary">
                    size 24 (profile)
                </Typography>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography sx={{ fontWeight: 700 }}>Vitalik Buterin</Typography>
                <MaskBadgeIcon size={20} />
                <Typography variant="caption" color="text.secondary">
                    size 20 (floating bio)
                </Typography>
            </Stack>
        </Stack>
    )
}
