export default {
    '*': 'prettier --write --ignore-unknown',
    'packages/**/*.{ts,tsx,js,jsx}': 'eslint -c packages/.eslintrc.json --fix',
    'packages/web3-constants/**/*': () => 'pnpm --filter ./packages/web3-constants start',
    'cspell.json': () => 'gulp reorder-spellcheck',
}
