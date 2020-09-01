import { registerMatrixAccount, loginMatrixAccount, MatrixMessage } from './matrix'
import { sideEffect } from '../../utils/side-effects'
import { createGlobalSettings } from '../../settings/createSettings'
import { v4 as uuid } from 'uuid'
import { difference } from 'lodash-es'
import { Flags } from '../../utils/flags'

const matrixAccount = createGlobalSettings<[string, string]>(
    'matrix-account',
    ['', ''],
    {
        primary: () => 'internal',
    },
    (a, b) => difference(a, b).length === 0,
)
sideEffect.then(() => matrixAccount.readyPromise).then(console.trace)
sideEffect
    .then(() => matrixAccount.readyPromise)
    .then(() => {
        if (!Flags.matrix_based_service_enabled) throw 'Not enabled in prod'
        const [username_, password_] = matrixAccount.value
        const username = username_ || 'maskbook-bot-' + uuid()
        const password = password_ || uuid()
        if (!username_ && !password_) {
            matrixAccount.value = [username, password]
            return registerMatrixAccount(username, password)
        }
        return loginMatrixAccount(username, password)
    })
    .then(([cred, client]) => new MatrixMessage(client))
    .then(console.log)
    .catch(console.warn)
