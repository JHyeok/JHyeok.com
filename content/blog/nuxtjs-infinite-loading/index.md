---
title: Nuxt.js에서 무한 스크롤링 구현하기
tags: ["dev", "nuxt.js"]
date: "2019-10-15T21:09:10.284Z"
description: Nuxt.js에서 vue-infinite-loading 패키지를 이용해서 무한 스크롤링을 구현해봅니다.
---

필자는 최근 `Nuxt.js`로 사내 내부 툴을 만드는 프로젝트를 하게 되었다. 무한 스크롤링 기능이 필요해서 `npm`에 있는 몇 개의 패키지들을 설치해서 적용해보았고, 그중 가장 마음에 드는 패키지를 하나 소개하면서 `Nuxt.js`에서 적용하는 방법을 설명하려 한다.

`create-nuxt-app v2.10.1`을 사용해서 만든 `Nuxt SSR App`이며 사용한 패키지는 [`vue-infinite-loading`](https://github.com//PeachScript/vue-infinite-loading)이다.

1. 패키지 설치

```
npm install vue-infinite-loading -S
or
yarn add vue-infinite-loading -S
```

패키지 설치를 마쳤으면 `Nuxt App`이 실행되기 전에 플러그인을 설정해주어야 한다.

2. `plugins/vue-infinite-loading.js` 생성

```javascript
import Vue from 'vue';
import InfiniteLoading from 'vue-infinite-loading';

Vue.use(InfiniteLoading, { /* options */ });
```

3. `nuxt.config.js` 수정

```javascript
module.exports = {
  mode: 'universal',
  // ... 중략
  plugins: [
    { src: '~/plugins/vue-infinite-loading.js', mode: 'client' }
  ],
  // ... 중략
}
```

클라이언트에서만 사용할 것이기 때문에 `mode: 'client'`을 추가한다.\
`Nuxt.js 2.4` 미만의 버전에서는 `ssr: false`를 사용해야 한다.

4. 전역에서 사용 가능하기 때문에 원하는 템플릿에서 사용

```javascript
    <infinite-loading @infinite="infiniteHandler" spinner="spiral">
      <div slot="no-more">No more message</div>
      <div slot="no-results">No results message</div>
      <div slot="error" slot-scope="{ trigger }">
        Error message, click
        <a href="javascript:;" @click="trigger">here</a> to retry
      </div>
    </infinite-loading>
```

```javascript
export default {
  methods: {
    infiniteHandler($state) {
      setTimeout(() => {
        this.datas.push(...sampleData);
        $state.loaded();
      }, 1000);
    }
  }
};
```

`spinner="spiral"`를 이용해서 `infitite-loading` 모듈에서 제공해주는 `loading spinner`를 사용 가능하다.

위의 예시 코드에서는 `loading spinner`의 테스트를 위해서 `setTimeout`을 넣어보았다.

### 마치며

무한 스크롤링에서 가장 중요한 것은 어떠한 환경에서도 작동이 되어야 한다는 것이다. 크롬의 90% 줌 상태에서도 오류 없이 작동을 해야 하고 최적화가 잘 되어 있어야 하는데 [`vue-infinite-loading`](https://github.com//PeachScript/vue-infinite-loading)는 최적화도 잘 되어 있었으며 `Vue.js`, `Nuxt.js`에서 사용하기 좋았다. 

---
### Reference

https://github.com//PeachScript/vue-infinite-loading

https://peachscript.github.io/vue-infinite-loading/guide/
