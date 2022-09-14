import { AccountChecker } from './checkers/AccountChecker.js'
import { ReceiptChecker } from './checkers/ReceiptChecker.js'

export const TransactionCheckers = [new AccountChecker(), new ReceiptChecker()]
