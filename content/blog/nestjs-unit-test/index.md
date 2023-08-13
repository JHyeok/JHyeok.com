---
title: NestJS에서 단위 테스트 작성하기
tags: ['Dev', 'Node.js', 'Nest.js']
date: '2020-11-01T18:52:19.102Z'
description: NestJS에서 단위 테스트를 작성하는 방법에 대해서 설명합니다.
---

이 글에서 사용하는 예제는 Jest의 Mock Function을 사용해서 Service의 단위 테스트를 작성했습니다. 예제에 사용된 코드는 [여기](https://github.com/JHyeok/nestjs-api-example/blob/master/test/unit/service/user.service.unit.spec.ts)에서 확인할 수 있습니다.

Repository를 Stub/Mock 처리하지 않고 작성한 통합 테스트 코드는 [여기](https://github.com/JHyeok/nestjs-api-example/blob/master/test/integration/user.service.int.spec.ts)에서 확인할 수 있습니다.

## TestingModule

NestJS는 내장된 종속성 주입을 사용해서 쉽게 테스트 코드를 작성할 수 있도록 도와준다. 종속성 주입은 일반적으로 클래스가 아닌 인터페이스를 기반으로 하지만, TypeScript에서 인터페이스는 런타임이 아닌 컴파일 시간에만 사용할 수 있으므로 나중에 신뢰할 수가 없기 때문에 NestJS에서는 클래스 기반 주입을 사용하는 것이 일반적이다.

```typescript{1}
import { Test } from '@nestjs/testing';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: UserRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [UserService, UserRepository],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<UserRepository>(UserRepository);
  });
}
```

NestJS에서는 특정 도구를 강제하지는 않지만 [Jest](https://www.npmjs.com/package/jest)를 기본 테스트 프레임워크로 제공해주며 테스팅 패키지도 제공하기 때문에 개발자가 다른 도구를 찾는데 소모하는 리소스를 줄일 수 있다.

NestJS에서 제공하는 `@nestjs/testing` 패키지를 사용하면 테스트에 사용되는 종속성만 선언해서 모듈을 만들고 해당 모듈로 `UserService`, `UserRepository`를 가져올 수 있다.

## Jest Mocking

```typescript
jest
  .spyOn(userRepository, 'save')
  .mockResolvedValue(savedUser);
```

[Jest](https://www.npmjs.com/package/jest)에서는 모킹(mocking) 함수들을 제공하고 있다. Mock은 단위 테스트를 작성할 때, 해당 코드가 의존하는 부분을 가짜(mcok)로 대체하는 기법이다. 일반적으로는 테스트하려는 코드가 의존하는 부분을 직접 생성하기가 너무 부담스러울 때 Mock이 사용된다.

`jest.spyOn`은 `jest.fn`과 유사한 모의 함수를 만들지만 함수 호출을 추적할 수 있다는 점에서 다르다. 위 코드에서는 `spyOn`으로 `userRepository`의 `save` 함수 호출을 모의하고 이 모의된 함수는 `mockResolvedValue`를 사용해서 `savedUser`를 반환하도록 정의하고 있다.

```typescript{1}
import * as faker from 'faker';

const firstName = faker.lorem.sentence();
const lastName = faker.lorem.sentence();
```

[faker](https://www.npmjs.com/package/Faker)를 사용해서 가짜로 테스트에 필요한 데이터들을 만들어 줄 수 있다. 개인적으로 faker로 가짜 데이터를 만드는 방법은 사용하지 않는 것을 추천한다.

## NestJS에서 단위 테스트 작성

유저를 수정하는 메서드의 단위 테스트를 작성할 것이다.

```typescript
// 해당 글 작성을 위해 Repository에 있는 코드와 조금 다릅니다.
async update(
  id: number,
  requestDto: UserUpdateRequestDto,
): Promise<User> {
  const user = await this.userRepository.findOneByUserId(userId);

  if (isEmpty(user) === true) {
    throw new NotFoundException(UserMessage.NOT_FOUND_USER);
  }

  const { firstName, lastName, isActive } = requestDto;

  user.update(firstName, lastName, isActive);

  return this.userRepository.save(user);
}
```

`UserService`의 `update` 메서드를 테스트하려고 하는데, 이 메서드에서는 두 가지를 테스트해야 한다. 유저 id에 해당하는 유저가 있으면 성공적으로 수정하고 해당하는 유저가 없을 경우에는 실패하는 로직에 대해서 검증이 필요하다.

```typescript{6,8,9,10,12,13,14}
describe('UserService', () => {
  describe('update', () => {
    it('생성되지 않은 유저의 id가 주어진다면 유저를 찾을 수 없다는 예외를 던진다', async () => {
      const userId = 1;
      const requestDto = UserUpdateRequestDto.of('길동', '김', false);
      jest.spyOn(userRepository, 'findOneByUserId').mockResolvedValue(null);
      
      const result = async () => {
        await userService.update(userId, requestDto);
      };
      
      await expect(result).rejects.toThrowError(
        new NotFoundException(UserMessage.NOT_FOUND_USER),
      );
    });
  });
})
```

위의 단위 테스트 코드에서는 생성되지 않은 유저를 수정할 때는 `findOneByUserId` 메서드가 `null`의 결괏값을 반환할 거라고 Stub 한다.

`update` 메서드는 `null`의 값이 반환되는 줄 알고 유저가 `null` 일 때 `NotFoundException`의 예외를 던진다.

Jest에서는 `rejects`와 `toThrowError`를 사용해서 이 코드가 NotFoundException을 던지는지 검증할 수 있다. [should](https://www.npmjs.com/package/should)에서 제공하는 `rejectedWith`와 비슷하다.

```typescript{9,10,11,12}
describe('UserService', () => {
  describe('update', () => {
    it('생성된 유저의 id가 주어진다면 해당 id의 유저를 수정하고 수정된 유저를 반환한다', async () => {
      const userId = 1;
      const lastName = '김';
      const firstName = '길동';
      const requestDto = UserUpdateRequestDto.of(firstName, lastName, false);
      const existingUser = User.of('재혁', lastName, true);
      const savedUser = User.of(firstName, lastName, false);
      jest
        .spyOn(userRepository, 'findOneByUserId')
        .mockResolvedValue(existingUser);
      jest.spyOn(userRepository, 'save').mockResolvedValue(savedUser);

      const result = await userService.update(userId, requestDto);

      expect(result.firstName).toBe(firstName);
      expect(result.lastName).toBe(lastName);
    });
})
```

`update` 메서드에서 id에 해당하는 유저를 찾아서 유저를 수정했다는 로직의 테스트이다.

`findOneByUserId` 메서드는 미리 정의해놓은 `existingUser`를 반환할 거라고 Stub 하고, `save` 메서드는 반환된 값을 수정해서 저장하면 `savedUser`를 반환할 것이라고 Stub 한다. 그리고 오류가 없이 정상적으로 처리된 내용을 Jest의 `expect`로 검증한다.

`UserService`의 유저를 수정하는 코드의 일부분을 살펴보았다. 전체 코드를 확인하려면 [여기](https://github.com/JHyeok/nestjs-api-example/blob/master/test/unit/service/user.service.stub.spec.ts)에서 확인할 수 있다.

![nestjs-unit-test](./nestjs-unit-test.png)

## 마치며

회사에서는 [Mocha](https://mochajs.org/)와 [sinon.js](https://sinonjs.org/)를 사용해서 테스트 코드를 작성했다. 이번에는 Jest와 Jest에서 제공하는 Mock Functions을 사용해서 테스트 코드를 작성해 보았는데 개인적으로 Jest에서 Stub을 하기 위해서 `spyOn`을 사용하는 방식이 번거롭다고 느껴졌다.

하지만 Jest는 Test Runner와 Assertion Library와 같은 기타 도구들이 기본적으로 제공되는 것이 장점이라고 느껴졌다.

> 이 글을 작성한 이후에 classicist, mockist에 대해서 알게 되었습니다. 이 두 가지에 대해서 어떤 것이 좋은지 고민을 하고 있으시다면 이규원님이 작성하신 [정말로 테스트 대역이 필요한가](https://gyuwon.github.io/blog/2020/05/10/do-you-really-need-test-doubles.html)를 한 번 읽어보시기를 추천합니다.

### Reference

- https://docs.nestjs.com/fundamentals/testing
- https://softwareengineering.stackexchange.com/questions/358491/testing-in-memory-db-vs-mocking
- https://blog.logrocket.com/unit-testing-nestjs-applications-with-jest/
- https://jestjs.io/docs/en/expect
- https://jojoldu.tistory.com/656
