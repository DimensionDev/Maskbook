import { Stack } from '@mui/material'
import { Icons } from '@masknet/icons'
import { EnhanceableSite } from '@masknet/shared-base'
import { ConnectSocialAccounts } from '@masknet/injected-ui/ConnectSocialAccounts'

export const meta = {
    title: 'ConnectSocialAccounts',
    description:
        'The grid of connectable social platforms shown in the popups "Connect Social Account" flow (packages/injected-ui/src/ConnectSocialAccounts.tsx). The container resolves each network to an icon/name before passing it down, so this stays free of the @masknet/shared icon-mapping constant.',
}

const NETWORKS = [
    { networkIdentifier: EnhanceableSite.Twitter, icon: <Icons.TwitterXRound size={24} />, name: 'Twitter' },
    { networkIdentifier: EnhanceableSite.Facebook, icon: <Icons.FacebookRound size={24} />, name: 'Facebook' },
    { networkIdentifier: EnhanceableSite.Minds, icon: <Icons.MindsRound size={24} />, name: 'Minds' },
    { networkIdentifier: EnhanceableSite.Instagram, icon: <Icons.InstagramRoundColored size={24} />, name: 'Instagram' },
]

export default function ConnectSocialAccountsDemo() {
    return (
        <Stack sx={{ maxWidth: 320 }}>
            <ConnectSocialAccounts networks={NETWORKS} onConnect={(site) => alert(`connect to ${site}`)} />
        </Stack>
    )
}
