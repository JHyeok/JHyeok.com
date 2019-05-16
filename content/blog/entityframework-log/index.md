---
title: Entity Framework 로그 확인하기
date: "2019-05-17T03:44:03.284Z"
---

ASP.NET MVC에서 Entity Framework를 사용해서 개발을 진행중에 실제로 쿼리가 날아가는 것을 확인하려면 외부툴을 이용해서 확인해야 했다. 하지만 외부툴을 이용안하고 디버깅 중에 확인을 할 수 있는 방법이 있다.

DB.Context에서 Database.Log를 이용한 방법이다.

```_db.Database.Log = x => System.Diagnostics.Debug.WriteLine(x);```

![dbcontext-log](./dbcontext-log.png)

VS의 디버그 모드에서 출력탭에서 날아가는 쿼리 및 로그를 확인할 수 있다. 비동기로 실행되는지 여부와 컨텍스트가 열리고 닫히는 부분도 모두 확인이 가능하다.

