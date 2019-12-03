---
title: Nuxt.js Components props
tags: ["dev", "Nuxt.js"]
date: "2019-12-03T21:36:20.184Z"
description: Nuxt.js에서 Components를 사용하는 방법에 대해서 설명합니다.
---

`props`를 사용할 때, `HTML`에서는 `kebab-case(article-data)`를 사용하는 것을 권장한다.

`Javascript`에서는 `camelCase(articleData)`를 사용하는 것을 권장한다.

```html
<article-card article-data="article"></article-card>
```

Nuxt.js 최신버전(2.10)에서는 props을 아래와 같이 쓰는 것을 권장한다. 기존 방식 `props: ['articleData']`를 사용하면 `eslint(vue/require-prop-types)`에 위반되서 경고가 표시된다.

```javascript
export default {
  props: {
    articleData: {
      type: Array,
      default: []
    }
  }
}
```

Vue.js 가이드에 나와있는 사용할 수 있는 type이다.

- String
- Number
- Boolean
- Array
- Object
- Date
- Function
- Symbol

Components의 props에서 Function type을 사용할 때는 default를 어떻게 설정을 해야 할지 몰랐다.
stackoverflow에서 나와 같은 궁금증을 가진 질문을 봤고 좋은 답안이 있었다.

```javascript
props: {
    clickFunction: {
        type: Function
        default: ????
    }
}
```

아래 처럼 하면 된다.

```javascript
props: {
  clickFunction: {
    type: Function
    default: () => {}
  }
}

props: {
  someObject: {
    type: Object
    default: () => ({})
  }
}
```

---
### Reference

https://beomy.tistory.com/56 

https://stackoverflow.com/questions/53659450/props-should-at-least-define-their-types

https://vuejs.org/v2/guide/components-props.html#Prop-Types

https://stackoverflow.com/questions/53659719/vue-default-value-for-prop-function