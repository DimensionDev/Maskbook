import type { Hex } from 'viem'
import { signMessage as viem_sign } from 'viem/accounts'

export function signMessage(message: string, privateKey: Hex): Promise<string> {
    return viem_sign({
        message: message.startsWith('0x') ? { raw: message as Hex } : message,
        privateKey,
    })
}
