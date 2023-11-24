import type { WalletAPI } from '../entry-types.js'
import { evm, flow, solana } from './registry.js'

interface Options {
    enableEvm?: boolean
    enableFlow?: boolean
    enableSolana?: boolean
}

export async function initWallet(
    io: WalletAPI.IOContext,
    { enableEvm = true, enableFlow = true, enableSolana = true }: Options = {},
) {
    await Promise.all([
        enableEvm ?
            import(/* webpackMode: 'eager' */ '../Web3/EVM/apis/Web3StateAPI.js').then((mod) =>
                mod.createEVMState(io).then((state) => (evm.state = state)),
            )
        :   null,
        enableFlow ?
            import(/* webpackMode: 'eager' */ '../Web3/Flow/apis/Web3StateAPI.js').then((mod) =>
                mod.createFlowState(io).then((state) => (flow.state = state)),
            )
        :   null,
        enableSolana ?
            import(/* webpackMode: 'eager' */ '../Web3/Solana/apis/Web3StateAPI.js').then((mod) =>
                mod.createSolanaState(io).then((state) => (solana.state = state)),
            )
        :   null,
    ])
}
