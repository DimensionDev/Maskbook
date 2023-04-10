export namespace LidoBaseAPI {
    export interface Provider {
        getStEthAPR: () => Promise<string>
    }
}
