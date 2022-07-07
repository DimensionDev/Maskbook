import type { TokenSecurity } from '.'
import { SecurityMessageLevel } from './Common'
import { SecurityMessages } from './rules'

export const isHighRisk = (tokenSecurity?: TokenSecurity) => {
    if (!tokenSecurity) return false
    return tokenSecurity.trust_list === '1'
        ? false
        : SecurityMessages.filter(
              (x) =>
                  x.condition(tokenSecurity) && x.level !== SecurityMessageLevel.Safe && !x.shouldHide(tokenSecurity),
          )
              .sort((a) => (a.level === SecurityMessageLevel.High ? -1 : 1))
              .filter((x) => x.level === SecurityMessageLevel.High).length > 0
}

export const getMessageList = (tokenSecurity: TokenSecurity) =>
    tokenSecurity.trust_list === '1'
        ? []
        : SecurityMessages.filter(
              (x) =>
                  x.condition(tokenSecurity) && x.level !== SecurityMessageLevel.Safe && !x.shouldHide(tokenSecurity),
          ).sort((a) => (a.level === SecurityMessageLevel.High ? -1 : 1))
