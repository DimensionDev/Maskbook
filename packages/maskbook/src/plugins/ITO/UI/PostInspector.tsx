import type { ITO_JSONPayload } from '../types'

export interface PostInspectorProps {
    payload: ITO_JSONPayload
}

export function PostInspector(props: PostInspectorProps) {
    return <pre>{JSON.stringify(props.payload, null, 2)}</pre>
}
