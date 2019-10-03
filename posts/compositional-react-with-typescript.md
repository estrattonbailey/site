---
title: "Compositional React With Typescript"
---
## Compositional React With Typescript

<p class='h3'>
Composition of components in React is one of it's strong suits. However, nesting and layering of typed components makes for some tricky inheritance. There is little documentation around this.
</p>

<br>

- [this](https://stackoverflow.com/questions/48198180/what-is-the-difference-between-react-htmlprops-and-react-htmlattributest) sorta works
  - it's a [popular solution](https://github.com/styled-components/styled-components/issues/630#issuecomment-315475109)
  - and it [used to work fine](https://github.com/ant-design/ant-design/issues/15700#issuecomment-477308252)
  - but as we [see here](https://github.com/DefinitelyTyped/DefinitelyTyped/commit/4d371be185ddd77264a8d7f30a7f7f8912738ed8#commitcomment-33286182), we need to be more specific now apparently
  
[Button demo](https://codesandbox.io/s/composed-typescript-component-problem-bpefv)

Todo: write a simpler demo as a walkthrough, and how to share prop types between files.
