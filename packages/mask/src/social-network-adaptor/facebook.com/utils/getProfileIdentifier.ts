import { ProfileIdentifier, EnhanceableSite } from '@masknet/shared-base'
import Services from '../../../extension/service.js'
import { getCurrentIdentifier } from '../../utils.js'
import { searchUserIdOnMobileSelector } from './selector.js'
import type { IdentityResolved } from '@masknet/plugin-infra'

type link = HTMLAnchorElement | null | undefined

/**
 *
 * @param allowCollectInfo
 * @param links
 *  Could be a group of anchor element. Seems like this:
 *  [
 *      <a class="_2nlw _2nlv" href="https://www.facebook.com/xxx">
 *          [USERNAME HERE]
 *          <span class="alternate_name">
 *              ([USER SCREEN NAME HERE])
 *          </span>
 *      </a>
 *  ]
 */
export function getProfileIdentifierAtFacebook(links: link[] | link, allowCollectInfo?: boolean): IdentityResolved {
    const unknown: IdentityResolved = {}
    try {
        if (!Array.isArray(links)) links = [links]
        const result = links
            .filter((x) => x)
            .map((x) => ({ nickname: x!.ariaLabel, id: getUserID(x!.href), dom: x }))
            .filter((x) => x.id)
        const { dom, id, nickname } = result[0] || {}
        const identifier = ProfileIdentifier.of(EnhanceableSite.Facebook, id).unwrapOr(null)
        if (identifier) {
            const currentProfile = getCurrentIdentifier()
            let avatar: string | null = null
            try {
                const image = dom!.closest('.clearfix')!.parentElement!.querySelector('img')!
                avatar = image.src
                if (allowCollectInfo && image.getAttribute('aria-label') === nickname && nickname) {
                    Services.Identity.updateProfileInfo(identifier, { nickname, avatarURL: image.src })
                    if (currentProfile?.linkedPersona) {
                        Services.Identity.createNewRelation(identifier, currentProfile.linkedPersona)
                    }
                }
            } catch {}
            try {
                const image = dom!.querySelector('img')!
                avatar = image.src
                if (allowCollectInfo && avatar) {
                    Services.Identity.updateProfileInfo(identifier, { nickname, avatarURL: image.src })
                    if (currentProfile?.linkedPersona) {
                        Services.Identity.createNewRelation(identifier, currentProfile.linkedPersona)
                    }
                }
            } catch {}
            try {
                const image = dom!.querySelector('image')!
                avatar = image.getAttribute('xlink:href')
                if (allowCollectInfo && avatar) {
                    Services.Identity.updateProfileInfo(identifier, { nickname, avatarURL: avatar })
                    if (currentProfile?.linkedPersona) {
                        Services.Identity.createNewRelation(identifier, currentProfile.linkedPersona)
                    }
                }
            } catch {}
            return {
                identifier,
                avatar: avatar ?? undefined,
                nickname: nickname ?? undefined,
            }
        }
        return unknown
    } catch (error) {
        console.error(error)
    }
    return unknown
}
export function getUserID(x: string) {
    if (!x) return null
    const relative = !x.startsWith('https://') && !x.startsWith('http://')
    const url = relative ? new URL(x, location.host) : new URL(x)

    if (url.hostname !== 'www.facebook.com' && url.hostname !== 'm.facebook.com') return null

    // Get the userId from the meta element
    if (url.hostname === 'm.facebook.com') {
        const node = searchUserIdOnMobileSelector().evaluate()
        if (!node) return null

        const href = node.getAttribute('href')

        if (!href) return null

        const match = href.match(/lst=(\w+)/)
        if (!match) return null

        return match[1]
    }
    if (url.pathname.endsWith('.php')) {
        if (!url.search) return null
        const search = new URLSearchParams(url.search)
        return search.get('id')
    }
    const val = url.pathname.replace(/^\//, '').replace(/\/$/, '').split('/')[0]
    if (val === 'me') return null
    return val
}
