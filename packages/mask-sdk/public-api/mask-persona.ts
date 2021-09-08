declare namespace Mask {
    /**
     * Provide the ability to interact with Persona.
     *
     * @remarks Since API=0
     * @public
     */
    export const persona: Persona
    export interface Persona {
        sign(message: string, style: 'web3'): Promise<unknown>
        // sign(message: string, style: 'mask'): Promise<unknown>
    }
}
