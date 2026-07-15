import { isEqual, noop } from 'lodash-es'
import {
    createContext,
    memo,
    useContext,
    useEffect,
    useMemo,
    useState,
    type Dispatch,
    type PropsWithChildren,
    type SetStateAction,
} from 'react'

interface Dependency {
    id: string
    status: boolean
    pending: boolean
}

interface Options {
    setDependencies: Dispatch<SetStateAction<Dependency[]>>
    isDirty: boolean
    isPending: boolean
}

export const DirtyDetectionContext = createContext<Options>({
    setDependencies: noop,
    isDirty: false,
    isPending: false,
})
DirtyDetectionContext.displayName = 'DirtyDetectionContext'

export const DirtyDetection = memo<PropsWithChildren>(function DirtyDetection({ children }) {
    const [deps, setDeps] = useState<Dependency[]>([])

    const contextValue = useMemo(() => {
        const isDirty = deps.some((dep) => dep.status)
        const isPending = !deps.length || deps.some((dep) => dep.pending)
        return {
            setDependencies: setDeps,
            isDirty,
            isPending,
        }
    }, [deps])

    return <DirtyDetectionContext value={contextValue}>{children}</DirtyDetectionContext>
})

export function useDirtyDetection() {
    const context = useContext(DirtyDetectionContext)
    return context
}

export function useDirtyDetectionDependency(status: boolean, pending: boolean, dependencyId: string) {
    const { setDependencies } = useDirtyDetection()

    useEffect(() => {
        setDependencies((deps) => {
            if (deps.every((dep) => dep.id !== dependencyId)) {
                return [...deps, { id: dependencyId, status, pending }]
            }
            const dep = deps.find((dep) => dep.id === dependencyId)
            if (isEqual(dep, { id: dependencyId, status, pending })) return deps
            return deps.map((dep) => (dep.id === dependencyId ? { ...dep, status, pending } : dep))
        })
    }, [status, dependencyId, pending])
}
