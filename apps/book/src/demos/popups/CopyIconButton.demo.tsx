import { Stack, Typography } from '@mui/material'
import { CopyIconButton } from '@masknet/injected-ui/CopyIconButton'

export const meta = {
    title: 'CopyIconButton',
    description:
        "A copy-to-clipboard icon button, forked from @masknet/shared's CopyButton without the Trans default tooltips so it doesn't pull @masknet/shared's barrel into injected-ui (packages/injected-ui/src/CopyIconButton.tsx). Click it to see the tooltip switch to \"Copied!\".",
}

export default function CopyIconButtonDemo() {
    return (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography>0x1234567890abcdef</Typography>
            <CopyIconButton text="0x1234567890abcdef" size={16} />
        </Stack>
    )
}
