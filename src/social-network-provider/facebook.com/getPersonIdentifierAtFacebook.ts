import { PersonIdentifier } from '../../database/type'
import Services from '../../extension/service'
type link = HTMLAnchorElement | null | undefined
export function getPersonIdentifierAtFacebook(links: link[] | link, allowCollectInfo: boolean): PersonIdentifier {
    try {
        // tslint:disable-next-line: no-parameter-reassignment
        if (!Array.isArray(links)) links = [links]
        const result = links
            .filter(x => x)
            .map(x => ({ nickname: x!.innerText, id: getUserID(x!.href), dom: x }))
            .filter(x => x.id)
        const { dom, id, nickname } = result[0] || ({} as any)
        if (id) {
            const result = new PersonIdentifier('facebook.com', id)
            if (allowCollectInfo)
                try {
                    const avatar = dom!.closest('.clearfix')!.parentElement!.querySelector('img')!
                    if (avatar.getAttribute('aria-label') === nickname && nickname) {
                        Services.People.updatePersonInfo(result, { nickname, avatarURL: avatar.src })
                    }
                } catch {}
            return result
        }
        return PersonIdentifier.unknown
    } catch (e) {
        console.error(e)
    }
    return PersonIdentifier.unknown
}
function getUserID(x: string) {
    if (!x) return null
    const relative = !x.startsWith('https://') && !x.startsWith('http://')
    const url = relative ? new URL(x, location.host) : new URL(x)

    if (url.hostname !== 'www.facebook.com' && url.hostname !== 'm.facebook.com') return null
    if (url.pathname.endsWith('.php')) {
        if (!url.search) return null
        const search = new URLSearchParams(url.search)
        return search.get('id')
    }
    return url.pathname.replace(/^\//, '').replace(/\/$/, '')
}
