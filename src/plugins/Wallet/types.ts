export interface RedPacketAPI {
    /**
     * This function should watch the red packet status on the chain
     *
     * When the status is changed, it should call `onCreationResult` function
     */
    watchCreateResult(id: string): void
    /**
     * This function should watch the red packet status on the chain
     *
     * When the status is changed, it should call `onClaimResult` function
     */
    watchClaimResult(id: string): void
    /**
     * This function should watch the red packet status on the chain
     *
     * When the status is changed, it should call `onExpired` function
     */
    watchExpired(id: string): void

    create_red_packet(
        _hashes: (string | number[])[],
        _ifrandom: boolean,
        _duration: number | string,
        _seed: string | number[],
        _message: string,
        _name: string,
    ): Promise<{
        create_transaction_hash: string
        create_nonce: number
    }>
    claim(id: string | number[], password: string, _recipient: string, validation: string | number[]): Promise<string>
}
