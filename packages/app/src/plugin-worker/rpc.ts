import * as Service from './service.js'
import { AsyncCall, type CallbackBasedChannel } from 'async-call-rpc/full'
import { addListener } from './message-port.js'
import { serializer } from '@masknet/shared-base'

// RPC
const channel: CallbackBasedChannel = {
    setup(jsonRPCHandlerCallback) {
        addListener('rpc', (message, _, response) => {
            jsonRPCHandlerCallback(message).then((data) => response('rpc', data))
        })
    },
}
AsyncCall(Service, { channel, log: true, serializer })
