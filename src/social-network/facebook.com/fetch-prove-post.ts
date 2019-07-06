import { PostIdentifier, PersonIdentifier } from '../../database/type'
import { parseFacebookStaticHTML } from './parse-html'
import { getPostUrlAtFacebook } from './parse-username'

export async function fetchFacebookProvePost(post: PostIdentifier<PersonIdentifier>) {
    const doc = await parseFacebookStaticHTML(getPostUrlAtFacebook(post))
    if (!doc) throw new Error("Can't parse the page")
    const content = doc.body.innerText.match(/(🔒.+🔒)/)
    if (content && content[0].length) return content[0]
    throw new Error('Not found in post')
}
