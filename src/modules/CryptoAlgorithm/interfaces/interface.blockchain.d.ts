import { JsonWebKeyPair } from './interface'
export interface BlockChainMethods {
    /** Blockchain related fns */
    generate_ecdh_k256_from_mnemonic(password: string): PromiseLike<MnemonicWordDetail>
    recover_ecdh_k256_from_mnemonic(mnemonic: string, password: string): PromiseLike<MnemonicWordDetail>
}

export type MnemonicWordDetail = JsonWebKeyPair & {
    password: string
    mnemonic_words: string
    parameter_path: string
    parameter_with_password: boolean
}
