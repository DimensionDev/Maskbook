import type { Web3Plugin } from '../web3-types'

export class ProtocolState<ChainId extends number, Signature, TransactionConfig, SendOverrides, RequestOptions, Web3>
    implements
        Web3Plugin.ObjectCapabilities.ProtocolState<
            ChainId,
            Signature,
            TransactionConfig,
            SendOverrides,
            RequestOptions,
            Web3
        > {}
