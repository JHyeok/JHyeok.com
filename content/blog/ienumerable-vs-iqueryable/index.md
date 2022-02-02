---
title: IEnumerable vs IQueryable
tags: ["Dev", "C#"]
date: "2019-06-08T11:11:03.284Z"
description: IEnumerable과 IQueryable의 차이를 설명합니다.
---

이 글은 처음에 `IEnumerable vs IQueryable` 관련된 여러 글을 읽었는데 가장 이해가 잘 되었던 `stackoverflow`의 글을 참고해서 적은 글이다.

`IEnumerable vs IQueryable`

가장 큰 차이점은 `IQueryable`는 `LINQ-to-SQL(LINQ.-to-anything)`이 작동하도록 하는 인터페이스입니다. 따라서 쿼리를 더 세분화 `IQueryable`하면 가능한 경우 해당 쿼리가 데이터베이스에서 실행된다.
`IEnumerable`는 `LINQ-to-object`가 되므로 원래 쿼리와 일치하는 모든 개체가 데이터베이스의 메모리에 로드되어야 한다.

아래 두 코드를 보면서 차이점을 살펴보자.

```csharp
IEnumerable<Article> articles = ArticlesService.getArticlesWithEnumerable();
var notcieArticles = articles.Where(a => a.IsNotice);
```

```csharp
IQueryable<Article> articles = ArticlesService.getArticlesWithQueryable();
var notcieArticles = articles.Where(a => a.IsNotice);
```

`IQueryable` 코드는 공지사항을 선택하기 위해 SQL을 실행한다. `IEnumerable` 코드는 데이터베이스에서 원래 쿼리를 실행한 다음 메모리에 공지사항을 필터링한다.

이것은 매우 중요한 차이점이며 `IQueryable`이 많은 경우 데이터베이스에서 너무 많은 행을 반환하지 않도록 할 수 있다.
또 다른 좋은 예는 페이징을 하고 있다면 `Take` 및 `Skip`에 `IQueryable`, 필요한 행의 수를 얻을 것이다.
이 작업을 `IEnumerable`을 사용한다면 모든 행이 메모리에 로드된다.

`IEnumerable`과 `IQueryable`의 주요 차이점은 필터 로직이 실행되는 위치에 관한 것이다. 하나는 클라이언트 측 (메모리 내)에서 실행되고 다른 하나는 데이터베이스에서 실행된다.

예를 들어 데이터베이스의 사용자에 대해 10,000개의 레코드가 있고 활성 사용자 인 900 개의 레코드만 있다고 가정하면 이 경우 `IEnumerable`을 사용하면 먼저 메모리에 10,000개의 레코드를 모두 로드하고 IsActive 필터를 적용하여 결국 900 명의 활성 사용자를 반환한다.

반면에 `IQueryable`을 사용하는 경우 동일한 케이스에서 데이터베이스에 IsActive 필터를 직접 적용하여 900 명의 활성 사용자를 직접 반환한다.

||IEnumerable|iQueryable|
|------|---|---|
|Namespace|System.Collections 네임 스페이스|System.Linq 네임 스페이스|
|Deferred Execution|지원|지원|
|Lazy Loading|미지원|지원|
|How does it work|데이터베이스에서 데이터를 쿼리하는 동안 서버 측에서 쿼리를 IEnumerable실행 select하고 클라이언트 측에서 메모리에 데이터를로드 한 다음 데이터를 필터링합니다. 따라서 더 많은 작업을 수행하고 느려집니다.|데이터베이스에서 데이터를 쿼리하는 동안 모든 필터를 사용하여 서버 측에서 쿼리를 IQueryable실행 select합니다. 따라서 작업이 줄어들고 빨라집니다.|
|적합|LINQ to Object 및 LINQ to XML 쿼리|LINQ to SQL 쿼리|
|Custom Query|지원|지원|
|Extension method parameter|지원되는 확장 메서드 IEnumerable는 기능적 오브젝트를 사용합니다.|지원되는 확장 메서드 IEnumerable는 표현식 오브젝트 (예 : 표현식 트리)를 사용합니다.|
|When to use|메모리 등으로부터 수집 된 데이터를 조회하면 List, Array 등|원격 메모리, 서비스와 같은 메모리 부족 컬렉션에서 데이터를 쿼리 할 때|
|Best Uses|인 메모리 순회|페이징|

codeproject에서 찾은 차이점을 잘 정리한 표이다. 적절한 사용용도에 사용하는 것이 중요하다.

### Reference
- https://stackoverflow.com/questions/2876616/returning-ienumerablet-vs-iqueryablet
- https://www.codeproject.com/Articles/732425/IEnumerable-Vs-IQueryable