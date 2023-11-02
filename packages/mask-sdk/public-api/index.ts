import type { Persona } from './mask-persona.js'
import type { Ethereum } from './mask-wallet.js'
/**
 * @packageDocumentation
 * Mask SDK that provides the ability of interacting with Mask Network.
 */

export declare namespace Mask {
    /**
     * Current Mask SDK version.
     * @public
     */
    export const sdkVersion: number

    /**
     * Mask Login is following the same API as WebAuthn.
     *
     * @public
     * @remarks Since API=0
     */
    export const credentials: undefined | CredentialsContainer
    /**
     * Provide the ability to interact with Persona.
     *
     * @remarks Since API=0
     * @public
     */
    export const persona: undefined | Persona
    /**
     * @see https://eips.ethereum.org/EIPS/eip-1193
     * A EIP-1193 compatible Ethereum provider.
     * @public
     * @remarks Since API=0
     */
    export const ethereum: Ethereum.ProviderObject
}
