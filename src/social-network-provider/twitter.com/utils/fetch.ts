import { bioCard } from './selector'
import { regexMatch } from '../../../utils/utils'
import { defaultTo, get } from 'lodash-es'

export const resolveInfoFromBioCard = () => {
    const avatar = bioCard()
        .querySelector<HTMLImageElement>('img')
        .map(x => x.src)
        .evaluate()!
    const userNames = bioCard()
        .map(x => (x.children[1] as HTMLElement).innerText.split('\n'))
        .evaluate()!
    const bio = bioCard()
        .map(x => (x.children[2] as HTMLElement).innerHTML)
        .evaluate()!
    return {
        avatar,
        name: userNames[0],
        handle: userNames[1],
        bio,
    }
}

/**
 * @param  node     the 'article' node
 * @return          link to avatar.
 */
export const postParser = (node: HTMLElement) => {
    const parseRoot = node.querySelector('[data-testid="tweet"]')!
    const nameArea = parseRoot.children[1].querySelector<HTMLAnchorElement>('a')!.innerText.split('\n')
    return {
        name: nameArea[0],
        handle: nameArea[1],
        pid: regexMatch(
            parseRoot.children[1].querySelector<HTMLAnchorElement>('a[href*="status"]')!.href,
            /(\/)(\d+)/,
            2,
        )!,
        avatar: parseRoot.children[0].querySelector<HTMLImageElement>('[style*="twimg.com"] + img')!.src,
        content: defaultTo(get(parseRoot.querySelector<HTMLDivElement>('[lang]'), 'innerText'), ''),
    }
}
