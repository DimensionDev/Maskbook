import type { Transaction, UserOperation } from "../types/index.js";

/**
 * Compose UserOperation from a normal transaction
 * @param transaction 
 */
export function encodeUserOperation(transaction: Transaction): UserOperation {
    throw new Error('To be implemented')
}

/**
 * Decode UserOperation to a normal transaction (only in-memory transaction will not send as transaction)
 */
export function decodeUserOperation(userOperation: UserOperation): Transaction {
    throw new Error('To be implemented')
}

/**
 * Decode user operations from a entrypoint handleOps transaction
 * @param transaction 
 */
export function decodeUserOperations(transaction: Transaction): UserOperation[] {
    throw new Error('To be implemented')
}