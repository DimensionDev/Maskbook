export interface Transaction {
    blockNumber: string
    timeStamp: string
    hash: string
    nonce: string
    blockHash: string
    transactionIndex: string
    from: string
    to: string
    value: string
    gas: string
    gasPrice: string
    isError: string
    errorCode: string
    // cspell:disable-next-line
    txreceipt_status: '0' | '1'
    input: string
    contractAddress: string
    cumulativeGasUsed: string
    gasUsed: string
    confirmations: string
}
