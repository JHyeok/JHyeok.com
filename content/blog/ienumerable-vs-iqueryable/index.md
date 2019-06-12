---
title: IEnumerable vs IQueryable
date: "2019-06-08T11:11:03.284Z"
description: IEnumerable과 IQueryable의 차이를 설명합니다.
---

이 글은 처음에 IEnumerable vs IQueryable 관련된 여러 글을 읽었는데 가장 이해가 잘 되었던 stackoverflow의 글을 참고해서 적은 글입니다.

IEnumerable vs IQueryable

가장 큰 차이점은 IQueryable는 LINQ-to-SQL(LINQ.-to-anything)이 작동하도록 하는 인터페이스입니다. 따라서 쿼리를 더 세분화 IQueryable하면 가능한 경우 해당 쿼리가 데이터베이스에서 실행됩니다.
IEnumerable는 LINQ-to-object가 됩니다. 즉 원래 쿼리와 일치하는 모든 개체가 데이터베이스의 메모리에 로드되어야 합니다.

코드를 보면서 살펴보겠습니다.

```csharp
IEnumerable<Article> articles = ArticlesService.getArticlesWithEnumerable();
var notcieArticles = articles.Where(a => a.IsNotice);
```

```csharp
IQueryable<Article> articles = ArticlesService.getArticlesWithQueryable();
var notcieArticles = articles.Where(a => a.IsNotice);
```

IQueryable 코드는 공지사항을 선택하기 위해 SQL을 실행합니다. IEnumerable 코드는 데이터베이스에서 원래 쿼리를 실행한 다음 메모리에 공지사항을 필터링합니다.

이것은 매우 중요한 차이점이며 IQueryable이 많은 경우 데이터베이스에서 너무 많은 행을 반환하지 않도록 할 수 있습니다.
또 다른 좋은 예는 페이징을 하고 있다면 Take 및 Skip에 IQueryable, 필요한 행의 수를 얻을 것입니다.
이 작업을 IEnumerable을 사용한다면 모든 행이 메모리에 로드됩니다.

```IEnumerable```과 ```IQueryable```의 주요 차이점은 필터 로직이 실행되는 위치에 관한 것입니다. 하나는 클라이언트 측 (메모리 내)에서 실행되고 다른 하나는 데이터베이스에서 실행됩니다.

예를 들어 데이터베이스의 사용자에 대해 10,000개의 레코드가 있고 활성 사용자 인 900 개의 레코드만 있다고 가정하면 이 경우 ```IEnumerable```을 사용하면 먼저 메모리에 10,000개의 레코드를 모두 로드하고 IsActive 필터를 적용하여 결국 900 명의 활성 사용자를 반환합니다.

반면에 ```IQueryable```을 사용하는 경우 동일한 케이스에서 데이터베이스에 IsActive 필터를 직접 적용하여 900 명의 활성 사용자를 직접 반환합니다.

---
### Reference

https://stackoverflow.com/questions/2876616/returning-ienumerablet-vs-iqueryablet

