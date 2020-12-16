import { useMemo } from 'react'
import type { ITO_JSONPayload } from '../types'

export function usePoolPayload(id: string) {
    return useMemo(() => {
        return {
            contract_address: '0x52ceb31d6c197b5c039786fbefd6a82df70fdfd6',
            total: '100',
            total_remaining: '100',
            claim_remaining: '10',
            pid: '0x91abb4660d1925c3c0a5bfb9d0481e80a558d86b3fe446764cadc2cd9505f1b4',
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
            password: 'd928b4b2-0a7e-4c08-aaa9-6d02d7a40391',
            creation_time: 1607669042000,
            start_time: 1607668871197,
            end_time: 1607755271197,
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
