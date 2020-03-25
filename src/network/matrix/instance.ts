import { registerMatrixAccount, loginMatrixAccount, MatrixMessage } from './matrix'
import { sideEffect } from '../../utils/side-effects'
import { createNewSettings } from '../../components/shared-settings/createSettings'
import { v4 as uuid } from 'uuid'

const matrixAccount = createNewSettings<[string, string]>('matrix-account', undefined!, { primary: () => 'internal' })
console.log(sideEffect, matrixAccount)
sideEffect.then(() => matrixAccount.readyPromise).then(console.trace)
sideEffect
    .then(() => matrixAccount.readyPromise)
    .then(() => {
        if (process.env.NODE_ENV === 'production') return Promise.reject('Not enabled in prod')
        if (!matrixAccount.value) {
            const username = 'maskbook-bot-' + uuid()
            const password = uuid()
            matrixAccount.value = [username, password]
            return registerMatrixAccount(username, password)
        } else {
            const [username, password] = matrixAccount.value
            return loginMatrixAccount(username, password)
        }
    })
    .then(([cred, client]) => new MatrixMessage(client))
    .then((msg) => {
        console.log(msg)
    })
    .catch(console.warn)
