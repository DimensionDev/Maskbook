import type { Wallet } from '@masknet/shared-base'
import type { LegacyWalletRecord } from '../../../shared/definitions/wallet.js'

// TODO: this should be in the plugin infra.
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
    removeWallet(address: string, unverifiedPassword: string): Promise<void>
    recoverWalletFromPrivateKey(name: string, privateKey: string, initialPassword_?: string): Promise<string>
    recoverWalletFromKeyStoreJSON(name: string, json: string, jsonPassword: string): Promise<string>
    INTERNAL_getPasswordRequired(): Promise<string>
}
export let provider: WalletBackupProvider
export function setWalletBackupProvider(p: WalletBackupProvider) {
    provider = p
}
