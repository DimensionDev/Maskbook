import { Program } from '@coral-xyz/anchor'
import { getSolanaProvider } from './getSolanaProvider.js'

import type { Cluster } from '@solana/web3.js'
import { RED_PACKET_PROGRAM_ADDRESS_MAP } from '../../constants.js'
import type { Redpacket } from '../../idl/redpacket.js'
import idl from '../../idl/redpacket.json' with { type: 'json' }

export async function getRpProgram(cluster: Cluster | undefined) {
    const anchorProvider = await getSolanaProvider(cluster)
    const address = RED_PACKET_PROGRAM_ADDRESS_MAP[cluster ?? 'mainnet-beta']
    if (!address) {
        console.error('No redpacket program address found for cluster', cluster)
    }
    return new Program({ ...idl, address } as Redpacket, anchorProvider)
}
