import { useCallback } from 'react'
import type { TagType } from '../../Trader/types'
import { PoolDeckView } from './PoolDeckView'
import { PoolPopper } from './PoolPopper'

export interface TagInspectorProps {}

export function TagInspector(props: TagInspectorProps) {
    const createPoolView = useCallback((name: string, type: TagType, reposition?: () => void) => {
        return <PoolDeckView name={name} tagType={type} onUpdate={reposition} />
    }, [])

    return <PoolPopper>{createPoolView}</PoolPopper>
}
