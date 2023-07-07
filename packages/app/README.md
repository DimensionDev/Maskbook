<!-- cspell:disable -->

# @masknet/app

This package is a SPA that provides a normal Web page that can decrypt public Mask messages and run a limited set of functionality of Mask plugins.

## Development

```bash
npm run start

# another console
npm run watch:css
```

## Payloads

Below payloads are preset for local development. It works by copying the payload and inserting it into the template: `https://localhost:8000/?PostData_v2=[PAYLOAD]`.

| Plugin       | Payload                                                                                                                                                                                                                                                                          |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gitcoin      | `AJcAwMDAwJMAxCABzn3fyBtzQ1rTcmDnKVue64WtOlxYsopDON%2FUC0ztfsQQ%2FZJOgMlb9P633qQUvqvzC8Rkdg4FMWJYMDsSGNggTqCsCU0LGPYs4iRNjkBw8lzWAnKblQ2mXvtYK7tAJlJBAJL7Op6e6PxeswNJgZq6v9e%2FIM%2BycvJFMQiK94nFrT6b4wCovNOgO%2Byi1aeY9G8nFabvwh4xVg%3D%3D`                                     |
| Collecible   | `AJcAwMDAwJMAxCD%2FMmZIj%2Bni1telirjexX7roLQVM%2FOjjhF1CmM6Czs538QQ9Z7mT47VWJSlCgKPR%2FWYscRmga4Vq56SbBZPFiHTMFy1f1jFd84vZyfRFiynpWX9zhSuzzoE89mMOKbVpoAe4jNHPq63IiQ50EEMpLbKio8%2FEsVaT9O4khuPVajiJPW6s9hfbEuANkxdvdl5o%2BI2d8ImmRBbrjRN`                                       |
| ArtBlocks    | `AJcAwMDAwJMAxCBcNk0wug%2FGrK0mv8htvRTc2sHiMltmiYj2sZCYu3p0JsQQSsDB4mn5uPzaqGu5BZjlIsR5yLH55Ym8X8v1A0Kyju6l3NuJCQt7ZRp3sHhXH9O8%2B1LHcyyKc98WOc9RBvNsbbJDDKkZvD%2B0lsKTO1LiNLeaGQhtm5dD38xzPs55z23OiGOZ5OO8Dn2Z29zRNJTaqPxtRcMStcdkyp9fObgl%2BhGyil1iT9pToipMdA%3D%3D`           |
| Snapshot     | `AJcAwMDAwJMAxCDNJtsiAHOKP%2BuftSMH1OLIqtCvl1ndBAeVbZQvJdanU8QQ6mxBTWmwMpwodQ6RopTXV8SCvVjkiM10TyYpHRkaZlBQSZipHRJMVoTspw1oI3t76OHn51bc0syCt2rMyRvabuy5mBHxdFfaJL0dwGvrvstZkasD0zkvG1xArNdFTW3237k27gO%2BJ42czyt80vwgs1Lcw19FOumgBc%2FQCHZUjaTHmqO3AKuafp9BnOfxg0rAz1NM6w%3D%3D` |
| CyberConnect | `AJcAwMDAwJMAxCBIrE8Q3aH2T%2BbHxTj4b%2Bb7RTqkSDftb0Alf4MuukGll8QQoBlmORslBcdYJO%2BM5y5JvMRFNFjxZAN3YKJ9mwI5wajPXtrpQkIARRru%2B4KtlGOiMYN1ne5XSzFuCeYfNyPSsLGuzbCd91uHniQxXlz9lBEsMR0SPObj`                                                                                       |
