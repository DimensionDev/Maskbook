import { bioCard } from './selector'
import { regexMatch } from '../../../utils/utils'
import { postContentParser } from './encoding'
import { notNullable } from '../../../utils/assert'

export const resolveInfoFromBioCard = () => {
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

/**
 * @param  node     the 'article' node
 * @return          link to avatar.
 */
export const postParser = (node: HTMLElement) => {
    const parseRoot = node.querySelector<HTMLElement>('[data-testid="tweet"]')!
    const nameArea = regexMatch(
        notNullable(parseRoot.children[1].querySelector<HTMLAnchorElement>('a')).innerText,
        /^(.+)\s*@(.+)$/,
        null,
    )!
    const avatarElement = parseRoot.children[0].querySelector<HTMLImageElement>(`img[src*="twimg.com"]`)
    return {
        name: nameArea[1],
        handle: nameArea[2],
        pid: regexMatch(
            parseRoot.children[1].querySelector<HTMLAnchorElement>('a[href*="status"]')!.href,
            /(\/)(\d+)/,
            2,
        )!,
        avatar: avatarElement ? avatarElement.src : undefined,
        content: postContentParser(parseRoot),
    }
}
