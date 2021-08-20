import { useCallback, useEffect, useState } from 'react'
import { useValueRef } from '@masknet/shared'
import stringify from 'json-stable-stringify'
import { approvedTokensFromUniSwap } from '../settings'
import { APPROVED_TOKENS_MAX } from '../constants'

export function useApprovedTokens(token_address: string | undefined) {
    const [approvedTokens, setApprovedTokens] = useState<string[]>([])
    const tokens = useValueRef(approvedTokensFromUniSwap)

    const onApprove = useCallback(() => {
        if (!token_address || !token_address.length) return

        const parsed = JSON.parse(tokens) as string[]

        if (parsed.length === APPROVED_TOKENS_MAX) parsed.shift()
        parsed.push(token_address)

        approvedTokensFromUniSwap.value = stringify(parsed)
    }, [tokens, token_address])

    useEffect(() => {
        try {
            if (!tokens) approvedTokensFromUniSwap.value = stringify([])
            else setApprovedTokens(JSON.parse(tokens))
        } catch {
            setApprovedTokens([])
        }
    }, [tokens])

    return {
        approvedTokens,
        onApprove,
    }
}
