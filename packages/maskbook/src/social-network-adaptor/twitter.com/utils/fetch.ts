import { regexMatch } from '../../../utils/utils'
import { defaultTo, flattenDeep } from 'lodash-es'
import { nthChild } from '../../../utils/dom'
import { canonifyImgUrl } from './url'
import {
    makeTypedMessageText,
    makeTypedMessageAnchor,
    makeTypedMessageEmpty,
    TypedMessage,
    isTypedMessageEmpty,
    isTypedMessageText,
    TypedMessageText,
} from '@masknet/shared'
import { collectNodeText } from '../../../utils'

/**
 * @example
 * parseNameArea("TheMirror\n(●'◡'●)@1\n@MisakaMirror")
 * >>> {
 *      name: "TheMirror(●'◡'●)@1",
 *      handle: "MisakaMirror"
 * }
 */
const parseNameArea = (nameArea: string) => {
    const atIndex = nameArea.lastIndexOf('@')
    const name = nameArea.slice(0, atIndex).replace(/\n+/g, '')
    const handle = nameArea.slice(atIndex + 1).replace(/\n+/g, '')
    return name && handle
        ? {
              name,
              handle,
          }
        : {
              name: '',
              handle: '',
          }
}

const parseId = (t: string) => {
    return regexMatch(t, /status\/(\d+)/, 1)!
}

const serializeToText = (node: ChildNode): string => {
    const snippets: string[] = []
    for (const childNode of Array.from(node.childNodes)) {
        if (childNode.nodeType === Node.TEXT_NODE) {
            if (childNode.nodeValue) snippets.push(childNode.nodeValue)
        } else if (childNode.nodeName === 'IMG') {
            const img = childNode as HTMLImageElement
            const matched = (img.getAttribute('src') ?? '').match(/emoji\/v2\/svg\/(\w+)\.svg/) ?? []
            if (matched[1]) snippets.push(String.fromCodePoint(Number.parseInt(`0x${matched[1]}`, 16)))
        } else if (childNode.childNodes.length) snippets.push(serializeToText(childNode))
    }
    return snippets.join('')
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

    // type 1:
    // normal tweet
    const anchorElement = tweetElement.querySelectorAll<HTMLAnchorElement>('a[role="link"]')[1]
    const nameInUniqueAnchorTweet = collectNodeText(anchorElement)

    // type 2:
    const nameInDoubleAnchorsTweet = Array.from(
        tweetElement.children[1]?.querySelectorAll<HTMLAnchorElement>('a[data-focusable="true"]') ?? [],
    )
        .map(serializeToText)
        .join('')

    // type 3:
    // parse name in quoted tweet
    const nameElementInQuoted = nthChild(tweetElement, 0, 0, 0, 0, 0)
    const nameInQuoteTweet = nameElementInQuoted ? serializeToText(nameElementInQuoted) : ''
    return (
        [nameInUniqueAnchorTweet, nameInDoubleAnchorsTweet, nameInQuoteTweet]
            .filter(Boolean)
            .map(parseNameArea)
            .find((r) => r.name && r.handle) ?? {
            name: '',
            handle: '',
        }
    )
}

export const postAvatarParser = (node: HTMLElement) => {
    const tweetElement = node.querySelector('[data-testid="tweet"]') ?? node
    const avatarElement = tweetElement.children[0].querySelector<HTMLImageElement>(`img[src*="twimg.com"]`)
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
            return makeTypedMessageAnchor(resolve(content), href ?? 'javascript: void 0;', content)
        } else if (node instanceof HTMLImageElement) {
            const image = node
            const src = image.getAttribute('src')
            const matched = src?.match(/emoji\/v2\/svg\/([\w\-]+)\.svg/)
            if (matched?.[1]) {
                const codePoints = matched[1].split('-').map((x) => Number.parseInt(`0x${x}`, 16))
                return makeTypedMessageText(String.fromCodePoint(...codePoints))
            }
            return makeTypedMessageEmpty()
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

        // FIXME:
        // we get wrong pid for nested tweet
        pid: postIdParser(node),

        messages: postContentMessageParser(node).filter((x) => !isTypedMessageEmpty(x)),
    }
}
