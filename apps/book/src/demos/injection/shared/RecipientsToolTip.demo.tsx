import { Stack } from '@mui/material'
import { ProfileIdentifier, type ProfileInformation } from '@masknet/shared-base'
import { RecipientsToolTip } from '@masknet/injected-ui/RecipientsToolTip'

export const meta = {
    title: 'RecipientsToolTip',
    description:
        'The stacked-avatars indicator shown on a decrypted post that was shared with a specific set of recipients, opening the recipient list on click (packages/injected-ui/src/RecipientsToolTip.tsx).',
}

function makeRecipient(userId: string): ProfileInformation {
    return { identifier: ProfileIdentifier.of('twitter.com', userId).unwrap() }
}

const FEW_RECIPIENTS = [makeRecipient('alice'), makeRecipient('bob')]
const MANY_RECIPIENTS = [makeRecipient('alice'), makeRecipient('bob'), makeRecipient('carol'), makeRecipient('dave')]

export default function RecipientsToolTipDemo() {
    return (
        <Stack direction="row" spacing={4} sx={{ alignItems: 'center' }}>
            <RecipientsToolTip recipients={FEW_RECIPIENTS} openDialog={() => alert('open recipient list')} />
            <RecipientsToolTip recipients={MANY_RECIPIENTS} openDialog={() => alert('open recipient list')} />
        </Stack>
    )
}
