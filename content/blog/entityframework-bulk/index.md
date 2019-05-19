---
title: Entity Framework 6에서 대량 Insert, 대량 Update
date: "2019-05-19T16:40:03.284Z"
description: EF6의 비효율적인 Bulk Insert/Update.
---

Entity Framework 6을 사용해서 개발을 하게 된다면 특정 조건을 만족하는 대량의 로우에 업데이트를 하거나, 대량의 로우를 추가해야 할 때가 있다.

AccountCarState Table

| seq | accountId | carId | state |
| --- | --- | --- | --- |
| `1` | `145` | `1` | `1` |
| `2` | `145` | `2` | `0` |
| `3` | `142` | `3` | `1` |
| `4` | `31` | `6` | `0` |
| `5` | `31` | `4` | `0` |
| `6` | `22` | `6` | `1` |

accountId는 AccountTable의 ID이며, state는 BIT컬럼이다.

예를 들어 위와 같은 다대다의 관계를 나타내는 테이블이 있을 때, AccountID컬럼이 145인 컬럼들의 carId값을 0로 업데이트 하겠다는 로직이 있다면, 쿼리를 사용하면

```UPDATE AccountCarState SET carId=0 WHERE accountId=145 ```

를 한다면 일괄로 업데이트를 할 수 있다.

하지만 ASP.NET MVC의 Entity Framework 6을 이용해서 위와 같은 작업을 하고 실제로 쿼리가 날아가는 것을 확인하면 굉장히 비효율적으로 업데이트를 진행한다.

```
public async Task CarUpdateByAccount(int accountId)
{
    var accountCarStateEntity = _db.AccountCarState.Where(x => x.accountId == accountId);
    foreach (var accountCarState in accountCarStateEntity)
    {
      accountCarState.carId = 1;
    }
    await _db.SaveChangesAsync();
}

```

위의 코드에서 _db는 DI를 통해 주입된 context라고 가정한다. Entity Framework 6에서는 이처럼 foreach 를 이용해서 코드를 작성해야 하는데

```
_db.Database.Log = x => System.Diagnostics.Debug.WriteLine(x);
```

를 이용해서 외부 툴을 이용하지 않고 실제로 쿼리가 날아가는 것을 확인할 수 있다. 위의 코드를 추적해보면 업데이트 쿼리를 로우 당 하나씩 날리게 된다.

AccountCarState 에서 Where에 해당하는 조건을 가진 시퀸스를 n번 날린다고 생각하면 된다. 원시쿼리를 이용하면 한 줄에 끝나는 부분이 Entity Framework 6를 이용하면 비효율적인 방법을 사용하게 된다.

```
_db.AccountCarState.AddRange(carList);
await _db.SaveChangesAsync();
```

대량 Insert에서도 위처럼 AddRange를 사용해도 되지만 비효율적인 쿼리이며 성능에 문제가 있을 수 있다. (정말 많은 데이터를 넣으려고 할 때 체감할 수 있다.)

[EntityFramework.Extended](https://github.com/zzzprojects/EntityFramework.Extended)를 이용하면 성능 문제에서 벗어날 수 있지만, BulkUpdate는 오픈소스로 지원을 해주지만 BulkInsert는 더 좋은 성능을 내고 싶으면 돈을 내고 사용하거나 시험판을 무료로 이용해야 하는 것 같다.

개인적으로 성능이 중요한 부분이라면 원시쿼리를 이용하는 것이 좋은 것 같다.

---
#### Reference

[Performing Bulk Updates in Entity Framework 6.1+ Part 1](https://www.seguetech.com/performing-bulk-updatesentity-framework-6-1/)
