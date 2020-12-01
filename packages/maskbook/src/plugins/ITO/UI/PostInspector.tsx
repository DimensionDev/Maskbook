import type { ITO_JSONPayload } from '../types'

export interface PostInspectorProps {
    payload: ITO_JSONPayload
}

export function PostInspector(props: PostInspectorProps) {
    return <h1>Post Inspector</h1>
}
