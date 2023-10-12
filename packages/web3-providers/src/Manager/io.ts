import type { WalletAPI } from '../entry-types.js'
import { evm, flow, solana } from './registry.js'

export let io: WalletAPI.IOContext
export async function initWallet(_io: WalletAPI.IOContext) {
    io = _io

    await Promise.all([
        import(/* webpackMode: 'eager' */ '../Web3/EVM/apis/Web3StateAPI.js').then((mod) =>
            mod.createEVMState(io).then((state) => (evm.state = state)),
        ),
        import(/* webpackMode: 'eager' */ '../Web3/Flow/apis/Web3StateAPI.js').then((mod) =>
            mod.createFlowState(io).then((state) => (flow.state = state)),
        ),
        import(/* webpackMode: 'eager' */ '../Web3/Solana/apis/Web3StateAPI.js').then((mod) =>
            mod.createSolanaState(io).then((state) => (solana.state = state)),
        ),
    ])
}
