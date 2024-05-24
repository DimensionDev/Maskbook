import { Environment, assertEnvironment } from '@dimensiondev/holoflows-kit'
import { useCallback, useState } from 'react'
import { createContainer } from '@masknet/shared-base-ui'

const KEY = 'dashboard/terms-agreed'
function useTermsAgreed() {
    assertEnvironment(Environment.ExtensionProtocol)
    // TODO: migrate this code
    // eslint-disable-next-line no-restricted-globals
    const [agreed, setAgreedState] = useState(!!localStorage.getItem(KEY))

    const setAgreed = useCallback((val: boolean) => {
        // eslint-disable-next-line no-restricted-globals
        localStorage.setItem(KEY, JSON.stringify(val))
        setAgreedState(val)
    }, [])

    return [agreed, setAgreed] as const
}

export const TermsAgreedContext = createContainer(useTermsAgreed)
