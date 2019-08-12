import { PersonIdentifier } from '../../database/type'
import Services from '../../extension/service'
import { Person } from '../../database'
type link = HTMLAnchorElement | null | undefined
export function getPersonIdentifierAtFacebook(
    links: link[] | link,
    allowCollectInfo: boolean,
): Pick<Person, 'identifier' | 'nickname' | 'avatar'> {
    const unknown = { identifier: PersonIdentifier.unknown, avatar: undefined, nickname: undefined }
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
            let avatar: HTMLImageElement | undefined = undefined
            try {
                avatar = dom!.closest('.clearfix')!.parentElement!.querySelector('img')!
                if (allowCollectInfo && avatar.getAttribute('aria-label') === nickname && nickname) {
                    Services.People.updatePersonInfo(result, { nickname, avatarURL: avatar.src })
                }
            } catch {}
            try {
                avatar = dom!.querySelector('img')!
                if (allowCollectInfo && avatar) {
                    Services.People.updatePersonInfo(result, { nickname, avatarURL: avatar.src })
                }
            } catch {}
            return {
                identifier: result,
                avatar: avatar ? avatar.src : '',
                nickname: nickname,
            }
        }
        return unknown
    } catch (e) {
        console.error(e)
    }
    return unknown
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
    return url.pathname
        .replace(/^\//, '')
        .replace(/\/$/, '')
        .split('/')[0]
}
