import { poolPayloadErrorRetry } from '../hooks/usePoolPayload'
import { ITO, ITO_LoadingFail } from './ITO'

export interface PostInspectorProps {
    pid: string
}

export function PostInspector(props: PostInspectorProps) {
    return (
        <ITO_LoadingFail retryPoolPayload={poolPayloadErrorRetry}>
            <ITO pid={props.pid} />
        </ITO_LoadingFail>
    )
}
