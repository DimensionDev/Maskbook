export enum ImportSource {
    Privy = 'privy',
}

export interface Wallet {
    id: string
    /** the user define wallet name. Default address.prefix(6) */
    name: string
    /** the address of wallet */
    address: string
    /** the wallet source */
    source: ImportSource
    /** record created at */
    createdAt: Date
    /** only abstract wallet has owner */
    owner?: string
    /** record updated at */
    updatedAt: Date
    /** persona identifier */
    identifier?: string
}

export type UpdatableWallet = Pick<Wallet, 'address' | 'name' | 'identifier'>
