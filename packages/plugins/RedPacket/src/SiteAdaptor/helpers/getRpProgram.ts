import { Program } from '@coral-xyz/anchor'
import { getSolanaProvider } from './getSolanaProvider.js'

import idl from '../idl/rp.json' with { type: 'json' }
import { type Redpacket } from '../idl/rp.js'

export async function getRpProgram() {
    const anchorProvider = await getSolanaProvider()
    const program = new Program(idl as Redpacket, anchorProvider)
    return program
}
