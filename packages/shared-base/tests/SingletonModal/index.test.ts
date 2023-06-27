import { describe, expect, it, vi, beforeAll } from 'vitest'
import { SingletonModal } from '../../src/SingletonModal/index.js'

describe('SingletonModal', () => {
    const modal = new SingletonModal<void, { closeProp: number }>()
    const peek = vi.fn()
    const open = vi.fn()
    const close = vi.fn()
    const abort = vi.fn()
    let closeCallback: (props: { closeProp: number }) => void
    let rejectCallback: typeof modal.abort
    beforeAll(() => {
        modal.register((registerOnOpen, registerOnClose, registerOnAbort) => {
            closeCallback = registerOnClose
            rejectCallback = registerOnAbort
            return {
                peek,
                open,
                close,
                abort,
            }
        })
    })

    it('should register successfully', () => {
        open.mockReset()
        modal.open()
        expect(open).toBeCalledTimes(1)
    })

    it('opens and waits for closing', async () => {
        const promise = modal.openAndWaitForClose()
        closeCallback({ closeProp: 1 })
        expect(promise).resolves.toEqual({ closeProp: 1 })
    })

    it('gets rejected error', () => {
        const promise = modal.openAndWaitForClose()
        rejectCallback(new Error('Mock Error Message'))
        expect(promise).rejects.toThrow('Mock Error Message')
    })
})
