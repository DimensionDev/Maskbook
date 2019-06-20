import { PostIdentifier, PersonIdentifier } from '../../database/type'
import { parseFacebookStaticHTML } from './parse-html'
import { getPostUrlAtFacebook } from './parse-username'

export async function fetchFacebookProvePost(post: PostIdentifier<PersonIdentifier>) {
    const doc = await parseFacebookStaticHTML(getPostUrlAtFacebook(post))
    if (!doc) throw new Error("Can't parse the page")
    const postDom = doc.querySelector<HTMLDivElement>('.userContent,p')
    if (!postDom) throw new Error('No post found')
    return postDom.innerText
}
