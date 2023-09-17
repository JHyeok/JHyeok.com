---
title: MongoDB.local Seoul 2023
tags: ['세미나']
date: '2023-09-17T12:36:00.000Z'
description: MongoDB.local Seoul 2023에 참여해서 발표자분들의 발표를 듣고 정리한 내용입니다.
---

[작년](https://jhyeok.com/mongodb-day-seoul-2022/)에 이어 이번에도 MongoDB.local Seoul 2023을 다녀왔습니다.

## DevOps Engineer의 저녁이 있는 삶, MongoDB Atlas 도입기 (임성빈 프로, 삼성전자 DA사업부 AI Solution 그룹)
- 스마트홈 서비스 MongoDB Atlas 도입, 샤딩까지 어떻게 했는지
- MongoDB Atlas를 도입하고 DB 장애건수 0건
사용자 기기를 등록하는 서버 DB를 MySQL로 2014년에 처음 시작 (개발 및 운영 시작)
- 2015년에 스마트홈에 실제 기기에서 발생하는 실시간 이벤트 데이터를 수집하고 이 수집된 데이터를 전처리해서 외부에 공유하는 API를 오픈
- 실제 가전의 데이터가 JSON 포맷 
NoSQL 도입 결정
- 2015년에 EC2에 MongoDB 커뮤니티 버전을 사용해서 자체 구축해서 사용
- 초기에는 문제가 없었음
- 트래픽이 적었기 때문, 트래픽이 늘어나면서 점점 병목이 발생
- MongoDB DBA 인력 없음
- 커뮤니티 버전 오픈소스에 대한 기술 지원을 받기 어려웠음
- 가용성 보장을 위해 MongoDB 기술적인 백그라운드가 기반이 되어야지 잘 구성을 할 수 있는데 좀 부족했음 
- 모니터링을 하는데 어려움을 느꼈음
- Max IOPS 30k (peak season)
마이그레이션
- MongoDB Cluster(EC2)에서 MongoDB Atlas로 마이그레이션
- Mongomirror 유틸리티를 사용하는 방식으로 결정
아키텍처
- Producer(WAS) - RabbitMQ Cluster - Consumer(Warker) - MongoDB 컬력센에 데이터 Write
마이그레이션 이후 아키텍처
- Smart Home VPC / MongoDB Atlas VPC를 분리시킴
마이그레이션 이후 효과
- 평균 응답속도 개선: 8ms -> 3ms
- Disk read lateny 감소: 최대3s/평균25ms -> 최대18ms/평균1ms
- 이슈가 19건에서 0건으로 감소
Replica Set to Sharded Cluster
- 주로 기기 상태 이벤트에 대한 updates
- 에어컨 등 가전제품 사용이 많은여름 성수기에 workload 트래픽 급증
- Replica Set 기반 스케일업 전략으로 peak 시즌의 워크로드를 다루는데 한계 직면, shard 환경 기반 스케일업/아웃 전략 추진
- 아키텍처가 샤드 라우팅 엔드포인트로 변경 (커녁센스트링의 변경이 없었기 때문에 애플리케이션 코드 배포 없이 진행)
마이그레이션 이후 결과
- 업데이트 오퍼레이션이 25k에서 2샤드가 균등하게 10k-15k씩 분배
- 커넥션 수도 샤드별로 균등하게 밸런싱
- Disk IOPS, Disk Queue Depth 등 샤드 전환후에 2분의 1로 감소
결론
- 장애 관련 이슈 0건 (2022년 5월 - NOW)
- High Availability 확보
- Workload Throughput 향상
- MongoDB 관리 overhead를 줄이고, Biz logic 및 Application 개발에 집중

## What's New in MongoDB 7.0 (김준 전무, MongoDB Korea)
개선된 개발자 경험
- New in Query: operators, variables and indexes
- Wildcard indexes 지원
- Bitwise 연산자, 백분위수 연산자
- 시스템 변수 $$USER_ROLES 추가
- 시계열 컬렉션에 대한 Update/Delete 지원
- 임의의 도큐먼트에 대한 단일, 다중 삭제 지원
- 확장성 향상
- 성능 최적화
- 부분적인 TTL 인덱싱 지원
- 쿼리 수행 속도 향상
- 체인지스트림
- 대규모 이벤트 처리에 대한 확장
- Shard Key advisor commands 지원
- sk를 제공하지 않고도 UpdateOne 사용
성능
- Big Routing Table로 인한 성능 저하
- auto-merger
- 동일한 샤드 내 연속되어져 있는 청크를 병합 빠른실행, 조각모음 절차사항 많은 부분을 차지함, 마이그레이션 실행하지 않음
- 향상된 쿼리 성능
- $group, $project, $match, $sort, $lookup
- 7.0에서 쿼리 엔진이 변경됨
보안
- 데이터베이스 엑세스를 위한 OpenID Connect 지원
마이그레이션
- Cluster-to-Cluster Sync (mongosync)
- 동일하거나 다른 환경에 있는 두 MongoDB Cluster간에 지속적인 데이터 동기화(단방향)
- 한 클러스가 망가지면 다른 클러스터 사용 가능
- 워크로드를 나눠서 처리할 수 있다는 의미
- 다른 클러스터에서 분석 작업 가능
- 데이터가 싱크되어 있기 때문
- Atlas Live Migrate 활용

## Streaming Processing을 활용한 실시간 이벤트 처리 (김규동 상무, MongoDB Korea)
Schema 변경에 빠른 대응 (이벤트들은 페이로드 변경이 있음)
- 발생하는 이벤트들을 확인하려면 배치 형태의 애플리케이션이 늘어날 수 밖에 없음
- 이벤트에 대한 양도 늘어남
MongoDB는 연속되는 데이터에 대한 강력한 연산 (어그리게이션 파이프라인을 가지고 있음)
- Stage 1번 연산 - Stage 2번 연산 같은 형태로 쿼리를 작성
- 파이프라인이라는 형태로 여러가지 Stage를 조합해서 그 안에서 원하는 데이터를 찾게 하는 핵심이 있음
Streaming Processing
- 무한 반복 쿼리 수행, 강력한 Pipeline 연산
- Aggregate, Filter, Route, Alert, Emit
서비스의 이름은 Atlas Streaming Processing
- 도큐먼트 모델을 이용한 유연한 스키마
- 유효성 검사 및 상태 저장 Window Processing
- MongoDB Atlas를 활용하여 실시간 생성되는 데이터와 기존 데이터를 결합
- 별도의 애플리케이션을 만들지 않아도 됨
- 개발자가 신경을 덜 쓸 수 있음
- 이벤트에 대한 데이터가 만들어질 때 마다 유효성 검사, 개발자분들이 개발하지 않고
- 서비스가 서버리스로 제공되기 때문에 쿼리가 실행될 때마다 필요한 자원들이 유기적으로 할당되기 때문에 신경을 덜 쓸 수 있음
- 개발에 대한 생산성에 대해서 중요하게 생각하는데 그 부분을 제공함 (가장 큰 장점이자 지향점)
Connection Registry (Key Store) / Steam Instance\
Steam에 대한 그룹 - Window (TumblingWindow, HoppingWindow)
- 1 분이라는 시간 동안에 데이터를 계산할거야
- 주식 같은 경우에 30분 평균, 10분 평균, 1분에 한 번씩 10분동안의 평균 주가 지수를 계산하는 부분들 이런 범위 인터벌에 대한 레인지에 대한 평균을 계산하겠다.
- 시간동안의 평균을 움직이는 형태로 가져가기 위한 Window 제공
Pipeline
- 다양한 연산 제공
- Life Cycle Management 제공
- 서버리스한 형태로 작동
- 이벤트 스트리밍 100만 건이 들어왔을 때, 일시적으로 많은 리소스를 할당받는 형태와 같은 것이 정의가 가능함

## Relational Migrator를 활용한 애플리케이션 현대화 (조건호 상무, MongoDB Korea)
- 해당 발표는 조금 재미있게 풀어가셨으며 아래 내용을 진지하게 생각하지 않아도 됨
Relational Migrator 이번에 GA
- SQL DB를 MongoDB로 전환 (스키마 변환, 데이터 복제)
Why NoSQL?
- SQL을 사용하지 말자가 아니라 여러가지 DB를 사용하자
현재의 애플리케이션 변화
- 데이터 증가 속도가 가파르다
- 우리 애플리케이션이 처리할 데이터 양은 점점 늘어난다
- SQL은 JOIN을 기반으로 한 DB
  - 성능을 포기하던가, 엄청난 비용을 들여서 하드웨어 스펙 보안
- 사업 환경의 변화
  - 변화에 대한 신속한 대응/혁신 -> 유연한 스키마가 필요
- 개발 주기의 단축
- 전체적인 개발 프로세스의 시간이 줄어듬
- 도메인에서부터 Top-Down을 시작하자가 요즘의 추세인데 이것을 DB에도 적용
  - SQL, NoSQL
  - SQL은 row-col table 부터 시작
  - NoSQL은 애플리케이션이 사용할 데이터를 그냥 스토리지에 저장
MSA가 어려운 이유
- 데이터 이동
- 언어장벽
MSA로 가는 새로운 길
- MongoDB 하나를 선택
- 하나의 기종이기 때문에 거기에 따른 ETL을 줄여나갈 수 있음
SQL로 부터 빠르고 안정적으로 MongoDB로의 전환
- 데모 시청
- Relational Migrator 다운로드
- 샘플데이터가 있기 때문에 연습 가능
- 기존 워크로드에서 가벼운 것부터 연습
- 그 이후에 직접적으로 마이그레이션 (파트너 지원도 해줌)

## 더욱 안전한 MongoDB Atlas on AWS 사용 방법 (윤기원 파트너 솔루션 아키텍트, AWS)
AWS PrivateLink를 활용한 사용자 VPC - Atlas간 보안 접속
- 1 WAY 단방향 통신
- 보통 전통적인 IP 필터링 방식 사용
AWS KMS, IAM을 이용한 데이터 암호화
- 데모 시청

## Riot Games Korea: Why MongoDB? Why Atlas? (김동인 소프트웨어 엔지니어, RiotGames)
Riot Games Korea 개발팀에서 하는 일
- PC방 비즈니스
- 모바일 상점(store.leagueoflegends.co.kr)
- 한국 게임 퍼블리싱(계정, Player Behavior)
- 이스포츠 데이터(LCK)
한국 PC방에서 Riot의 게임
- 게임 동시접속 최대 약 80만
- PC방 동시접속 최대 약 20만
- PC 방 세션 1년 약 40억 건
- 이를 서포트해줄 엔진, 서비스가 필요
플레이어에게 올챔프 혜택, 업주분들에게 과금 및 서비스 제공
- 업주분들에게는 그 플레이어가 얼마나 게임을 했는지 측정해서 과금 필요
- 엔지니어 2-6명의 작은 팀
- 데이터 저장소로 MongoDB를 선택
DB 요구사항
- 잦은 스키마 변화에도 큰 문제 없이 서비스 개발/운영
- 필요할 경우 데이터베이스의 수평적 확장 용이
- (5년전) 처음에는 EC2에 MongoDB 커뮤니티 버전을 설치해서 구성
- version 3.6.0
- IOPS 3000
쿼리 성능
- 1년마다 약 40억개의 세션 관련 도큐먼트가 쌓임
- 2년 반이 지나고 보니 컬렉션 내 도큐먼트가 무려 100억개에 달함
운영의 부담
- 매일 크론 잡을 통해 백업 저장
- 복구 작업이 필요하다면
- 서비스 중단, 데이터 손실 없이 진행되기 위해 과정이 복잡하고 실수 가능성이 높음
- AWS 점검
- AWS EC2의 scheduled maintenance
- 수동으로 EC2를 껐다 켜고 다시 DB 구동
- 그동안의 서비스는?
- 버전 업그레이드
- 다가오는 현 버전의 EOL
- 게임 다운타임동안 버전 업그레이드를 무사히 마치고 테스트까지 끝낼 수 있을까?
- major 버전업이라면?
필요했던 추가 기능
- 데이터를 보고 싶어하는 stakeholder들이 많은 수 늘어남
- Chart, Metric 등의 필요성
MongoDB Atlas로의 마이그레이션
- 클러스터 생성
- Web UI로 쉽게 가능
- mongomirror 사용
- 100억건 기준 sync 10시간
- 성능 테스트 및 데이터 검증
- 컷오버
- 게임서비스 정기점검 때 진행
- 미러 테일링의 log이 0임을 확인
- 새로운 DB에 연결된 코드를 배포
- 테일링은 종료
마이그레이션 그 이후
- 운영 부담 경감
- 자동 백업
- 모니터링
- Slow query 발생 시 빠르게 모니터링 가능
- Performance Advisor
- DB 성능에 도움되는 제안들을 볼 수 있음
- 주로 인덱스 추가/제거에 참고
- 차트
- 모니터링, 인사이트를 위해서 주로 사용
- 동향 파악
- Online Archive

