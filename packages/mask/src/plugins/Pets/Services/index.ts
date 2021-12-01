import { getCustomEssayFromRSS, saveCustomEssayToRSS } from './rss3'
import { personalSign } from '../../../extension/background-script/EthereumService'

export async function saveEssay(address: string, word: string, userId: string): Promise<any> {
    const signature = await personalSign(userId, address)
    const storeWord = {
        userId,
        word,
        updateFlag: false,
    }
    console.log('signature', signature)
    const result = await saveCustomEssayToRSS(address, storeWord, signature)
    return result
}

export async function getEssay(userId: string, address: string): Promise<any> {
    const result = await getCustomEssayFromRSS(address)
    // if (!result) {
    //     result = await getNFTAvatarFromJSON(userId)
    // }
    // return result
    console.log('getEssay', result)
    return result
}
