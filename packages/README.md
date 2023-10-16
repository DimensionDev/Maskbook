# Package structure

## Code

- [mask](mask)

  The main repo of the extension

- [dashboard](dashboard)

  Next generation dashboard of Mask Network (in development)

- [shared](shared)

  Some shared data structure or utils across the project.

- [theme](theme)

  Next generation theme of Mask Network, also containing components (in development)

## Tools

- [cli](scripts)

  Because our project is using TypeScript project reference and code generation, to make the build process work normally, those process must run before any other commands.

  This package provides two command to wrap the other commands.

## Resources

- [contracts](contracts)

  Contains generated code from the ETH contracts.

- [icons](icons)

  Contains SVG icons (as React component) in the project
