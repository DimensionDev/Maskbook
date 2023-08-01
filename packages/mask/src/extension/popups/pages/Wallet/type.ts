export enum ReplaceType {
    CANCEL = 'CANCEL',
    SPEED_UP = 'SPEED_UP',
}

export enum TransferAddressError {
    SAME_ACCOUNT = 'SAME_ACCOUNT',
    CONTRACT_ADDRESS = 'CONTRACT_ADDRESS',
    RESOLVE_FAILED = 'RESOLVE_FAILED',
    NETWORK_NOT_SUPPORT = 'NETWORK_NOT_SUPPORT',
}

export enum MethodAfterPersonaSign {
    DISCONNECT_NEXT_ID = 'DISCONNECT_NEXT_ID',
}

export enum HomeTabType {
    SocialAccounts = 'Social Accounts',
    ConnectedWallets = 'Connected Wallets',
}

export enum ProfilePhotoType {
    Image = 'Image',
    NFT = 'NFT',
}

export enum ContactType {
    Owned = 'Owned',
    Recipient = 'Recipient',
}

export enum WalletAssetTabs {
    Tokens = 'Tokens',
    Collectibles = 'Collectibles',
    Activity = 'Activity',
}

export type GasSetting = {
    gas: string
    gasPrice?: string
    maxPriorityFeePerGas?: string
    maxFeePerGas?: string
}

export type GasParams = Omit<GasSetting, 'gas'>

export enum TransferTabType {
    Token = 'Token',
    NFT = 'NFT',
}
