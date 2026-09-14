import { encodeAbiParameters, type Address } from 'viem'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ChainId } from '@masknet/web3-shared-evm'
import { EVMConnectionReadonlyAPI } from '../../../src/Web3/EVM/apis/ConnectionReadonlyAPI.js'

const ACCOUNT = '0x0000000000000000000000000000000000000001'
const TOKEN_A = '0x0000000000000000000000000000000000000002'
const TOKEN_B = '0x0000000000000000000000000000000000000003'

function encodeBalance(balance: bigint) {
    return encodeAbiParameters([{ type: 'uint256' }], [balance])
}

class TestConnectionReadonlyAPI extends EVMConnectionReadonlyAPI {
    mockReadContract(readContract: ReturnType<typeof vi.fn>) {
        vi.spyOn(this.Request, 'getViem').mockReturnValue({ readContract } as never)
    }
}

describe('EVMConnectionReadonlyAPI.getFungibleTokensBalance', () => {
    let connection: TestConnectionReadonlyAPI

    beforeEach(() => {
        connection = new TestConnectionReadonlyAPI({
            account: ACCOUNT,
            chainId: ChainId.Zora,
        })
    })

    it('keeps successful balances and zeroes only an individually failed token call', async () => {
        const readContract = vi.fn().mockResolvedValue([
            { success: true, returnData: encodeBalance(42n) },
            { success: false, returnData: '0x' },
        ])
        connection.mockReadContract(readContract)

        await expect(connection.getFungibleTokensBalance([TOKEN_A, TOKEN_B])).resolves.toEqual({
            [TOKEN_A]: '42',
            [TOKEN_B]: '0',
        })
    })

    it('propagates an aggregate RPC failure instead of reporting zero balances', async () => {
        const error = new Error('RPC unavailable')
        const readContract = vi.fn().mockRejectedValue(error)
        connection.mockReadContract(readContract)

        await expect(connection.getFungibleTokensBalance([TOKEN_A, TOKEN_B])).rejects.toBe(error)
    })

    it('preserves token order across chunks', async () => {
        const tokens = Array.from(
            { length: 101 },
            (_, index) => `0x${(index + 1).toString(16).padStart(40, '0')}` as Address,
        )
        const readContract = vi.fn().mockImplementation(({ args }: { args: [Array<{ target: Address }>] }) =>
            Promise.resolve(
                args[0].map((call) => ({
                    success: true,
                    returnData: encodeBalance(BigInt(call.target)),
                })),
            ),
        )
        connection.mockReadContract(readContract)

        const balances = await connection.getFungibleTokensBalance(tokens)

        expect(readContract).toHaveBeenCalledTimes(2)
        expect(Object.keys(balances)).toEqual(tokens)
        expect(Object.values(balances)).toEqual(tokens.map((token) => BigInt(token).toString()))
    })
})
