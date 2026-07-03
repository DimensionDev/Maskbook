/**
 * @deprecated `@privy-io/react-auth` has been removed; the embedded wallet is now
 * served by the Firefly backend directly. `PrivySetupProvider` is gone, and
 * `PrivyEnvGuard` is retained as an identity HOC so the many legacy wrapped
 * components keep compiling without changes.
 */
export function PrivyEnvGuard<T>(component: React.FunctionComponent<T>): React.FunctionComponent<T> {
    return component
}
