import { createContainer } from 'unstated-next'
import { useQueryQualification } from '../hooks/useQueryQualification.js'

function useSmartPayContext() {
    const { value, loading } = useQueryQualification()

    return {
        signablePersonas: value?.signablePersonas,
        signableWallets: value?.signableWallets,
        loading,
    }
}

export const SmartPayContext = createContainer(useSmartPayContext)
