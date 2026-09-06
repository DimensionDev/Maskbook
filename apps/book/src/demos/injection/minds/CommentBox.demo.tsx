import { useState } from 'react'
import { Stack } from '@mui/material'
import { CommentBox } from '@masknet/injected-ui/CommentBox'
import { EnhanceableSite } from '@masknet/shared-base'

export const meta = {
    title: 'CommentBox',
    description:
        'The encrypted-comment input injected under a post on Minds (packages/injected-ui/src/CommentBox.tsx) - narrower (96%) than the Twitter/Facebook variant via the site prop.',
}

export default function CommentBoxMindsDemo() {
    const [submitted, setSubmitted] = useState<string[]>([])

    return (
        <Stack spacing={2} sx={{ maxWidth: 400, background: '#000', p: 2, borderRadius: 1 }}>
            <CommentBox
                site={EnhanceableSite.Minds}
                placeholder="Add an encrypted comment..."
                onSubmit={(value) => setSubmitted((s) => [...s, value])}
            />
            {submitted.map((s, i) => (
                <div key={i} style={{ color: '#e4e6eb' }}>
                    Submitted: {s}
                </div>
            ))}
        </Stack>
    )
}
