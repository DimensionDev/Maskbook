import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit'

export const untilElementAvailable: {
    (ls: LiveSelector<HTMLElement, true>): Promise<any>
    (ls: LiveSelector<HTMLElement, false>): Promise<any>
} = async (ls: LiveSelector<HTMLElement, any>) => {
    await new MutationObserverWatcher(ls)
        .startWatch({
            childList: true,
        })
        .then()
}
