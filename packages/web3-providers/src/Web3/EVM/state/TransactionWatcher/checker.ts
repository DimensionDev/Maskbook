import { AccountChecker } from './checkers/AccountChecker.js'
import { ReceiptChecker } from './checkers/ReceiptChecker.js'

export const TransactionCheckers: [typeof AccountChecker, typeof ReceiptChecker] = [AccountChecker, ReceiptChecker]
