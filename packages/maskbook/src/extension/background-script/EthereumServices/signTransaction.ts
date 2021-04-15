import type { TransactionConfig } from 'web3-core'
import { createWeb3 } from './provider'

export async function signTransaction(config: TransactionConfig) {
    if (!config.from)
        throw new Error(
            'You cannot sign the transaction without knowing its account, and please provide it by using from.',
        )
    const web3 = await createWeb3()
    return new Promise<string>((resolve, reject) => {
        web3.eth.signTransaction(config, (err, signed) => {
            if (err) reject(err)
            else resolve(signed.raw)
        })
    })
}
