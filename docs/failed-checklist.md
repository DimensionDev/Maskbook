# Build failure / Runtime Crash Checklist

## Runtime crash

1. Run `npx gulp clean`, Cleanup cache and built files

## CI failed

1. Cannot connect to git@github.com, public key rejected
   1. Run `npx gulp fix-lockfile`

## I18n strings error

1. Run `npx gulp sync-languages`
1. Run `npx gulp i18n-codegen`
