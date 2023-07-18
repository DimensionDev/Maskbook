import type { Services as ServiceType } from '../../mask/background/services/types.js'
import type { ECKeyIdentifier, MaskEvents } from '@masknet/shared-base'
import type { WebExtensionMessage } from '@dimensiondev/holoflows-kit'
import type { PluginMessageEmitterItem } from '@masknet/plugin-infra'

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
        recoverWalletFromPrivateKey(name: string, privateKey: string): Promise<string>
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
        changePassword(oldPassword: string, newPassword: string): Promise<void>
        setPassword(newPassword: string): Promise<void>
        recoverWalletFromMnemonic(name: string, mnemonic: string, derivationPath?: string): Promise<string>
        createWalletFromMnemonic(name: string, mnemonic: string, derivationPath?: string): Promise<string>
        generateAddressFromMnemonic(
            name: string,
            mnemonic: string,
            derivationPath?: string,
        ): Promise<string | undefined>
        resetPassword(newPassword: string): Promise<void>
        setDefaultPassword(): Promise<void>
        resolveMaskAccount(accounts: MaskAccount[]): Promise<void>
        verifyPassword(unverifiedPassword: string): Promise<boolean>
    }
}
export interface PluginMessages {
    Transak: {
        buyTokenDialogUpdated: PluginMessageEmitterItem<
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
