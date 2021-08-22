import { PopupRoutes, getRouteURLWithNoParam } from '..'
import urlcat from 'urlcat'

export interface SignRequest {
    // TODO: support sign binary (u8[])
    message: string
    requestID: string
    // TODO: support sign with wallet
    // TODO: support non-eth sign
    // TODO: support sign with given candidate (not displaying persona selector)
}
export function constructSignRequestURL(request: SignRequest) {
    return urlcat(getRouteURLWithNoParam(PopupRoutes.SignRequest), { message: request.message, id: request.requestID })
}
