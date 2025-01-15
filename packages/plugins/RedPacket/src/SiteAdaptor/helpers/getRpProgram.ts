import { Program } from '@coral-xyz/anchor'
import { getSolanaProvider } from './getSolanaProvider.js'

import type { Cluster } from '@solana/web3.js'
import { type Redpacket } from '../idl/rp.js'
import idl from '../idl/rp.json' with { type: 'json' }

export async function getRpProgram(cluster?: Cluster | undefined) {
    const anchorProvider = await getSolanaProvider(cluster)
    return new Program(idl as Redpacket, anchorProvider)
}
