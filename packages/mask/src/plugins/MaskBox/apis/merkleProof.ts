import urlcat from 'urlcat'
import { MERKLE_PROOF_ENDPOINT } from '../constants'

export async function getMerkleProof(leaf: string, root: string) {
    try {
        const response = await fetch(
            urlcat(MERKLE_PROOF_ENDPOINT, {
                leaf,
                root: root.replace(/^0x/, ''),
            }),
        )
        return (await response.json()) as { proof?: string[]; message?: string; module?: string }
    } catch (err) {
        throw new Error(Reflect.get(Object(err), 'message'))
    }
}
