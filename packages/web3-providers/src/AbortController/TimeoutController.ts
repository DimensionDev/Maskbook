import type { AbortControllerAPI } from '../types/AbortController.js'

export class TimeoutControllerAPI implements AbortControllerAPI.Provider {
    create(duration: number, reason = 'Timeout') {
        const controller = new AbortController()

        const timer = setTimeout(() => {
            if (!controller.signal.aborted) controller.abort(reason)
        }, duration)

        controller.signal.addEventListener('abort', () => {
            clearTimeout(timer)
        })

        return controller
    }
}
