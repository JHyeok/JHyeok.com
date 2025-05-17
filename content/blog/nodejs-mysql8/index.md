---
title: Node.js에서 MySQL 8 버전에 연결할 때 발생하는 오류 해결하기
date: '2024-03-31T18:52:00.000Z'
description: Node.js에서 MySQL 8 버전에 연결할 때 발생하는 오류를 해결합니다.
---

최근에 MySQL 5에서 MySQL 8 또는 Aurora MySQL 버전 3으로 업그레이드를 했습니다.

업그레이드를 준비하면서 테스트를 진행했는데요. 그 과정에서 오래된 Node.js 애플리케이션은 MySQL을 사용할 때, 오래된 라이브러리를 사용하기 때문에 MySQL 8 또는 Aurora MySQL 버전 3에 연결할 때 오류가 발생하는 것을 확인했습니다.

## ER_NOT_SUPPORTED_AUTH_MODE

로컬에서 테스트 환경을 위해서 테스트용 DB를 도커로 사용하기 때문에 Docker Compose를 사용해서 쉽게 MySQL 8 버전을 사용하도록 할 수 있다.

```yml
version: "3.8"
services:
  db:
    # image: mysql:5.7 
    image: mysql:8.0.36
    container_name: nestjs-test-db
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_USER: ${DB_USERNAME}
      MYSQL_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
    tmpfs:
      - /var/lib/mysql
    command:
      - --character-set-server=utf8mb4
      - --collation-server=utf8mb4_unicode_ci
```

`docker-compose up -d` 명령어로 로컬에서 MySQL 8을 띄우고, Node.js 애플리케이션에서 DB에 연결하려고 했을 때, 다음과 같은 오류가 발생했다.

```bash
[Nest] 37220  - 03/31/2024, 11:35:02 AM   ERROR [TypeOrmModule] Unable to connect to the database. Retrying (1)...
Error: ER_NOT_SUPPORTED_AUTH_MODE: Client does not support authentication protocol requested by server; consider upgrading MySQL client
    // ... 생략
    --------------------
    // ... 생략
```

문제를 해결하기 위한 방법에는 두 가지가 있는데 전자는 임시적인 해결책이고 보안적으로도 문제가 있으니, 후자를 추천한다.

## mysql_native_password

MySQL 구성에서 default_authentication_plugin을 `mysql_native_password`로 설정하면 해결할 수 있다.

MySQL의 설정 파일인 my.cnf 파일에 다음과 같이 추가해서 설정할 수도 있다.

```
[mysqld]
default_authentication_plugin=mysql_native_password
```

만약 Docker 환경에서 실행하고 있다면 `command`에서 다음과 같이 추가할 수 있다. `.cnf` 파일을 사용한다면 위의 방법대로 추가하면 된다.

```yml
command:
  - --default-authentication-plugin=mysql_native_password # 추가
```

이제 MySQL 8에 접근해서 테이블을 읽을 수 있게 되었다. 이렇게 문제가 해결된 것일까? 하지만 실제로 DB와 연결을 해보면 MySQL 로그에서는 다음과 같은 경고가 발생한다.

```bash
2024-03-31T02:41:29.679667Z 8 [Warning] [MY-013360] [Server] Plugin mysql_native_password reported: ''mysql_native_password' is deprecated and will be removed in a future release. Please use caching_sha2_password instead'
2024-03-31T02:41:33.229961Z 9 [Warning] [MY-013360] [Server] Plugin mysql_native_password reported: ''mysql_native_password' is deprecated and will be removed in a future release. Please use caching_sha2_password instead'
2024-03-31T02:41:34.414837Z 10 [Warning] [MY-013360] [Server] Plugin mysql_native_password reported: ''mysql_native_password' is deprecated and will be removed in a future release. Please use caching_sha2_password instead'
2024-03-31T02:41:35.103124Z 11 [Warning] [MY-013360] [Server] Plugin mysql_native_password reported: ''mysql_native_password' is deprecated and will be removed in a future release. Please use caching_sha2_password instead'
```

위 경고는 `mysql_native_password` 플러그인이 더 이상 권장되지 않고 향후 버전에서는 제거될 것이라는 내용이다. 그러니 `caching_sha2_password` 플러그인을 사용하라고 권장하는 내용이다.

`mysql_native_password`는 MySQL의 오래된 인증 메커니즘이며, MySQL 8부터는 `caching_sha2_password`가 기본 인증 플러그인으로 사용된다.

`--default-authentication-plugin=mysql_native_password` 옵션을 사용하는 것은 MySQL 8에서 MySQL 5와의 호환성을 유지하기 위한 임시적인 해결방법이다.

## mysql2 사용하기

MySQL 5에서 MySQL 8로 마이그레이션을 하면서 Node.js 애플리케이션에서 `ER_NOT_SUPPORTED_AUTH_MODE` 오류가 발생한다면 Node.js 애플리케이션의 MySQL 연결을 위해서 [mysql](https://github.com/mysqljs/mysql)을 사용하고 있을 가능성이 높다.

[Sequelize](https://github.com/sequelize/sequelize), [TypeORM](https://github.com/typeorm/typeorm)을 사용하는 프로젝트에서는 보통 사용하려는 데이터베이스에 맞는 드라이버를 수동으로 설치하고 있다. [Sequelize v3에서는 설치 페이지](https://sequelize.org/v3/docs/getting-started/)에서 [mysql](https://github.com/mysqljs/mysql)을 MySQL 드라이버로 사용하도록 안내했었다. 하지만 최근 Sequelize는 [mysql2](https://github.com/sidorares/node-mysql2)만 설치하도록 안내하고 있다. TypeORM은 [mysql](https://github.com/mysqljs/mysql)과 [mysql2](https://github.com/sidorares/node-mysql2)에서 선택해서 설치하도록 안내하고 있다.

이 드라이버를 변경하면 해당 문제가 해결이 된다. [mysql](https://github.com/mysqljs/mysql)을 지우고 [mysql2](https://github.com/sidorares/node-mysql2)를 설치하면 오류가 발생하지 않는다.

```bash
yarn remove mysql # npm uninstall mysql  
yarn add mysql2 # npm install mysql2
```

드라이버를 변경한 이후에는 MySQL 로그에서 경고가 발생하지 않으며 처음에 발생한 `ER_NOT_SUPPORTED_AUTH_MODE` 오류도 발생하지 않는다.

### Reference

[MySQL 8.0 - Client does not support authentication protocol requested by server; consider upgrading MySQL client](https://stackoverflow.com/questions/50093144/mysql-8-0-client-does-not-support-authentication-protocol-requested-by-server)
