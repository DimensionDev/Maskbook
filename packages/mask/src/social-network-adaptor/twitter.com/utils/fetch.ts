import { defaultTo, flattenDeep } from 'lodash-unified'
import {
    makeTypedMessageText,
    makeTypedMessageAnchor,
    makeTypedMessageEmpty,
    TypedMessage,
    isTypedMessageEmpty,
    isTypedMessageText,
    TypedMessageText,
} from '@masknet/typed-message'
import { regexMatch } from '../../../utils/utils.js'
import { canonifyImgUrl } from './url.js'
import { collectNodeText, collectTwitterEmoji } from '../../../utils/index.js'

const parseId = (t: string) => {
    return regexMatch(t, /status\/(\d+)/, 1)!
}

export const postIdParser = (node: HTMLElement) => {
    const idNode = defaultTo(
        node.children[1]?.querySelector<HTMLAnchorElement>('a[href*="status"]'),
        defaultTo(
            node.parentElement!.querySelector<HTMLAnchorElement>('a[href*="status"]'),
            node.closest('article > div')?.querySelector<HTMLAnchorElement>('a[href*="status"]'),
        ),
    )
    const isRetweet = !!node.querySelector('[data-testid=socialContext]')
    const pid = idNode ? parseId(idNode.href) : parseId(location.href)
    // You can't retweet a tweet or a retweet, but only cancel retweeting
    return isRetweet ? `retweet:${pid}` : pid
}

export const postNameParser = (node: HTMLElement) => {
    const tweetElement = node.querySelector<HTMLElement>('[data-testid="tweet"]') ?? node
    const name = collectNodeText(
        tweetElement.querySelector<HTMLElement>('a:not([target]) > div > div[dir="auto"] > span'),
    )
    const handle = collectNodeText(tweetElement.querySelector<HTMLElement>('a[tabindex="-1"] span'))

    if (name && handle) {
        return {
            name,
            handle: handle.slice(1),
        }
    }
    const quotedTweetName = collectNodeText(
        tweetElement.querySelector<HTMLElement>('div[role="link"] div[dir="auto"] > span'),
    )
    const quotedTweetHandle = collectNodeText(
        tweetElement.querySelector<HTMLElement>('div[role="link"] div[dir="ltr"] > span'),
    )

    if (quotedTweetName && quotedTweetHandle) {
        return {
            name: quotedTweetName,
            handle: quotedTweetHandle.slice(1),
        }
    }
    return {
        name: '',
        handle: '',
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
            return makeTypedMessageAnchor(resolve(content), href ?? '', content)
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

        // FIXME: we get wrong pid for nested tweet
        pid: postIdParser(node),

        messages: postContentMessageParser(node).filter((x) => !isTypedMessageEmpty(x)),
    }
}
