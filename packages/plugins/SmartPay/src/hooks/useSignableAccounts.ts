import type { PersonaInformation } from '@masknet/shared-base'
import type { Wallet } from '@masknet/web3-shared-base'
import { useEffect } from 'react'
import type { AsyncState } from 'react-use/lib/useAsyncFn.js'
import type { SignablePersona } from '../type.js'
import { useQueryQualification } from './useQueryQualification.js'

export function useSignableAccounts(): AsyncState<{
    personas: PersonaInformation[]
    signablePersonas?: SignablePersona[]
    signableWallets?: Wallet[]
}> {
    const [result, queryQualification] = useQueryQualification()

    useEffect(() => {
        queryQualification()
    }, [queryQualification])

    return result
}
