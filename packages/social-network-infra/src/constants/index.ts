import { first, isEqual } from 'lodash-unified'
import { ValueRef } from '@dimensiondev/holoflows-kit'
import type { IdentityResolved } from '@masknet/plugin-infra'

export const IDENTITY_RESOLVED_DEFAULTS = new ValueRef<IdentityResolved>({}, isEqual)
