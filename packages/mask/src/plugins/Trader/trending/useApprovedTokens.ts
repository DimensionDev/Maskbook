import { useCallback, useEffect, useState } from 'react'
import { useValueRef } from '@masknet/shared-base-ui'
import stringify from 'json-stable-stringify'
import { approvedTokensFromUniswap } from '../settings.js'
import { APPROVED_TOKENS_MAX } from '../constants/index.js'

export function useApprovedTokens(token_address: string | undefined) {
    const [approvedTokens, setApprovedTokens] = useState<string[]>([])
    const tokens = useValueRef(approvedTokensFromUniswap)

    const onApprove = useCallback(() => {
        if (!token_address?.length) return

        const parsed = JSON.parse(tokens) as string[]

        if (parsed.length === APPROVED_TOKENS_MAX) parsed.shift()
        parsed.push(token_address)

        approvedTokensFromUniswap.value = stringify(parsed)
    }, [tokens, token_address])

    useEffect(() => {
        try {
            if (!tokens) approvedTokensFromUniswap.value = stringify([])
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
