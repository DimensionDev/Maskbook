import { DialogRoutes, getRouteURLWithNoParam } from '..'

export interface SignRequest {
    // TODO: support sign binary (u8[])
    message: string
    requestID: string
    // TODO: support sign with wallet
    // TODO: support non-eth sign
    // TODO: support sign with given candidate (not displaying persona selector)
}
export function constructSignRequestURL(request: SignRequest) {
    const params = new URLSearchParams()
    params.set('message', request.message)
    params.set('id', request.requestID)
    return `${getRouteURLWithNoParam(DialogRoutes.SignRequest)}?${params.toString()}`
}
