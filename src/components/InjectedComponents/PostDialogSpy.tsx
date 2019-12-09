import { MessageCenter } from '../../utils/messages'

export interface PostDialogSpyProps {}

export function PostDialogSpy(props: PostDialogSpyProps) {
    MessageCenter.emit('startCompose', undefined)
    return <div style={{ display: 'none' }}></div>
}
