export enum TransactionType {}

export interface Transaction {
    type: TransactionType
}

export enum TransactionProvider {
    ZERION,
    DEBANK,
}
