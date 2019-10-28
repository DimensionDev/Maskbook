import { bioCard } from './selector'
import { regexMatch } from '../../../utils/utils'
import { notNullable } from '../../../utils/assert'
import { defaultTo, join } from 'lodash-es'

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
                .map(x => (x.children[1] as HTMLElement).innerText)
                .evaluate(),
        ),
    )
    const bio = notNullable(
        bioCard()
            .map(x => (x.children[2] as HTMLElement).innerHTML)
            .evaluate(),
    )
    return {
        avatar,
        name: nameArea.name,
        handle: nameArea.handle,
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
        content: postContentParser(node),
    }
}
