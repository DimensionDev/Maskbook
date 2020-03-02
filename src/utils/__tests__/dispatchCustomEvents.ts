import { CustomEventId } from '../constants'
import { dispatchCustomEvents, pasteImageToActiveElements } from '../utils'

test('dispatch input event', () => {
    const dispatchEventSpy = spyOn(document, 'dispatchEvent')
    dispatchCustomEvents('input', 'value')
    expect(dispatchEventSpy).toHaveBeenCalled()

    const event: CustomEvent = dispatchEventSpy.calls.first().args[0]
    expect(event.type).toEqual(CustomEventId)
    expect(event.detail).toEqual(JSON.stringify(['input', ['value']]))
})

test('dispatch paste image event', () => {
    const dispatchEventSpy = spyOn(document, 'dispatchEvent')
    const payload: { type: 'image'; value: number[] } = { type: 'image', value: [] }
    dispatchCustomEvents('paste', payload)
    expect(dispatchEventSpy).toHaveBeenCalled()

    const event: CustomEvent = dispatchEventSpy.calls.first().args[0]
    expect(event.type).toEqual(CustomEventId)
    expect(event.detail).toEqual(JSON.stringify(['paste', [payload]]))
})

test('dispatch paste image event with bytes', () => {
    const dispatchEventSpy = spyOn(document, 'dispatchEvent')
    const bytes = new Uint8Array([])
    pasteImageToActiveElements(bytes)
    expect(dispatchEventSpy).toHaveBeenCalled()

    const event: CustomEvent = dispatchEventSpy.calls.first().args[0]
    expect(event.type).toEqual(CustomEventId)
    expect(event.detail).toEqual(JSON.stringify(['paste', [{ type: 'image', value: Array.from(bytes) }]]))
})
