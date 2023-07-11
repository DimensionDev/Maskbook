import { type LegacyWalletRecord, type Wallet, ValueRefWithReady } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'

export interface WalletBackupProvider {
    exportMnemonic(address: string): Promise<string>
    exportPrivateKey(address: string): Promise<string>
    getLegacyWallets(): Promise<LegacyWalletRecord[]>
    getWallets(): Promise<Wallet[]>
    getDerivableAccounts(
        mnemonic: string,
        page: number,
        pageSize?: number,
    ): Promise<
        Array<{
            index: number
            address: string
            derivationPath: string
        }>
    >
    recoverWalletFromMnemonic(
        name: string,
        mnemonic: string,
        derivationPath?: string,
        initialPassword?: string,
    ): Promise<string>
    generateAddressFromMnemonic(
        name: string,
        mnemonic: string,
        derivationPath?: string,
        initialPassword?: string,
    ): Promise<string | undefined>
    recoverWalletFromPrivateKey(
        name: string,
        privateKey: string,
        initialPassword_?: string,
        derivationPath?: string,
    ): Promise<string>
    recoverWalletFromKeyStoreJSON(name: string, json: string, jsonPassword: string): Promise<string>
    INTERNAL_getPasswordRequired(): Promise<string>
}

export const WalletServiceRef = new ValueRefWithReady<WalletBackupProvider>()

export function useWalletService() {
    return useValueRef(WalletServiceRef)
}
