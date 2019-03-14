import { AsyncCall, MessageCenter } from '@holoflows/kit/es'
import { BackgroundServices } from '../background-script/rpc'

export const Background = AsyncCall<BackgroundServices, BackgroundServices>('maskbook', {}, {}, MessageCenter, true)
