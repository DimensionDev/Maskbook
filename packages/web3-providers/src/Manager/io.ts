import { createEVMState } from '../Web3/EVM/apis/Web3StateAPI.js'
import { createFlowState } from '../Web3/Flow/apis/Web3StateAPI.js'
import { createSolanaState } from '../Web3/Solana/apis/Web3StateAPI.js'
import type { WalletAPI } from '../entry-types.js'
import { evm, flow, solana } from './registry.js'

export let io: WalletAPI.IOContext
export async function initWallet(_io: WalletAPI.IOContext) {
    io = _io

    await Promise.all([
        createEVMState(io).then((state) => (evm.state = state)),
        createSolanaState(io).then((state) => (solana.state = state)),
        createFlowState(io).then((state) => (flow.state = state)),
    ])
}
