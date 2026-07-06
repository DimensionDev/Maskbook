export type JsonRpcId = number | string | null | undefined

export interface JsonRpcRequest<Params = unknown[]> {
    jsonrpc: string
    id?: JsonRpcId
    method: string
    params?: Params
}

export interface JsonRpcError<Data = unknown> {
    code: number
    message: string
    data?: Data
}

export interface JsonRpcResponseWithResult<Result = unknown> {
    jsonrpc: string
    id: JsonRpcId
    result: Result
}

export interface JsonRpcResponseWithError<Data = unknown> {
    jsonrpc: string
    id: JsonRpcId
    error: JsonRpcError<Data>
}

export type JsonRpcResponse<Result = unknown, ErrorData = unknown> =
    | JsonRpcResponseWithResult<Result>
    | JsonRpcResponseWithError<ErrorData>
