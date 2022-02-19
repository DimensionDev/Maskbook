import { MERKLE_PROOF_ENDPOINT } from '../constants'

export const getHashRoot = async (leaf: string, root: string) => {
    let response: { proof?: string[]; message?: string; module?: string } = {}
    let ok = false
    try {
        const res = await fetch(`${MERKLE_PROOF_ENDPOINT}?leaf=${leaf}&root=${root}`)
        response = await res.json()
        ok = res.ok
    } catch (err: any) {
        console.log('error', err)
    }

    if (!ok) {
        throw new Error(response?.message)
    }

    return response
}
