export interface TransformationContext {}
export function createTransformationContext(): TransformationContext {
    return Object.freeze({})
}
export const emptyTransformationContext = createTransformationContext()
