import { flattenDeep } from 'lodash-es'
import {
    isTypedMessageEmpty,
    isTypedMessageText,
    makeTypedMessageAnchor,
    makeTypedMessageEmpty,
    makeTypedMessageText,
    TypedMessage,
    TypedMessageText,
} from '../../../protocols/typed-message'
import { notNullable } from '../../../utils/assert'

const parseNameArea = (nameArea: HTMLAnchorElement) => {
    const displayNameNode = nameArea.querySelector('strong')
    return {
        name: displayNameNode && notNullable(displayNameNode) ? displayNameNode.innerText : nameArea.innerText,
        handle: nameArea.href.substr(8).split('/')[1],
    }
}

export const postIdParser = (node: HTMLElement) => {
    const idNode = node.querySelector<HTMLAnchorElement>('.m-activityOwnerBlock__permalink')
    return idNode ? idNode.getAttribute('href')?.split('/')[2] ?? undefined : undefined
}

export const postNameParser = (node: HTMLElement) => {
    return parseNameArea(notNullable(node.querySelector<HTMLAnchorElement>('.m-activityOwnerBlock__displayName')))
}

export const postAvatarParser = (node: HTMLElement) => {
    const avatarElement = node.querySelector<HTMLImageElement>('.m-activityOwnerBlock__avatar img')
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
        } else if (node instanceof HTMLAnchorElement && !node.className.includes('m-activityContentMedia__link')) {
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

    const content = node.querySelector<HTMLDivElement>('m-activity__content')
    return content ? Array.from(content.childNodes).flatMap(make) : []
}

export const postParser = (node: HTMLElement) => {
    return {
        ...postNameParser(node),
        avatar: postAvatarParser(node),
        pid: postIdParser(node),

        messages: postContentMessageParser(node).filter((x) => !isTypedMessageEmpty(x)),
    }
}
