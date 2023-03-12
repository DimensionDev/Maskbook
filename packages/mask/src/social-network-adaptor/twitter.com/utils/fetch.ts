import { keccak256 } from 'web3-utils'
import { regexMatch } from '../../../utils/utils.js'
import { flattenDeep } from 'lodash-es'
import { canonifyImgUrl } from './url.js'
import {
    makeTypedMessageText,
    makeTypedMessageAnchor,
    makeTypedMessageEmpty,
    TypedMessage,
    isTypedMessageEmpty,
    isTypedMessageText,
    TypedMessageText,
    makeTypedMessageImage,
} from '@masknet/typed-message'
import { collectNodeText, collectTwitterEmoji } from '../../../utils/index.js'

const parseId = (t: string) => {
    return regexMatch(t, /status\/(\d+)/, 1)!
}

/**
 * Get post id from dom, including normal tweet, quoted tweet and retweet one
 */
export const getPostId = (node: HTMLElement) => {
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
        pid = `timestamp-keccak256:${keccak256(timeNode.getAttribute('datetime')!)}`
    } else {
        pid = `keccak256:${keccak256(node.innerText)}`
    }

    // You can't retweet a tweet or a retweet, but only cancel retweeting
    return isRetweet ? `retweet:${pid}` : pid
}

export const postNameParser = (node: HTMLElement) => {
    const tweetElement = node.querySelector<HTMLElement>('[data-testid="tweet"]') ?? node
    const name = collectNodeText(tweetElement.querySelector<HTMLElement>('[data-testid="User-Names"] a div div > span'))
    // Note: quoted tweet has no [data-testid="User-Names"]
    const handle = collectNodeText(
        tweetElement.querySelector<HTMLElement>('[data-testid="User-Names"] a[tabindex="-1"] span'),
    )

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

export const postAvatarParser = (node: HTMLElement) => {
    const tweetElement = node.querySelector('[data-testid="tweet"]') ?? node
    const avatarElement = tweetElement.children[0].querySelector<HTMLImageElement>('img[src*="twimg.com"]')
    return avatarElement ? avatarElement.src : undefined
}

export const postContentMessageParser = (node: HTMLElement) => {
    function resolve(content: string) {
        if (content.startsWith('@')) return 'user'
        if (content.startsWith('#')) return 'hash'
        if (content.startsWith('$')) return 'cash'
        return 'normal'
    }
    function make(node: Node): TypedMessage | TypedMessage[] {
        if (node.nodeType === Node.TEXT_NODE) {
            if (!node.nodeValue) return makeTypedMessageEmpty()
            return makeTypedMessageText(node.nodeValue)
        } else if (node instanceof HTMLAnchorElement) {
            const anchor = node
            const href = anchor.getAttribute('title') ?? anchor.getAttribute('href')
            const content = anchor.textContent
            if (!content) return makeTypedMessageEmpty()
            const altImage = node.querySelector('img')
            return makeTypedMessageAnchor(
                resolve(content),
                href ?? '',
                content,
                altImage ? makeTypedMessageImage(altImage.src, altImage) : undefined,
            )
        } else if (node instanceof HTMLImageElement) {
            const image = node
            const src = image.getAttribute('src')
            const alt = image.getAttribute('alt')
            const matched = src?.match(/emoji\/v2\/svg\/([\w\-]+)\.svg/)
            if (matched) {
                const points = matched[1].split('-').map((point) => Number.parseInt(point, 16))
                return makeTypedMessageText(collectTwitterEmoji(points))
            }
            if (!alt) return makeTypedMessageEmpty()

            return makeTypedMessageText(alt)
        } else if (node.childNodes.length) {
            const flattened = flattenDeep(Array.from(node.childNodes).map(make))
            // conjunct text messages under same node
            if (flattened.every(isTypedMessageText))
                return makeTypedMessageText((flattened as TypedMessageText[]).map((x) => x.content).join(''))
            return flattened
        } else return makeTypedMessageEmpty()
    }
    const lang = node.parentElement!.querySelector<HTMLDivElement>('[lang]')
    return lang ? Array.from(lang.childNodes).flatMap(make) : []
}

export const postImagesParser = async (node: HTMLElement): Promise<string[]> => {
    const isQuotedTweet = !!node.closest('div[role="link"]')
    const imgNodes = node.querySelectorAll<HTMLImageElement>('img[src*="twimg.com/media"]')
    if (!imgNodes.length) return []
    const imgUrls = Array.from(imgNodes)
        .filter((node) => isQuotedTweet || !node.closest('div[role="link"]'))
        .flatMap((node) => canonifyImgUrl(node.getAttribute('src') ?? ''))
        .filter(Boolean)
    if (!imgUrls.length) return []
    return imgUrls
}

export const postParser = (node: HTMLElement) => {
    return {
        ...postNameParser(node),
        avatar: postAvatarParser(node),

        pid: getPostId(node),

        messages: postContentMessageParser(node).filter((x) => !isTypedMessageEmpty(x)),
    }
}
