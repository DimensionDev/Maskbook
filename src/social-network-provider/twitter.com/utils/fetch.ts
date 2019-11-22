import { bioCard } from './selector'
import { regexMatch, downloadUrl } from '../../../utils/utils'
import { notNullable } from '../../../utils/assert'
import { defaultTo, isUndefined, join } from 'lodash-es'
import { nthChild } from '../../../utils/dom'
import { PersonIdentifier } from '../../../database/type'
import { twitterUrl } from './url'
import Services from '../../../extension/service'
import { getActivatedUI } from '../../../social-network/ui'

/**
 * @example
 * parseNameArea("TheMirror\n(●'◡'●)@1\n@MisakaMirror")
 * >>> {
 *      name: "TheMirror(●'◡'●)@1",
 *      handle: "MisakaMirror"
 * }
 */
const parseNameArea = (t: string) => {
    const r = regexMatch(t, /((.+\s*)*)@(.+)/, null)!
    return {
        name: r[1].replace(/\n+/g, ''),
        handle: r[3],
    }
}

export const bioCardParser = () => {
    const avatar = notNullable(
        bioCard()
            .querySelector<HTMLImageElement>('img')
            .map(x => x.src)
            .evaluate(),
    )
    const nameArea = parseNameArea(
        notNullable(
            bioCard()
                .map(x => nthChild(x, 1)!.innerText)
                .evaluate(),
        ),
    )
    const bio = notNullable(
        bioCard()
            .map(x => nthChild(x, 2)!.innerHTML)
            .evaluate(),
    )
    const isFollower = !isUndefined(
        bioCard()
            .map(x => nthChild(x, 1, 0, 0, 1, 1, 0))
            .evaluate(),
    )
    const isFollowing = !isUndefined(
        bioCard()
            .querySelector('[data-testid*="unfollow"]')
            .evaluate(),
    )
    return {
        avatar,
        name: nameArea.name,
        handle: nameArea.handle,
        identifier: new PersonIdentifier(twitterUrl.hostIdentifier, nameArea.handle),
        bio,
        isFollower,
        isFollowing,
    }
}

export const postContentParser = (node: HTMLElement) => {
    const select = <T extends HTMLElement>(selectors: string) =>
        Array.from(node.parentElement!.querySelectorAll<T>(selectors))
    const sto = [
        ...select<HTMLAnchorElement>('a').map(x => x.title),
        ...select<HTMLSpanElement>('[lang] > span').map(x => x.innerText),
    ]
    return join(sto)
}

export const postImageParser = async (node: HTMLElement) => {
    const parent = node.parentElement
    if (!parent) return ''
    const imgNodes = node.parentElement!.querySelectorAll<HTMLImageElement>('img[src*="twimg.com/media"]')
    if (!imgNodes.length) return ''
    const imgUrls = Array.from(imgNodes).map(node => node.getAttribute('src') || '')
    if (!imgUrls.length) return ''
    const { currentIdentity } = getActivatedUI()
    const pass = currentIdentity.value ? currentIdentity.value.identifier.toText() : ''

    return (
        await Promise.all(
            imgUrls
                .map(async url => {
                    const image = new Uint8Array(await downloadUrl(url))
                    const content = await Services.Steganography.decodeImage(image, {
                        pass,
                    })
                    return /https:\/\/.+\..+\/%20(.+)%40/.test(content) ? content : ''
                })
                .filter(Boolean),
        )
    ).join('\n')
}

/**
 * @param  node     the '[data-testid="tweet"]' node
 * @return          link to avatar.
 */
export const postParser = async (node: HTMLElement) => {
    const nameArea = parseNameArea(notNullable(node.children[1].querySelector<HTMLAnchorElement>('a')).innerText)
    const avatarElement = node.children[0].querySelector<HTMLImageElement>(`img[src*="twimg.com"]`)
    const pidLocation = defaultTo(
        node.children[1].querySelector<HTMLAnchorElement>('a[href*="status"]'),
        node.parentElement!.querySelector<HTMLAnchorElement>('a[href*="status"]'),
    )
    return {
        name: nameArea.name,
        handle: nameArea.handle,
        // pid may not available at promoted tweet
        pid: pidLocation ? regexMatch(pidLocation!.href, /status\/(\d+)/, 1)! : undefined,
        avatar: avatarElement ? avatarElement.src : undefined,
        content: postContentParser(node) + (await postImageParser(node)),
    }
}
