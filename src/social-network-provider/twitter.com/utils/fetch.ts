import { bioCard } from './selector'
import { regexMatch } from '../../../utils/utils'
import { notNullable } from '../../../utils/assert'
import { defaultTo, join, trim } from 'lodash-es'

export const bioCardParser = () => {
    const avatar = notNullable(
        bioCard()
            .querySelector<HTMLImageElement>('img')
            .map(x => x.src)
            .evaluate(),
    )
    const userNames = notNullable(
        bioCard()
            .map(x => (x.children[1] as HTMLElement).innerText.split('\n'))
            .evaluate(),
    )
    const bio = notNullable(
        bioCard()
            .map(x => (x.children[2] as HTMLElement).innerHTML)
            .evaluate(),
    )
    return {
        avatar,
        name: userNames[0],
        handle: notNullable(regexMatch(userNames[1], /@(.+)/)),
        bio,
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

/**
 * @param  node     the '[data-testid="tweet"]' node
 * @return          link to avatar.
 */
export const postParser = async (node: HTMLElement) => {
    const nameArea = regexMatch(
        notNullable(node.children[1].querySelector<HTMLAnchorElement>('a')).innerText,
        /^((.+\s*)*)@(.+)$/,
        null,
    )!
    const avatarElement = node.children[0].querySelector<HTMLImageElement>(`img[src*="twimg.com"]`)
    const pidLocation = defaultTo(
        node.children[1].querySelector<HTMLAnchorElement>('a[href*="status"]'),
        node.parentElement!.querySelector<HTMLAnchorElement>('a[href*="status"]'),
    )
    return {
        name: trim(nameArea[1], '\n'),
        handle: nameArea[3],
        // pid may not available at promoted tweet
        pid: pidLocation ? regexMatch(pidLocation!.href, /status\/(\d+)/, 1)! : undefined,
        avatar: avatarElement ? avatarElement.src : undefined,
        content: postContentParser(node),
    }
}
