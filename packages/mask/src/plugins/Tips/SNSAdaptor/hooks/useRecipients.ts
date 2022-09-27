import { useEffect, useMemo, useState } from 'react'
import { useChainId, useWeb3State } from '@masknet/plugin-infra/web3'
import type { Recipient } from '../../types/index.js'

/**
 * Add name service
 */
export function useRecipients(recipients: Recipient[]) {
    const chainId = useChainId()
    const { NameService } = useWeb3State()
    const [map, setMap] = useState<Record<string, string>>({})

    useEffect(() => {
        if (!NameService?.reverse) return
        recipients.forEach(async ({ address, name: originalName }) => {
            if (originalName) return
            const name = await NameService.reverse!(chainId, address)
            if (!name) return
            setMap((oldMap) => ({
                ...oldMap,
                [address]: name,
            }))
        })
    }, [chainId, recipients, NameService])

    return useMemo(() => {
        if (!Object.keys(map).length) return recipients
        return recipients.map((recipient) => ({
            ...recipient,
            name: recipient.name || map[recipient.address],
        }))
    }, [recipients, map])
}
