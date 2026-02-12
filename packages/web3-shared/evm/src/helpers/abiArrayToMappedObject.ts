import type {
    AbiParameter,
    AbiParameterKind,
    AbiParameterToPrimitiveType,
    Abi,
    ExtractAbiFunction,
    ExtractAbiFunctionNames,
} from 'abitype'

/**
 * Convert [a: type1, b: type2] to { a: type1, b: type2 }.
 * This function only converts the top level data.
 */
export function abiArrayToMappedObject<inputAbi extends readonly AbiParameter[]>(
    inputAbi: inputAbi,
    data: readonly unknown[],
): AbiParametersToPrimitiveTypesObjectMapped<inputAbi> {
    const result: Record<string, any> = {}
    inputAbi.forEach((param, index) => {
        result[index] = data[index]
        if (param.name) {
            result[param.name] = data[index]
        }
    })
    return result as any
}

export type AbiParametersToPrimitiveTypesObjectMapped<
    abiParameters extends readonly AbiParameter[],
    abiParameterKind extends AbiParameterKind = AbiParameterKind,
> = AbiParametersToPrimitiveTypesObjectMapped_inner<abiParameters, abiParameterKind>

export type AbiFunctionToObjectMapped<
    abi extends Abi,
    method extends ExtractAbiFunctionNames<abi>,
    abiParameterKind extends AbiParameterKind,
> = AbiParametersToPrimitiveTypesObjectMapped<ExtractAbiFunction<abi, method>[abiParameterKind], abiParameterKind>

type AbiParametersToPrimitiveTypesObjectMapped_inner<
    abiParameters extends readonly AbiParameter[],
    abiParameterKind extends AbiParameterKind = AbiParameterKind,
    ///
    acc = unknown,
    depth extends readonly number[] = [],
> =
    depth['length'] extends 15 ? readonly unknown[]
    : abiParameters extends (
        readonly [
            // Significantly reduce type instantiations by batch proccessing up to six parameters at a time instead of processing one parameter per recursion
            infer head1 extends AbiParameter,
            infer head2 extends AbiParameter,
            infer head3 extends AbiParameter,
            infer head4 extends AbiParameter,
            infer head5 extends AbiParameter,
            infer head6 extends AbiParameter,
            ...infer tail extends readonly AbiParameter[],
        ]
    ) ?
        AbiParametersToPrimitiveTypesObjectMapped_inner<
            tail,
            abiParameterKind,
            acc &
                ToObject<head1, abiParameterKind> &
                ToObject<head2, abiParameterKind> &
                ToObject<head3, abiParameterKind> &
                ToObject<head4, abiParameterKind> &
                ToObject<head5, abiParameterKind> &
                ToObject<head6, abiParameterKind>,
            [...depth, 1]
        >
    : abiParameters extends (
        readonly [
            infer head1 extends AbiParameter,
            infer head2 extends AbiParameter,
            infer head3 extends AbiParameter,
            infer head4 extends AbiParameter,
            infer head5 extends AbiParameter,
        ]
    ) ?
        acc &
            ToObject<head1, abiParameterKind> &
            ToObject<head2, abiParameterKind> &
            ToObject<head3, abiParameterKind> &
            ToObject<head4, abiParameterKind> &
            ToObject<head5, abiParameterKind>
    : abiParameters extends (
        readonly [
            infer head1 extends AbiParameter,
            infer head2 extends AbiParameter,
            infer head3 extends AbiParameter,
            infer head4 extends AbiParameter,
        ]
    ) ?
        acc &
            ToObject<head1, abiParameterKind> &
            ToObject<head2, abiParameterKind> &
            ToObject<head3, abiParameterKind> &
            ToObject<head4, abiParameterKind>
    : abiParameters extends (
        readonly [infer head1 extends AbiParameter, infer head2 extends AbiParameter, infer head3 extends AbiParameter]
    ) ?
        acc & ToObject<head1, abiParameterKind> & ToObject<head2, abiParameterKind> & ToObject<head3, abiParameterKind>
    : abiParameters extends readonly [infer head1 extends AbiParameter, infer head2 extends AbiParameter] ?
        acc & ToObject<head1, abiParameterKind> & ToObject<head2, abiParameterKind>
    : abiParameters extends readonly [infer head extends AbiParameter] ? acc & ToObject<head, abiParameterKind>
    : acc extends readonly [] ?
        abiParameters extends readonly [] ?
            readonly []
        :   readonly unknown[]
    :   acc

type unwrapName<type, name> = name extends string ? { [key in name]: type } : { [key in never]: never }

type ToObject<abiParameter extends AbiParameter, abiParameterKind extends AbiParameterKind> = unwrapName<
    AbiParameterToPrimitiveType<abiParameter, abiParameterKind>,
    abiParameter['name']
>
