---
title: TypeScript로 Nuxt 개발하기 - 2
tags: ["Dev", "Nuxt.js"]
date: "2020-01-16T00:11:44.352Z"
description: Nuxt에서 코드 스타일을 검사하는 Lint와 테스트 라이브러리인 Jest를 TypeScript 환경에서 사용해봅니다.
---

- TypeScript로 Nuxt 개발하기 시리즈
  - [TypeScript 환경으로 Nuxt 개발](https://jhyeok.com/nuxt-with-typescript/)
  - [TypeScript Lint, Jest 환경 구성](https://jhyeok.com/nuxt-with-typescript-lint-jest/)

TypeScript로 Nuxt 개발하기 시리즈에 사용된 소스코드는 [여기](https://github.com/JHyeok/nuxt-typescript-sample)에서 확인할 수 있다.

이전 시리즈에서는 TypeScript 환경에서 Nuxt를 개발하는 환경을 구성해보았다. 이번에는 코드 스타일을 검사하는 Lint와 테스트 라이브러리인 Jest를 TypeScript 환경에서 사용하는 방법에 대해 설명한다.

### ESLint 적용

아마 현재 프로젝트에는 ESLint가 활성화되어 있을 것인데, 이것을 TypeScript용으로 구성해주면 된다. TSLint를 사용하지 않는 이유는 TSLint가 이제 업데이트를 중단했기 때문이다. 관련 내용은 [여기](https://github.com/palantir/tslint/issues/4534)에서 확인할 수 있다.

먼저 `@nuxtjs/eslint-config`를 지우고 `@nuxtjs/eslint-config-typescript`를 설치한다.

```
yarn remove @nuxtjs/eslint-config
yarn add -D @nuxtjs/eslint-config-typescript
```

`.eslintrc.js`를 수정한다.

```javascript
module.exports = {
  extends: [
    '@nuxtjs/eslint-config-typescript'
  ]
}
```

혹시 `.js` 파일이어서 `javascript`를 사용하는 것에 거부감이 있다면 `.json` 파일로 생성해도 된다. 필자는 100% TypeScript를 사용하고 싶어서 아래처럼 `.json` 파일로 만들었다.

`.eslintrc.json`

```json
{
  "root": true,
  "env": {
    "browser": true,
    "node": true
  },
  "parserOptions": {
  },
  "extends": [
    "@nuxtjs/eslint-config-typescript"
  ],
  "rules": {
  }
}
```


마지막으로 `lint` 스크립트를 사용할 수 있도록`package.json`을 수정한다.

```json
"lint": "eslint --ext .ts,.js,.vue ."
```

주의할 점은 `parserOptions`에 `babel-eslint`가 있다면 제거해주어야 한다. 그리고 Lint에 사용되는 규칙들을 수정하거나 재정의하려면 [여기](https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#supported-rules)를 참고하면 된다.

`eslint-config-typescript/index.js`

```javascript
module.exports = {
  extends: [
    '@nuxtjs'
  ],
  plugins: ['@typescript-eslint'],
  parserOptions: {
    parser: '@typescript-eslint/parser'
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { args: 'all', argsIgnorePattern: '^_' }]
  }
}
```

위에서 설치한 `nuxtjs/eslint-config-typescript`를 확인해보면 내부적으로 `@typescript-eslint/parser`를 parser로 사용하기 때문이다.

### Jest

Jest를 TypeScript 환경에서 개발하기 위해서는 `ts-jest`와 `@types/jest`를 설치한다.

```
yarn add -D ts-jest @types/jest
```

`tsconfig.json`를 수정한다.

```json
{
  "compilerOptions": {
    "types": ["@types/jest"]
  }
}
```

`jest.config.js`가 ts확장자를 읽을 수 있도록 수정한다. `jest.config.js`를 사용하지 않고 `package.json`에 `jest` 옵션을 추가해서 사용해도 된다.

`jest.config.js`

```javascript
module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^~/(.*)$': '<rootDir>/$1'
  },
  transform: {
    '^.+\\.ts?$': 'ts-jest',
    '.*\\.(vue)$': 'vue-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'vue', 'json']
};
```

또는

`package.json`

```json
  "jest": {
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/$1",
      "^~/(.*)$": "<rootDir>/$1",
      "^vue$": "vue/dist/vue.common.js"
    },
    "moduleFileExtensions": ["ts", "js", "vue", "json"],
    "transform": {
      "^.+\\.ts$": "ts-jest",
      ".*\\.(vue)$": "vue-jest"
    },
    "collectCoverage": true,
    "collectCoverageFrom": [
      "<rootDir>/components/**/*.vue",
      "<rootDir>/pages/**/*.vue"
    ]
  },
```

`vue-shim.d.ts`를 추가하여 `.vue`파일에 대한 유형을 제공해야 한다. `.vue`파일에 대해서 이제 TypeScript가 인식할 수 있다.

```typescript
// vue-shim.d.ts
declare module "*.vue" {
  import Vue from 'vue'
  export default Vue
}
```

마지막으로 `test/Logo.spec.js`를 `test/Logo.spec.ts`로 확장자를 변경하고 `yarn test`로 Jest를 실행해서 테스트가 정상적으로 완료되는지 확인한다.

```typescript
yarn run v1.21.1
$ jest
 PASS  test/Logo.spec.ts
  Logo
    √ is a Vue instance (14ms)

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        3.679s, estimated 16s
Ran all test suites.
Done in 4.60s.
```

### 마치며

Nuxt.js 2.9 버전 이후로 TypeScript를 적용하는 방법이 기존과는 조금 달라졌다. 기존 한국어 자료를 바탕으로 진행을 하다가 진행이 막혀서 직접 공식 가이드를 보고 적용을 하면서 방법이 많이 달라진 것을 느끼고 TypeScript로 Nuxt 개발하기를 작성했다.

---
### Reference

https://typescript.nuxtjs.org/guide/

https://medium.com/@Al_un/nuxt-vuex-jest-tested-powered-by-typescript-70441600ef39

https://ideveloper2.tistory.com/140

https://joshua1988.github.io/vue-camp/nuxt/intro.html#nuxt-%ED%8A%B9%EC%A7%95