import { useCallback, useEffect, useState } from 'react'
import { useValueRefJSON } from '@masknet/shared-base-ui'
import { approvedTokensFromUniswap } from '../settings.js'
import { APPROVED_TOKENS_MAX } from '../constants/index.js'

export function useApprovedTokens(token_address: string | undefined) {
    const [approvedTokens, setApprovedTokens] = useState<readonly string[]>([])
    const tokens = useValueRefJSON(approvedTokensFromUniswap)

    const onApprove = useCallback(() => {
        if (!token_address?.length) return

        const next = [...tokens]

        if (tokens.length === APPROVED_TOKENS_MAX) next.shift()
        next.push(token_address)

        // @ts-ignore https://github.com/microsoft/TypeScript/issues/51676
        approvedTokensFromUniswap.value = next
    }, [tokens, token_address])

    useEffect(() => setApprovedTokens(tokens), [tokens])

    return {
        approvedTokens,
        onApprove,
    }
}
