import { Icons } from '@masknet/icons'
import { Link, Stack, Typography } from '@mui/material'
import { memo } from 'react'

export interface ProvidedByProps {
    providerName: string
    providerLink?: string
}

export const ProvidedBy = memo<ProvidedByProps>(({ providerLink, providerName }) => {
    return (
        <Stack direction="row" sx={{ display: 'inline-flex', gap: 0.25, alignItems: 'center' }}>
            <Typography
                variant="h6"
                sx={{ fontSize: '14px', fontWeight: '400', color: (t) => t.palette.text.secondary }}>
                Provided by
            </Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{providerName}</Typography>
            {providerLink ?
                <Link
                    href={providerLink}
                    underline="none"
                    target="_blank"
                    rel="noopener"
                    sx={{ display: 'inline-flex' }}>
                    <Icons.LinkOut size={16} color="#6E767D" />
                </Link>
            :   null}
        </Stack>
    )
})
