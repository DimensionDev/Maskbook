export enum ImportSource {
    WalletRPC = 'wallet_rpc',
    LocalGenerated = 'local_generated',
    UserProvided = 'user_provided',
}

export interface Wallet {
    id: string
    /** the user define wallet name. Default address.prefix(6) */
    name: string
    /** the address of wallet */
    address: string
    /** the wallet source */
    source: ImportSource
    /** true: Mask Wallet, false: External Wallet */
    hasStoredKeyInfo: boolean
    /** true: Derivable Wallet. false: UnDerivable Wallet */
    hasDerivationPath: boolean
    /** yep: removable, nope: unremovable */
    configurable?: boolean
    /** the derivation path when wallet was created */
    derivationPath?: string
    /** the derivation path when wallet last was derived */
    latestDerivationPath?: string
    /** the internal presentation of mask wallet sdk */
    storedKeyInfo?: never
    /** record created at */
    createdAt: Date
    /** record updated at */
    updatedAt: Date
    /** an abstract wallet has a owner */
    owner?: string
    /** an abstract wallet has been deployed */
    deployed?: boolean
    /** persona identifier */
    identifier?: string
    /**
     * mnemonicId represents a wallet under the same set of mnemonics,
     * used for wallet grouping
     */
    mnemonicId?: string
}
