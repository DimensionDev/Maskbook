import { PersonIdentifier } from '../../database/type'
import { getProfilePageUrlAtFacebook } from './parse-username'
import { parseFacebookStaticHTML } from './parse-html'

export async function fetchFacebookBio(who: PersonIdentifier) {
    const url = getProfilePageUrlAtFacebook(who)
    const doc = await parseFacebookStaticHTML(url)
    if (!doc) throw new Error("Can't parse the page")
    const bio =
        doc.querySelector<HTMLDivElement>('#bio') ||
        doc.querySelector<HTMLDivElement>('div > div > div:nth-child(2) > div:nth-child(2)')
    if (!bio) throw new Error("Can't find bio")
    return bio.innerText
}
