import { decodeFunctionData, type Abi } from 'viem'
import type { ExtractAbiFunctionNames, ExtractAbiFunction, AbiParametersToPrimitiveTypes } from 'abitype'

export function decodeFunctionParams<InputAbi extends Abi, MethodName extends ExtractAbiFunctionNames<InputAbi>>(
    abi: InputAbi,
    data: `0x${string}`,
    methodName: MethodName,
): AbiParametersToPrimitiveTypes<ExtractAbiFunction<InputAbi, MethodName>['inputs'], 'inputs', true> {
    const { functionName, args } = decodeFunctionData({ abi, data })
    if (functionName !== methodName) {
        throw new Error(`Function Signature not matched! name: ${functionName}, expected: ${String(methodName)}`)
    }
    return args as any
}
