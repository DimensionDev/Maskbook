import type { PopupSSR_Props } from './type'

export async function prepareSSR(): Promise<PopupSSR_Props> {
    return {
        currentPersonaIndex: 0,
        mergedProfiles: [],
        personas: [],
    }
}
