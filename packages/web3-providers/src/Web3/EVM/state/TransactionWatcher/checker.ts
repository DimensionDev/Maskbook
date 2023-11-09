import { EVMAccountChecker } from './checkers/AccountChecker.js'
import { EVMReceiptChecker } from './checkers/ReceiptChecker.js'

export const EVMTransactionCheckers: [typeof EVMAccountChecker, typeof EVMReceiptChecker] = [
    EVMAccountChecker,
    EVMReceiptChecker,
]
