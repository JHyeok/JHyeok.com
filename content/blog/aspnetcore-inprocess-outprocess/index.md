---
title: .NET Core의 InProcess와 OutOfProcess
date: "2019-08-10T06:43:15.284Z"
description: .NET Core를 빌드할 때 오류를 해결해보고, InProcess와 OutOfProcess에 대해서 간단하게 알아본다.
---

컴퓨터에 이전 버전의 SDK가 다운되어 있다가 최근의 SDK를 다운받은 이후에 `.NET Core`를 배포하려고 하니 오류가 생겼었다. `.NET Core` 버전의 종속성 때문에 생긴오류이기 때문에 빌드하려는 프레임워크의 버전과 로컬에 다운되어 있는 프레임워크 버전의 충돌이라고 생각한다.

그래서 IIS에 `.NET Core`를 배포하는 방법으로는 아래 명령어를 주로 이용한다. 여러 버전의 SDK가 설치되어 있을 떄, 발생한 오류를 해결하기 위해서 아래 명령어를 쓴 이후로는 줄곧 아래 명령어를 이용해서 빌드를 하고 있다.

```csharp
// nuget 리소스를 지웁니다.
dotnet nuget locals all --clear

// 프레임 워크 종속 배포
dotnet publish --output:bin/framework_dependent
```

그리고 `.NET Core`의 배포에는 2.2 이후로 **InProcess**와 **OutOfProcess**로 나누어진다.(ANCM2를 사용) 이 두 가지 방식의 차이점은 **InProcess**는 IIS가 서버가 되는 것이고 **OutOfProcess**는 Kestrel이 Edge Server로 사용되거나 역방향 프록시로 IIS, Nginx등이 역할을 하고 Kestrel을 Edge Server로 사용한다는 점이다.

2.2이 이후로 생긴 **InProcess**가 역방향 프록시를 이용한 **OutOfProcess**보다 처리 성능이 더 좋다. 다만, Kestrel을 직접 호스팅 한 서버의 경우에는 성능이 비슷한 것 같다.

>.NET Core로 만들어진 웹의 경우 F12의 개발자 도구에서 NetWork의 Response Headers를 확인해서 Server에서 IIS 인지 Kestrel인지 확인을 통해 InProcess와 OutOfProcess를 구별할 수 있다.

```
<aspNetCore hostingModel = "InProcess"/>
```

```
<aspNetCore hostingModel = "OutOfProcess"/>
```

`hostingModel`을 변경함으로써 **InProcess**와 **OutOfProcess**방식으로 배포할 수 있으며, 또는 csproj에서 설정이 가능하다. 그리고 디버그에서도 디버그 속성으로 설정이 가능하며 **Kestrel**을 Edge Server로도 디버그가 가능하다.

Windows환경에서는 IIS를 서버로 사용하는 것이 처리량에서와 보안에서 더 좋은 것 같다.

---
### Reference

https://natemcmaster.com/blog/2018/08/29/netcore-primitives-2/

https://appdevmusings.com/host-your-asp-net-core-2-2-web-app-with-iis-in-process-and-out-of-process-hosting-model-and-deploy-to-docker-windows-containers

https://codewala.net/2019/02/05/hosting-asp-net-core-applications-on-iis-in-process-hosting/


