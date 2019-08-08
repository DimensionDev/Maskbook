import { DomProxy } from '@holoflows/kit'

export const recursiveSelectChild = (e: DomProxy, count: number) => {
    let curr = e;
    for (let i = 0; i < count; i += 1) {
        curr = curr.current.firstChild
    }
}
