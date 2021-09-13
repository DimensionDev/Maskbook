declare namespace Mask {
    /**
     * Provide the ability to interact with Persona.
     *
     * @remarks Since API=0
     * @public
     */
    export const persona: Persona
    export interface Persona {
        /**
         * API might change any time.
         * @remarks Since API=0
         */
        __experimental__sign__(message: string, style: 'web3'): Promise<string>
    }
}
