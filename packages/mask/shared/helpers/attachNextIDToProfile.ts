import { type ProfileInformationFromNextID, ProfileIdentifier } from '@masknet/shared-base'
import Services from '#services'
import { batch, notify } from 'async-call-rpc/full'

export async function attachNextIDToProfile(nextID: ProfileInformationFromNextID) {
    const whoAmI = await Services.Settings.getCurrentPersonaIdentifier()

    if (!nextID?.fromNextID || !nextID.linkedPersona || !whoAmI) return
    const [rpc, emit] = batch(notify(Services.Identity))
    await Promise.allSettled(
        nextID.linkedTwitterNames?.map((x) => {
            return rpc.attachNextIDPersonaToProfile(
                {
                    ...nextID,
                    nickname: x,
                    identifier: ProfileIdentifier.of('twitter.com', x).expect(`${x} should be a valid user id`),
                },
                whoAmI,
            )
        }) ?? [],
    )
    emit()
}
