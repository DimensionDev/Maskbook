import { poolPayloadErrorRetry } from '../hooks/usePoolPayload'
import { ITO, ITO_LoadingFail } from './ITO'

export interface PostInspectorProps {
    pid: string
    password: string
}

export function PostInspector(props: PostInspectorProps) {
    return (
        <ITO_LoadingFail retryPoolPayload={poolPayloadErrorRetry}>
            <ITO pid={props.pid} password={props.password} />
        </ITO_LoadingFail>
    )
}
