import { regexMatch, downloadUrl } from '../../../utils/utils'
import { notNullable } from '../../../utils/assert'
import { defaultTo } from 'lodash-es'
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
        handle: r[3].replace(/\n+/g, ''),
    }
}

const parsePid = (t: string) => {
    return regexMatch(t, /status\/(\d+)/, 1)!
}

export const bioCardParser = (cardNode: HTMLDivElement) => {
    if (cardNode.classList.contains('profile')) {
        const avatarElement = cardNode.querySelector<HTMLImageElement>('.avatar img')
        const { name, handle } = parseNameArea(
            [
                notNullable(cardNode.querySelector<HTMLTableCellElement>('.user-info .fullname')).innerText,
                notNullable(cardNode.querySelector<HTMLTableCellElement>('.user-info .screen-name')).innerText,
            ].join('@'),
        )
        const bio = notNullable(cardNode.querySelector('.details') as HTMLTableCellElement).innerText
        const isFollower = !!cardNode.querySelector<HTMLSpanElement>('.follows-you')
        const isFollowing =
            notNullable(cardNode.querySelector<HTMLFormElement>('.profile-actions form')).action.indexOf('unfollow') >
            -1
        return {
            avatar: avatarElement ? avatarElement.src : undefined,
            name,
            handle,
            identifier: new PersonIdentifier(twitterUrl.hostIdentifier, handle),
            bio,
            isFollower,
            isFollowing,
        }
    } else {
        const avatarElement = cardNode.querySelector<HTMLImageElement>('img')
        const { name, handle } = parseNameArea(notNullable(cardNode.children[1] as HTMLDivElement).innerText)
        const bio = notNullable(cardNode.children[2] as HTMLDivElement).innerHTML
        const isFollower = !!nthChild(cardNode, 1, 0, 0, 1, 1, 0)
        const isFollowing = !!cardNode.querySelector('[data-testid*="unfollow"]')
        return {
            avatar: avatarElement ? avatarElement.src : undefined,
            name,
            handle,
            identifier: new PersonIdentifier(twitterUrl.hostIdentifier, handle),
            bio,
            isFollower,
            isFollowing,
        }
    }
}

export const postContentParser = (node: HTMLElement) => {
    if (node.classList.contains('tweet') || node.classList.contains('main-tweet')) {
        const containerNode = node.querySelector('.tweet-text > div')
        if (!containerNode) {
            return ''
        }
        return Array.from(containerNode.childNodes)
            .map(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    return node.nodeValue
                }
                if (node.nodeName === 'A') {
                    return (node as HTMLAnchorElement).getAttribute('title')
                }
                return ''
            })
            .join(',')
    } else {
        const select = <T extends HTMLElement>(selectors: string) =>
            Array.from(node.parentElement!.querySelectorAll<T>(selectors))
        const sto = [
            ...select<HTMLAnchorElement>('a').map(x => x.title),
            ...select<HTMLSpanElement>('[lang] > span').map(x => x.innerText),
        ]
        return sto.filter(Boolean).join(',')
    }
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
    if (node.classList.contains('tweet') || node.classList.contains('main-tweet')) {
        const { name, handle } = parseNameArea(
            notNullable(node.querySelector<HTMLTableCellElement>('.user-info')).innerText,
        )
        const avatarElement = node.querySelector<HTMLImageElement>('.avatar img')
        const pidLocation = node.querySelector<HTMLAnchorElement>('.tweet-text')
        return {
            name,
            handle,
            pid: pidLocation ? pidLocation.getAttribute('data-id') : undefined,
            avatar: avatarElement ? avatarElement.src : undefined,
            content: postContentParser(node),
        }
    } else {
        const { name, handle } = parseNameArea(
            notNullable(node.children[1].querySelector<HTMLAnchorElement>('a')).innerText,
        )
        const avatarElement = node.children[0].querySelector<HTMLImageElement>(`img[src*="twimg.com"]`)
        const pidLocation = defaultTo(
            node.children[1].querySelector<HTMLAnchorElement>('a[href*="status"]'),
            node.parentElement!.querySelector<HTMLAnchorElement>('a[href*="status"]'),
        )
        return {
            name,
            handle,
            // pid may not available at promoted tweet
            pid: pidLocation ? parsePid(pidLocation.href) : undefined,
            avatar: avatarElement ? avatarElement.src : undefined,
            content: postContentParser(node),
        }
    }
}
