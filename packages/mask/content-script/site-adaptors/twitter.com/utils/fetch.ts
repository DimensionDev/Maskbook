import * as web3_utils from /* webpackDefer: true */ 'web3-utils'
import { flattenDeep } from 'lodash-es'
import { normalizeImageURL, parseId } from './url.js'
import {
    makeTypedMessageText,
    makeTypedMessageAnchor,
    makeTypedMessageEmpty,
    type TypedMessage,
    makeTypedMessageImage,
    type Meta,
    unstable_STYLE_META,
    makeTypedMessageTuple,
    FlattenTypedMessage,
} from '@masknet/typed-message'
import { collectNodeText, collectTwitterEmoji } from '../../../utils/index.js'

/**
 * Get post id from dom, including normal tweet, quoted tweet and retweet one
 */
export function getPostId(node: HTMLElement) {
    let idNode: HTMLAnchorElement | undefined | null = null
    let timeNode = node.querySelector('a[href*="/status/"] time')
    if (timeNode) {
        idNode = timeNode.parentElement as HTMLAnchorElement
    } else {
        // Quoted tweet has no `a[href*="/status/"] time` but only `time`
        timeNode = node.querySelector('time')
        idNode = timeNode?.closest('[role=link]')?.querySelector<HTMLAnchorElement>('a[href*="/status/"]')
    }
    const isRetweet = !!node.querySelector('[data-testid=socialContext]')

    let pid = ''
    if (idNode) {
        pid = parseId(idNode.href)
    } else if (timeNode) {
        // Quoted tweet in timeline has no a status link to detail page,
        // so use the timestamp as post id instead
        pid = `timestamp-keccak256:${web3_utils.keccak256(timeNode.getAttribute('datetime')!)}`
    } else {
        pid = `keccak256:${web3_utils.keccak256(node.innerText)}`
    }

    // You can't retweet a tweet or a retweet, but only cancel retweeting
    return isRetweet ? `retweet:${pid}` : pid
}

function postNameParser(node: HTMLElement) {
    const tweetElement = node.querySelector<HTMLElement>('[data-testid="tweet"]') ?? node
    const name = collectNodeText(tweetElement.querySelector<HTMLElement>('[data-testid^="User-Name"] a div div > span'))
    // Note: quoted tweet has no [data-testid^="User-Name"]
    const handle =
        Array.from(tweetElement.querySelectorAll<HTMLElement>('[tabindex]'))
            .map((node) => node.innerText || '')
            .filter((text) => text.startsWith('@'))
            .at(0) || ''

    // post matched, return the result
    if (name || handle) {
        return {
            name: name || '',
            handle: handle ? handle.slice(1) : '',
        }
    }
    const quotedTweetName = collectNodeText(
        tweetElement.querySelector<HTMLElement>(
            'div[role="link"] div[data-testid="UserAvatar-Container-unknown"] + div > span',
        ),
    )
    const quotedTweetHandle = collectNodeText(
        tweetElement
            .querySelector('[data-testid="UserAvatar-Container-unknown"]')
            ?.parentNode?.parentNode?.parentNode?.parentNode?.firstElementChild?.nextElementSibling?.querySelector(
                'span',
            ),
    )

    // quoted post matched
    return {
        name: quotedTweetName || '',
        handle: quotedTweetHandle ? quotedTweetHandle.slice(1) : '',
    }
}

function postAvatarParser(node: HTMLElement) {
    const tweetElement = node.querySelector('[data-testid="tweet"]') ?? node
    const avatarElement = tweetElement.children[0].querySelector<HTMLImageElement>('img[src*="twimg.com"]')
    return avatarElement ? avatarElement.src : undefined
}

function resolveType(content: string) {
    if (content.startsWith('@')) return 'user'
    if (content.startsWith('#')) return 'hash'
    if (content.startsWith('$')) return 'cash'
    return 'normal'
}

export function postContentMessageParser(node: HTMLElement): TypedMessage {
    function make(node: Node): TypedMessage {
        if (node.nodeType === Node.TEXT_NODE) {
            if (!node.nodeValue) return makeTypedMessageEmpty()
            return makeTypedMessageText(node.nodeValue, getElementStyle(node.parentElement))
        } else if (node instanceof HTMLAnchorElement) {
            const anchor = node
            const href = anchor.getAttribute('title') ?? anchor.getAttribute('href')
            const content = anchor.textContent
            if (!content) return makeTypedMessageEmpty()
            const altImage = node.querySelector('img')
            return makeTypedMessageAnchor(
                resolveType(content),
                href ?? '',
                content,
                altImage ? makeTypedMessageImage(altImage.src, altImage) : undefined,
                getElementStyle(node),
            )
        } else if (node instanceof HTMLImageElement) {
            const image = node
            const src = image.getAttribute('src')
            const alt = image.getAttribute('alt')
            const matched = src?.match(/emoji\/v2\/svg\/([\w-]+)\.svg/)
            if (matched) {
                const points = matched[1].split('-').map((point) => Number.parseInt(point, 16))
                return makeTypedMessageText(collectTwitterEmoji(points))
            }
            if (!alt) return makeTypedMessageEmpty()

            return makeTypedMessageText(alt)
        } else if (node instanceof HTMLSpanElement) {
            return makeTypedMessageText(node.textContent ?? '')
        } else if (node.childNodes.length) {
            const messages = makeTypedMessageTuple(flattenDeep(Array.from(node.childNodes).map(make)))
            return FlattenTypedMessage.NoContext(messages)
        } else return makeTypedMessageEmpty()
    }
    const lang = node.parentElement!.querySelector<HTMLDivElement>('[lang]')
    return lang ?
            FlattenTypedMessage.NoContext(makeTypedMessageTuple(Array.from(lang.childNodes).flatMap(make)))
        :   makeTypedMessageEmpty()
}

function getElementStyle(element: Element | null): Meta | undefined {
    if (!element) return undefined
    const computed = getComputedStyle(element)
    const style: React.CSSProperties = {}
    if (computed.fontWeight !== '400') style.fontWeight = computed.fontWeight
    if (computed.fontStyle !== 'normal') style.fontStyle = computed.fontStyle
    if (style.fontWeight || style.fontStyle) return new Map([[unstable_STYLE_META, style]])
    return undefined
}

export async function postImagesParser(node: HTMLElement): Promise<string[]> {
    const isQuotedTweet = !!node.closest('div[role="link"]')
    const imgNodes = node.querySelectorAll<HTMLImageElement>('img[src*="twimg.com/media"]')
    if (!imgNodes.length) return []
    const imgUrls = Array.from(imgNodes)
        .filter((node) => isQuotedTweet || !node.closest('div[role="link"]'))
        .flatMap((node) => normalizeImageURL(node.getAttribute('src') ?? ''))
        .filter(Boolean)
    if (!imgUrls.length) return []
    return imgUrls
}

export function postParser(node: HTMLElement) {
    return {
        ...postNameParser(node),
        avatar: postAvatarParser(node),

        pid: getPostId(node),

        messages: postContentMessageParser(node),
    }
}
