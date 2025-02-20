import { safeUnreachable } from '@masknet/kit'
import { EnhanceableSite, NextIDPlatform } from '@masknet/shared-base'
import { memo } from 'react'
import { Account } from '../ContactCard/Account/index.js'
import { SocialAccount } from '../ContactCard/SocialAccount/index.js'
import { Account as DetailAccount } from '../Detail/Account/index.js'
import { SocialAccount as DetailSocialAccount } from '../Detail/SocialAccount/index.js'
import type { Profile } from '../common.js'

interface AccountRenderProps {
    profile: Profile
    detail?: boolean
    avatar?: string
}

export const AccountRender = memo<AccountRenderProps>(function AccountRender({ profile, detail, avatar }) {
    switch (profile.platform) {
        case NextIDPlatform.Twitter:
        case EnhanceableSite.Twitter:
            return detail ?
                    <DetailSocialAccount
                        avatar={avatar}
                        userId={profile.name ?? profile.identity}
                        site={EnhanceableSite.Twitter}
                    />
                :   <SocialAccount
                        avatar={avatar}
                        userId={profile.name ?? profile.identity}
                        site={EnhanceableSite.Twitter}
                    />
        case NextIDPlatform.ENS:
        case NextIDPlatform.Ethereum:
        case NextIDPlatform.GitHub:
        case NextIDPlatform.SpaceId:
        case NextIDPlatform.LENS:
        case NextIDPlatform.Unstoppable:
        case NextIDPlatform.Farcaster:
        case NextIDPlatform.Keybase:
            const _userID =
                profile.platform === NextIDPlatform.ENS || profile.platform === NextIDPlatform.Keybase ?
                    profile.name
                :   profile.identity
            return detail ?
                    <DetailAccount userId={_userID} displayName={profile.name} platform={profile.platform} />
                :   <Account userId={_userID} displayName={profile.name} platform={profile.platform} />
        case NextIDPlatform.CyberConnect:
        case NextIDPlatform.Bit:
        case NextIDPlatform.SYBIL:
        case NextIDPlatform.EthLeaderboard:
        case NextIDPlatform.REDDIT:
        case NextIDPlatform.RSS3:
        case NextIDPlatform.NextID:
            return null
        case EnhanceableSite.Facebook:
            return detail ?
                    <DetailSocialAccount
                        avatar={avatar}
                        userId={profile.name ?? profile.identity}
                        site={EnhanceableSite.Facebook}
                    />
                :   <SocialAccount
                        avatar={avatar}
                        userId={profile.name ?? profile.identity}
                        site={EnhanceableSite.Facebook}
                    />
        case EnhanceableSite.Instagram:
            return detail ?
                    <DetailSocialAccount
                        avatar={avatar}
                        userId={profile.name ?? profile.identity}
                        site={EnhanceableSite.Instagram}
                    />
                :   <SocialAccount
                        avatar={avatar}
                        userId={profile.name ?? profile.identity}
                        site={EnhanceableSite.Instagram}
                    />
        default:
            safeUnreachable(profile.platform)
            return null
    }
})
