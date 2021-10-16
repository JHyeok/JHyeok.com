---
title: Nuxt.js에서 웹폰트 적용하기
tags: ["Dev", "Nuxt.js"]
date: "2019-11-25T21:17:34.284Z"
description: Nuxt.js에서 웹폰트를 적용하면서 겪은 문제와 해결방법을 공유합니다.
---

웹폰트를 Nuxt.js 전역 페이지에 적용하는 방법을 설명한다. 아래는 필자가 처음에 시도했던 방법이었고 이 방법이 프로덕션에서 제대로 적용이 되지 않는 것을 확인하고 다른 방법을 사용해서 해결했다.

처음 필자가 시도했던 방법이다.

`assets/fonts/nanumsquareround.css` 생성

```css
@import url('https://cdn.rawgit.com/innks/NanumSquareRound/master/nanumsquareround.min.css');

body {
  font-family: 'NanumSquareRound', sans-serif;
}
```

`nuxt.config.js`를 수정
```javascript
  css: [
    '~/assets/fonts/nanumsquareround.css'
  ],
```

위의 방법대로 하면 개발 환경에서 웹폰트가 정상적으로 적용된다. 하지만, 배포 환경에서는 적용이 되지 않는다는 것을 확인했다. 실제 위 방법으로 웹폰트를 적용했다면 로컬 환경에서 `npm run build`로 빌드 이후에 `npm run start`로 프로덕션 모드로 서버를 시작한다면 적용이 되지 않는 것을 확인할 수 있다.

해당 문제는 link 방식을 사용하면 해결이 된다.

`assets/fonts/nanumsquareround.css`를 제거하고 `nuxt.config.js`를 다시 원래대로 되돌린다.

`nuxt.config.js`를 수정

```
  head: {
// ...
    link: [
      {
        rel: 'stylesheet',
        type: 'text/css',
        href:
          'https://cdn.rawgit.com/innks/NanumSquareRound/master/nanumsquareround.min.css'
      }
    ]
  },
```

위의 코드처럼 link방식으로 수정을 하면 프로덕션 모드로 실행을 해도 웹폰트가 적용된다.

---
## Reference

https://github.com/innks/NanumSquareRound