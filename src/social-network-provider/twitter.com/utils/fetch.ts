import { bioCard } from './selector'

export const resolveInfoFromBioCard = () => {
    const avatar = bioCard()
        .querySelector<HTMLImageElement>('img')
        .map(x => x.src)
        .evaluate()!
    const userNames = bioCard()
        .map(x => (x.children[1] as HTMLElement).innerText.split('\n'))
        .evaluate()!
    const bio = bioCard()
        .map(x => (x.children[2] as HTMLElement).innerText)
        .evaluate()!
    return {
        avatar,
        name: userNames[0],
        handle: userNames[1],
        bio,
    }
}
