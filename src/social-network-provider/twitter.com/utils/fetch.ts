import { notNullable } from '../../../utils/assert'
import { bioCard } from './selector'

export const resolveInfoFromBioCard = () => {
    const avatar = notNullable(
        bioCard()
            .nth(0)
            .querySelector<HTMLImageElement>('img')
            .evaluate(),
    ).src
    const userNames = notNullable(
        bioCard()
            .nth(1)
            .evaluate(),
    ).innerText.split('\n')
    const bio = notNullable(
        bioCard()
            .nth(2)
            .evaluate(),
    ).innerText
    return {
        avatar,
        name: userNames[0],
        handle: userNames[1],
        bio,
    }
}
