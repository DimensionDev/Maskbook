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
    resetPassword(newPassword: string): Promise<void>
    setDefaultPassword(): Promise<void>
    recoverWalletFromMnemonic(name: string, mnemonic: string, derivationPath?: string): Promise<string>
    generateAddressFromMnemonic(name: string, mnemonic: string, derivationPath?: string): Promise<string | undefined>
    recoverWalletFromPrivateKey(name: string, privateKey: string, derivationPath?: string): Promise<string>
    recoverWalletFromKeyStoreJSON(name: string, json: string, jsonPassword: string): Promise<string>
    INTERNAL_getPasswordRequired(): Promise<string>
    changePassword(oldPassword: string, newPassword: string): Promise<void>
}

export const WalletServiceRef = new ValueRefWithReady<WalletBackupProvider>()

export function useWalletService() {
    return useValueRef(WalletServiceRef)
}
