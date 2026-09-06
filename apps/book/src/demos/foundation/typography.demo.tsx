import { Stack, Typography } from '@mui/material'

export const meta = {
    title: 'Typography',
    description: 'MUI Typography variants rendered with the Mask theme.',
}

const variants = [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'subtitle1',
    'subtitle2',
    'body1',
    'body2',
    'button',
    'caption',
    'overline',
] as const

export default function TypographyDemo() {
    return (
        <Stack spacing={1.5}>
            {variants.map((variant) => (
                <Typography key={variant} variant={variant}>
                    {variant} — The quick brown fox jumps over the lazy dog
                </Typography>
            ))}
        </Stack>
    )
}
