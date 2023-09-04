import { useCallback, useState } from 'react'
import { createContainer } from 'unstated-next'

const KEY = 'dashboard/terms-agreed'
function useTermsAgreed() {
    const [agreed, setAgreedState] = useState(!!localStorage.getItem(KEY))

    const setAgreed = useCallback((val: boolean) => {
        localStorage.setItem(KEY, JSON.stringify(val))
        setAgreedState(val)
    }, [])

    return [agreed, setAgreed] as const
}

export const TermsAgreedContext = createContainer(useTermsAgreed)
