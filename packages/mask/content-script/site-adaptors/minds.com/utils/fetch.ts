import { flattenDeep } from 'lodash-es'
import {
    isTypedMessageEmpty,
    isTypedMessageText,
    makeTypedMessageAnchor,
    makeTypedMessageEmpty,
    makeTypedMessageText,
    type TypedMessage,
} from '@masknet/typed-message'
import { assertNonNull } from '@masknet/kit'

function parseNameArea(nameArea: HTMLAnchorElement) {
    const displayNameNode = nameArea.querySelector('span')

    return {
        name: displayNameNode && assertNonNull(displayNameNode) ? displayNameNode.innerText : nameArea.innerText,
        handle: nameArea.href.slice(8).split('/')[1],
    }
}

function postIdParser(node: HTMLElement) {
    const idNode = node.querySelector<HTMLAnchorElement>('m-activity__permalink .m-activityPermalink__wrapper--link')
    return idNode ? (idNode.getAttribute('href')?.split('/')[2] ?? undefined) : undefined
}

function postNameParser(node: HTMLElement) {
    return parseNameArea(
        assertNonNull(
            node.querySelector<HTMLAnchorElement>(
                [
                    'm-activity__ownerblock .m-activityOwnerBlock__primaryName',
                    'm-activity__ownerblock .m-activityOwnerBlock__secondaryName', // It's `secondaryName` in detail page
                ].join(','),
            ),
        ),
    )
}

function postAvatarParser(node: HTMLElement) {
    const avatarElement = node.querySelector<HTMLImageElement>('m-hovercard img')
    return avatarElement ? avatarElement.src : undefined
}

function resolveType(content: string) {
    if (content.startsWith('@')) return 'user'
    if (content.startsWith('#')) return 'hash'
    if (content.startsWith('$')) return 'cash'
    return 'normal'
}
function postContentMessageParser(node: HTMLElement) {
    function make(node: Node): TypedMessage | TypedMessage[] {
        if (node.nodeType === Node.TEXT_NODE) {
            if (!node.nodeValue) return makeTypedMessageEmpty()
            return makeTypedMessageText(node.nodeValue)
        } else if (node instanceof HTMLAnchorElement && !node.className.includes('m-activityContentMedia__link')) {
            const anchor = node
            const href = anchor.getAttribute('title') ?? anchor.getAttribute('href')
            const content = anchor.textContent
            if (!content) return makeTypedMessageEmpty()
            return makeTypedMessageAnchor(resolveType(content), href ?? '', content)
        } else if (node instanceof HTMLImageElement) {
            const image = node
            const src = image.getAttribute('src')
            const matched = src?.match(/emoji\/v2\/svg\/([\w-]+)\.svg/)
            if (!matched) return makeTypedMessageEmpty()
            const points = matched[1].split('-').map((point) => Number.parseInt(point, 16))
            return makeTypedMessageText(String.fromCodePoint(...points))
        } else if (node.childNodes.length) {
            const flattened = flattenDeep(Array.from(node.childNodes, make))
            // conjunct text messages under same node
            if (flattened.every(isTypedMessageText))
                return makeTypedMessageText(flattened.map((x) => x.content).join(''))
            return flattened
        } else return makeTypedMessageEmpty()
    }

    const content = node.querySelector<HTMLDivElement>('m-activity__content')
    return content ? Array.from(content.childNodes).flatMap(make) : []
}

export function postParser(node: HTMLElement) {
    return {
        ...postNameParser(node),
        avatar: postAvatarParser(node),
        pid: postIdParser(node),

        messages: postContentMessageParser(node).filter((x) => !isTypedMessageEmpty(x)),
    }
}
