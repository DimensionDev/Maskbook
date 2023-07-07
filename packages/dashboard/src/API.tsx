import type { Services as ServiceType } from '../../mask/background/services/types.js'
import type { ECKeyIdentifier, MaskEvents, Wallet } from '@masknet/shared-base'
import type { UnboundedRegistry, WebExtensionMessage } from '@dimensiondev/holoflows-kit'

export let Services: ServiceType = null!
export let Messages: WebExtensionMessage<MaskEvents> = null!
export let PluginServices: PluginServices = null!
export let PluginMessages: PluginMessages = null!
interface MaskAccount {
    address: string
    owner?: string
    identifier?: ECKeyIdentifier
}
export interface PluginServices {
    Wallet: {
        createMnemonicWords(): Promise<string[]>
        recoverWalletFromPrivateKey(name: string, privateKey: string, initialPassword_?: string): Promise<string>
        removeWallet(address: string, unverifiedPassword: string): Promise<void>
        recoverWalletFromKeyStoreJSON(name: string, json: string, jsonPassword: string): Promise<string>
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
        hasPassword(): Promise<boolean>
        setPassword(newPassword: string): Promise<void>
        recoverWalletFromMnemonic(
            name: string,
            mnemonic: string,
            derivationPath?: string,
            initialPassword?: string,
        ): Promise<string>
        getWallet(address: string): Promise<Wallet | null>
        generateAddressFromMnemonic(
            name: string,
            mnemonic: string,
            derivationPath?: string,
            initialPassword?: string,
        ): Promise<string | undefined>
        resetPassword(newPassword: string): Promise<void>
        resolveMaskAccount(accounts: MaskAccount[]): Promise<void>
        verifyPassword(unverifiedPassword: string): Promise<boolean>
    }
}
export interface PluginMessages {
    Transak: {
        buyTokenDialogUpdated: UnboundedRegistry<
            | {
                  open: true
                  code?: string
                  address: string
              }
            | { open: false }
        >
    }
}
export function setService(rpc: any) {
    Services = rpc
    Object.assign(globalThis, { Services: rpc })
}
export function setMessages(MaskMessage: any) {
    Messages = MaskMessage
    Object.assign(globalThis, { Messages: MaskMessage })
}
export function setPluginServices(rpc: PluginServices) {
    PluginServices = rpc
    Object.assign(globalThis, { PluginServices: rpc })
}
export function setPluginMessages(message: PluginMessages) {
    PluginMessages = message as any
    Object.assign(globalThis, { PluginMessages: message })
}
