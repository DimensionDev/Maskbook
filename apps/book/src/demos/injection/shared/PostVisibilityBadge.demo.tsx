import { useState } from 'react'
import { Stack } from '@mui/material'
import { PostVisibilityBadge } from '@masknet/injected-ui/PostVisibilityBadge'

export const meta = {
    title: 'PostVisibilityBadge',
    description:
        "The pill shown on a decrypted post indicating who else it's visible to (packages/injected-ui/src/PostVisibilityBadge.tsx). The 'onlyYou' variant is clickable to open the recipient picker; once recipients are selected the container swaps it for RecipientsToolTip instead.",
}

export default function PostVisibilityBadgeDemo() {
    const [clicked, setClicked] = useState(0)

    return (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <PostVisibilityBadge
                variant="onlyYou"
                label="Only visible to yourself"
                onClick={() => setClicked((c) => c + 1)}
            />
            <PostVisibilityBadge variant="everyone" label="All Mask Network users" />
            <div>Clicked {clicked} time(s)</div>
        </Stack>
    )
}
