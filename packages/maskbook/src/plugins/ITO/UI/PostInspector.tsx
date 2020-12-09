import type { ITO_JSONPayload } from '../types'
import { ITO } from './ITO'

export interface PostInspectorProps {
    payload: ITO_JSONPayload
}

export function PostInspector(props: PostInspectorProps) {
    return (
        <pre>
            <ITO payload={props.payload} />
        </pre>
    )
}
