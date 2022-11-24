export namespace WalletContractDeployer {
    export interface Provider {
        /** Deploy a SC wallet and return its address. */
        deploy(owner: string, slat: number): Promise<string>
    }
}
