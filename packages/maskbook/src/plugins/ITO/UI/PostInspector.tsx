import { ITO, ITO_LoadingFail } from './ITO'
import { usePoolPayload } from '../hooks/usePoolPayload'

export interface PostInspectorProps {
    pid: string
}

export function PostInspector(props: PostInspectorProps) {
    const { retry: retryPoolPayload } = usePoolPayload(props.pid)

    return (
        <ITO_LoadingFail retryPoolPayload={retryPoolPayload}>
            <ITO pid={props.pid} />
        </ITO_LoadingFail>
    )
}
