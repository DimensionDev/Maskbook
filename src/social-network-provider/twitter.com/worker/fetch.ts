import { PersonIdentifier, PostIdentifier } from '../../../database/type'
import { toPostUrl, toProfileUrl } from '../utils/url'
import tasks from '../../../extension/content-script/tasks'
import { bioQueryString } from '../utils/selector'
import { twitterWorkerSelf } from './index'

export const fetchPostContent = async (post: PostIdentifier<PersonIdentifier>) => {
    const d = await parseDocument(toPostUrl(post))
    // TODO: You should take care about the key comes from.
    //  If some one commented a key under a normal post,
    //  it will be a false-positive and it is dangerous.
    //  There is a build-in parser.
    //  Checkout http://mdn.io/DOMParser and we're already using it.
    const content = twitterWorkerSelf.publicKeyDecoder(d.innerText)
    if (content && content[0].length) return content[0]
    return tasks(toPostUrl(post), {}).getPostContent(post)
}

export const fetchProfile = async (self: PersonIdentifier) => {
    try {
        const d = await parseDocument(toProfileUrl(self))
        const bio = d.querySelector<HTMLDivElement>(bioQueryString)
        if (bio) return { bioContent: bio.innerText }
    } catch {}
    return tasks(toProfileUrl(self), {}).getProfile(self)
}

const parseDocument = async (url: RequestInfo) => {
    const r = await fetch(url, { credentials: 'include' })
    const document = new DOMParser().parseFromString(await r.text(), 'text/html')
    const ret = document.body.querySelector<HTMLDivElement>('html')
    if (!ret) throw new Error('Cannot parse the page')
    return ret
}
