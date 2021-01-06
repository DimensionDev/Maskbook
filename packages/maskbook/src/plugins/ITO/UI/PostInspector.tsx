import { usePoolPayload } from '../hooks/usePoolPayload'
import type { JSON_PayloadInMask } from '../types'
import { ITO } from './ITO'

export interface PostInspectorProps {
    payload: JSON_PayloadInMask
}

export function PostInspector(props: PostInspectorProps) {
    const { pid, password } = props.payload
    const { value: poolPayload, retry } = usePoolPayload(pid)
    return poolPayload ? (
        <ITO
            payload={{
                ...poolPayload,
                password: password || poolPayload.password,
            }}
            retryPayload={retry}
        />
    ) : null
}
