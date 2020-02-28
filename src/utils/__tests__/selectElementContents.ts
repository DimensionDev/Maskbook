import { selectElementContents } from '../utils'

test('select element contents', () => {
    const div = document.createElement('div')
    const selection = selectElementContents(div)

    expect(selection.rangeCount).toEqual(1)
    expect(selection.getRangeAt(0).endContainer).toBe(div)
})
