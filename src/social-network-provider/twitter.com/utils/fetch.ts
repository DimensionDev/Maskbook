import { regexMatch } from '../../../utils/utils'
import { notNullable } from '../../../utils/assert'
import { defaultTo } from 'lodash-es'
import { nthChild } from '../../../utils/dom'
import { ProfileIdentifier } from '../../../database/type'
import { twitterUrl, canonifyImgUrl } from './url'
import Services from '../../../extension/service'

/**
 * @example
 * parseNameArea("TheMirror\n(●'◡'●)@1\n@MisakaMirror")
 * >>> {
 *      name: "TheMirror(●'◡'●)@1",
 *      handle: "MisakaMirror"
 * }
 */
const parseNameArea = (nameArea: string) => {
    const result = regexMatch(nameArea, /([^@]*)@(.+)/, null)

    if (!result) {
        return {
            name: '',
            handle: '',
        }
    }
    return {
        name: result[1].replace(/\n+/g, ''),
        handle: result[2].replace(/\n+/g, ''),
    }
}

const parseId = (t: string) => {
    return regexMatch(t, /status\/(\d+)/, 1)!
}

const isMobilePost = (node: HTMLElement) => {
    return node.classList.contains('tweet') ?? node.classList.contains('main-tweet')
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
            identifier: new ProfileIdentifier(twitterUrl.hostIdentifier, handle),
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
            identifier: new ProfileIdentifier(twitterUrl.hostIdentifier, handle),
            bio,
            isFollower,
            isFollowing,
        }
    }
}

export const postIdParser = (node: HTMLElement) => {
    if (isMobilePost(node)) {
        const idNode = node.querySelector<HTMLAnchorElement>('.tweet-text')
        return idNode ? idNode.getAttribute('data-id') ?? undefined : undefined
    } else {
        const idNode = defaultTo(
            node.children[1]?.querySelector<HTMLAnchorElement>('a[href*="status"]'),
            defaultTo(
                node.parentElement!.querySelector<HTMLAnchorElement>('a[href*="status"]'),
                node.closest('article > div')?.querySelector<HTMLAnchorElement>('a[href*="status"]'),
            ),
        )
        return idNode ? parseId(idNode.href) : parseId(location.href)
    }
}

export const postNameParser = (node: HTMLElement) => {
    if (isMobilePost(node)) {
        return parseNameArea(notNullable(node.querySelector<HTMLTableCellElement>('.user-info')).innerText)
    } else {
        const tweetElement = node.querySelector<HTMLElement>('[data-testid="tweet"]') ?? node
        const nameInUniqueAnchorTweet =
            tweetElement.children[1]?.querySelector<HTMLAnchorElement>('a[data-focusable="true"]')?.innerText ?? ''
        const nameInDoubleAnchorsTweet = Array.from(
            tweetElement.children[1]?.querySelectorAll<HTMLAnchorElement>('a[data-focusable="true"]') ?? [],
        )
            .map((a) => a.textContent)
            .join('')
        const nameInQuoteTweet = nthChild(tweetElement, 0, 0, 0)?.innerText

        return (
            [nameInUniqueAnchorTweet, nameInDoubleAnchorsTweet, nameInQuoteTweet]
                .filter(Boolean)
                .map((n) => parseNameArea(n!))
                .find((r) => r.name && r.handle) ?? {
                name: '',
                handle: '',
            }
        )
    }
}

export const postAvatarParser = (node: HTMLElement) => {
    if (isMobilePost(node)) {
        const avatarElement = node.querySelector<HTMLImageElement>('.avatar img')
        return avatarElement ? avatarElement.src : undefined
    } else {
        const tweetElement = node.querySelector('[data-testid="tweet"]') ?? node
        const avatarElement = tweetElement.children[0].querySelector<HTMLImageElement>(`img[src*="twimg.com"]`)
        return avatarElement ? avatarElement.src : undefined
    }
}

export const postContentParser = (node: HTMLElement) => {
    if (isMobilePost(node)) {
        const containerNode = node.querySelector('.tweet-text > div')
        if (!containerNode) {
            return ''
        }
        return Array.from(containerNode.childNodes)
            .map((node) => {
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
        const select = <T extends HTMLElement>(selectors: string) => {
            const lang = node.parentElement!.querySelector<HTMLDivElement>('[lang]')
            return lang ? Array.from(lang.querySelectorAll<T>(selectors)) : []
        }
        const sto = [
            ...select<HTMLAnchorElement>('a').map((x) => x.title),
            ...select<HTMLSpanElement>('span').map((x) => x.innerText),
        ]
        return sto.filter(Boolean).join(' ')
    }
}

export const postImageParser = async (node: HTMLElement) => {
    if (isMobilePost(node)) {
        // TODO: Support steganography in legacy twitter
        return ''
    } else {
        const isQuotedTweet = !!node.closest('[role="blockquote"]')
        const imgNodes = node.querySelectorAll<HTMLImageElement>('img[src*="twimg.com/media"]')
        if (!imgNodes.length) return ''
        const imgUrls = Array.from(imgNodes)
            .filter((node) => isQuotedTweet || !node.closest('[role="blockquote"]'))
            .flatMap((node) => canonifyImgUrl(node.getAttribute('src') ?? ''))
            .filter(Boolean)
        if (!imgUrls.length) return ''
        const { handle } = postNameParser(node)
        const posterIdentity = new ProfileIdentifier(twitterUrl.hostIdentifier, handle)
        return (
            await Promise.all(
                imgUrls.map(async (url) => {
                    try {
                        const content = await Services.Steganography.decodeImageUrl(url, {
                            pass: posterIdentity.toText(),
                        })
                        return /https:\/\/.+\..+\/%20(.+)%40/.test(content) ? content : ''
                    } catch {
                        // for twitter image url maybe absent
                        return ''
                    }
                }),
            )
        )
            .filter(Boolean)
            .join('\n')
    }
}

export const postParser = (node: HTMLElement) => {
    return {
        ...postNameParser(node),
        avatar: postAvatarParser(node),
        pid: postIdParser(node),
        content: postContentParser(node),
    }
}
