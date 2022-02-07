import type { LiveSelector } from '@dimensiondev/holoflows-kit'
import { querySelector } from '../../utils/selector'

type E = HTMLElement
export const selector = ''
export const postActionsSelector: () => LiveSelector<E, true> = () =>
    querySelector<E>('[data-testid="tweet"] [role="group"]')
