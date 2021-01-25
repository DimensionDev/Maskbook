import { ITO, ITO_LoadingFail } from './ITO'
import { usePoolPayload } from '../hooks/usePoolPayload'

export interface PostInspectorProps {
    pid: string
}

export function PostInspector(props: PostInspectorProps) {
    const { payload, retry: retryPoolPayload } = usePoolPayload(props.pid)
    return (
        <ITO_LoadingFail retryPoolPayload={retryPoolPayload}>
            <ITO pid={props.pid} payload={payload} retryPoolPayload={retryPoolPayload} />
        </ITO_LoadingFail>
    )
}
