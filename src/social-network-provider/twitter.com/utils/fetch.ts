import { notNullable } from '../../../utils/assert'
import { bioCard } from './selector'

export const resolveInfoFromBioCard = () => {
    const userAvatarUrl = notNullable(
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
    const userBio = notNullable(
        bioCard()
            .nth(2)
            .evaluate(),
    ).innerText
    return {
        userAvatarUrl,
        userName: userNames[0],
        userScreenName: userNames[1],
        userBio,
    }
}
