import { poolPayloadErrorRetry } from '../hooks/usePoolPayload'
import { ITO, ITO_LoadingFail } from './ITO'

export interface PostInspectorProps {
    pid: string
}
const { log } = console
export function PostInspector(props: PostInspectorProps) {
    log('post inspector')
    return (
        <ITO_LoadingFail retryPoolPayload={poolPayloadErrorRetry}>
            <ITO pid={props.pid} />
        </ITO_LoadingFail>
    )
}
