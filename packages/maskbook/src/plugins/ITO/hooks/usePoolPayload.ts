import { useMemo } from 'react'
import type { ITO_JSONPayload } from '../types'

export function usePoolPayload(id: string) {
    return useMemo(() => {
        return {
            contract_address: '0xc0a44477c137b9a603eba80ddad219a02a62f0ff',
            creation_time: 1608096146000,
            total: '100',
            total_remaining: '100',
            claim_remaining: '10',
            pid: '0x3bd9095382751c68e07906dd7a33adc79163a5de6161f96014b990899a03e873',
            sender: {
                address: '0x66b57885E8E9D84742faBda0cE6E3496055b012d',
                name: 'Mask',
                message: 'Test ITO Packet',
            },
            chain_id: 4,
            token: {
                type: 1,
                address: '0x960B816d6dD03eD514c03F56788279154348Ea37',
                chainId: 4,
                name: 'MASKBOOK A',
                symbol: 'MSKA',
                decimals: 18,
            },
            limit: '10',
            password: '6c1a5614-d12b-480e-9971-9c8f92ed46fc',
            start_time: 1608096025268,
            end_time: 1608182425268,
            exchange_tokens: [
                {
                    type: 1,
                    address: '0xFa4Bddbc85c0aC7a543c4b59dCfb5deB17F67D8E',
                    chainId: 4,
                    name: 'MASKBOOK B',
                    symbol: 'MSKB',
                    decimals: 18,
                },
                {
                    type: 1,
                    address: '0xbE88c0E7029929f50c81690275395Da1d05745B0',
                    chainId: 4,
                    name: 'MASKBOOK C',
                    symbol: 'MSKC',
                    decimals: 18,
                },
            ],
            exchange_amounts: ['1000', '10000'],
        } as ITO_JSONPayload
    }, [])
}
