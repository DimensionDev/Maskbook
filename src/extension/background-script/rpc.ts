import { SaveKeypair } from './SaveKeypairService'
import { AsyncCall, MessageCenter } from '@holoflows/kit/es'

const BackgroundServices = {
    saveKeypair: SaveKeypair,
}
export type BackgroundServices = typeof BackgroundServices
export const ContentScript = AsyncCall<BackgroundServices, {}>('maskbook', BackgroundServices, {}, MessageCenter, true)
