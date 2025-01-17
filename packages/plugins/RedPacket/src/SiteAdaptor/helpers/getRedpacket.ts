import { getRpProgram } from './getRpProgram.js'

export async function getRedpacket(id: string) {
    const program = await getRpProgram()
    return program.account.redPacket.fetch(id)
}
