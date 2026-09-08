import type { WalletAPI } from '../entry-types.js'
import { evm, flow, solana } from './registry.js'

interface InitWalletOptions {
    deferNonEVM?: boolean
}

export function initWallet(io: WalletAPI.IOContext, options: InitWalletOptions = {}) {
    const evmStateReady = import(/* webpackMode: 'eager' */ '../Web3/EVM/apis/Web3StateAPI.js').then((mod) =>
        mod.createEVMState(io).then((state) => (evm.state = state)),
    )

    const initializeNonEVMStates = () =>
        Promise.all([
            import('../Web3/Flow/apis/Web3StateAPI.js').then((mod) =>
                mod.createFlowState(io).then((state) => (flow.state = state)),
            ),
            import('../Web3/Solana/apis/Web3StateAPI.js').then((mod) =>
                mod.createSolanaState(io).then((state) => (solana.state = state)),
            ),
        ])

    const nonEVMStatesReady =
        options.deferNonEVM ?
            evmStateReady
                .then(
                    () =>
                        new Promise<void>((resolve) => {
                            globalThis.setTimeout(resolve, 0)
                        }),
                )
                .then(initializeNonEVMStates)
        :   initializeNonEVMStates()
    const allStatesReady = Promise.all([evmStateReady, nonEVMStatesReady]).then(() => {})

    return {
        initialStateReady: options.deferNonEVM ? evmStateReady : allStatesReady,
        allStatesReady,
    }
}
