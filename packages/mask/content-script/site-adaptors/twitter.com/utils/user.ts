import { ProfileIdentifier, type SocialIdentity } from '@masknet/shared-base'
import { queryClient } from '@masknet/shared-base-ui'
import { Twitter } from '@masknet/web3-providers'
import { isNull } from 'lodash-es'
import { twitterBase } from '../base.js'

/**
 * @link https://help.x.com/en/managing-your-account/twitter-username-rules
 */
export function usernameValidator(name: string) {
    for (const v of [/(twitter|admin)/i, /.{16,}/, /\W/]) {
        if (!isNull(v.exec(name))) {
            return false
        }
    }
    if (name.length < 4) return false
    return true
}

export async function getUserIdentity(twitterId: string): Promise<SocialIdentity | undefined> {
    twitterId = twitterId.toLowerCase()
    const user = await queryClient.fetchQuery({
        queryKey: ['twitter', 'profile', twitterId],
        queryFn: () => Twitter.getUserByScreenName(twitterId),
        retry: 0,
        staleTime: 3600_000,
    })
    if (!user) return

    return {
        identifier: ProfileIdentifier.of(twitterBase.networkIdentifier, user.screenName).unwrapOr(undefined),
        nickname: user.nickname,
        avatar: user.avatarURL,
        bio: user.bio,
        homepage: user.homepage,
    }
}

export function getUserId(ele: HTMLElement) {
    return ele.querySelector('a[href][role=link]')?.getAttribute('href')?.slice(1)
}
