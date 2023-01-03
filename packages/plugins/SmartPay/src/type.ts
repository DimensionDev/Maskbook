export enum ManagerAccountType {
    Wallet = 'Wallet',
    Persona = 'Persona',
}

export interface ManagerAccount {
    type: ManagerAccountType
    name?: string
    address?: string
    rawPublicKey?: string
}
