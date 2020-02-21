import { untilDomLoaded, untilDocumentReady, isDocument, nthChild, untilElementAvailable } from '../dom'
import { LiveSelector } from '@holoflows/kit'

test('is document', () => {
    expect(isDocument(document)).toBeTruthy()
    expect(isDocument(document.body)).toBeFalsy()
})

test('until element available', async () => {
    document.body.innerHTML = '<span></span>'
    const ls = new LiveSelector().querySelector<HTMLElement>('body span')
    await untilElementAvailable(ls, 500)
    document.body.innerHTML = '' // restore
})

test('until element available throw error in case of element absent', () => {
    const ls = new LiveSelector().querySelector<HTMLElement>('body span')
    expect(untilElementAvailable(ls, 500)).rejects.toThrow()
})

test('until dom loaded', async () => {
    jest.spyOn(document, 'readyState', 'get').mockReturnValue('loading')
    setTimeout(() => {
        jest.spyOn(document, 'readyState', 'get').mockReturnValue('complete')
        document.dispatchEvent(new Event('readystatechange'))
    }, 0)
    await untilDomLoaded()
})

test('until document ready', async () => {
    jest.spyOn(document, 'readyState', 'get').mockReturnValue('loading')
    setTimeout(() => {
        jest.spyOn(document, 'readyState', 'get').mockReturnValue('complete')
        document.dispatchEvent(new Event('readystatechange'))
    }, 0)
    await untilDocumentReady()
})

test('nth child', () => {
    const tree = new DOMParser().parseFromString(
        `
        <div>
            <div></div>
            <div>
                <span></span>
            </div>
        </div>
    `,
        'text/html',
    ).body.children[0] as HTMLDivElement

    expect(nthChild(tree, 0, 0)).toBeUndefined()
    expect(nthChild(tree, 1, 0)?.nodeName).toEqual('SPAN')
})
