import { BaseSolanaWalletProvider } from './Base.js'
import { unimplemented } from '@masknet/kit'
export class NoneProvider extends BaseSolanaWalletProvider {
    override signMessage(): never {
        unimplemented()
    }
    override signTransaction(): never {
        unimplemented()
    }
}
