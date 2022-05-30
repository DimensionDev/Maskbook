import { AccountChecker } from './checkers/AccountChecker'
import { ReceiptChecker } from './checkers/ReceiptChecker'

export const TransactionCheckers = [new AccountChecker(), new ReceiptChecker()]
