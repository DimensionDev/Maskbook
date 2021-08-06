import { DialogRoutes, getRouteURLWithNoParam } from '..'

export interface SignRequest {
    // TODO: support sign binary (u8[])
    message: string
}
export function constructSignRequestURL(request: SignRequest) {
    return `${getRouteURLWithNoParam(DialogRoutes.SignRequest)}?message=${request.message}`
}
