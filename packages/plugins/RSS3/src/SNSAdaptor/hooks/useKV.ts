import { NextIDStorage } from '@masknet/web3-providers'

export const getKV = async (publicHexKey: string) => {
    try {
        const payload = await NextIDStorage.get(publicHexKey)
        return payload
    } catch (error) {
        console.error(error)
        return null
    }
}
