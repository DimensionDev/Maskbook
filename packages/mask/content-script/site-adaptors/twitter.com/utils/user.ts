import { ProfileIdentifier, type SocialIdentity } from '@masknet/shared-base'
import { queryClient } from '@masknet/shared-base-ui'
import { FireflyTwitter } from '@masknet/web3-providers'
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

export async function getUserIdentity(screenName: string): Promise<SocialIdentity | undefined> {
    const user = await queryClient.fetchQuery({
        queryKey: ['twitter', 'profile', screenName],
        queryFn: () => FireflyTwitter.getUserInfo(screenName),
        retry: 0,
        staleTime: 3600_000,
    })
    if (!user) return

    const legacy = user.legacy
    return {
        identifier: ProfileIdentifier.of(twitterBase.networkIdentifier, screenName).unwrapOr(undefined),
        nickname: legacy.name,
        avatar: legacy.profile_image_url_https,
        bio: legacy.description,
        homepage: legacy.entities.url?.urls?.[0]?.expanded_url,
    }
}

export function getUserId(ele: HTMLElement) {
    return ele.querySelector('a[href][role=link]')?.getAttribute('href')?.slice(1)
}
