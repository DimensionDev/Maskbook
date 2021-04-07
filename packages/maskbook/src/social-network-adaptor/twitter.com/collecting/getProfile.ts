import { timeout } from '../../../utils/utils'
import { bioCardSelector } from '../utils/selector'
import { bioCardParser } from '../utils/fetch'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { twitterEncoding } from '../encoding'

export async function getProfileTwitter() {
    const { publicKeyEncoder, publicKeyDecoder } = twitterEncoding
    const cardNode = (await timeout(new MutationObserverWatcher(bioCardSelector<false>(false)), 10000))[0]
    const bio = cardNode ? bioCardParser(cardNode).bio : ''
    return {
        bioContent: publicKeyEncoder(publicKeyDecoder(bio)[0] || ''),
    }
}
