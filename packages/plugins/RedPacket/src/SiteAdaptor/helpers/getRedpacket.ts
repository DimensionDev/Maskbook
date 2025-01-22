import type { Cluster } from '@solana/web3.js'
import { getRpProgram } from './getRpProgram.js'

export async function getRedpacket(id: string, cluster?: Cluster | undefined) {
    const program = await getRpProgram(cluster)
    return program.account.redPacket.fetch(id)
}
