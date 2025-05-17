---
title: Entity Framework Core를 기존 데이터베이스에서 시작하면서 만난 오류
date: "2019-05-23T22:12:10.284Z"
description: Entity Framework Core에서 기존 데이터베이스로 시작하면서 만난 오류들과 해결법.
---

`.NET Core 2.2`환경에서 `Entity Framework Core`를 사용해서 기존 데이터베이스를 리버스 엔지니어링 하여 `Entity Framework` 모델을 만들 수 있는데 만드는 과정에서 만난 오류들과 해결법들을 공유한다.

패키지 관리자 콘솔에서 기존 데이터베이스 기반으로 모델을 만드는 명령이다.

```
dotnet ef dbcontext scaffold "Server=localhost;Database=ef;User=jhyeok;Password=1234;characterset=utf8mb4" "Pomelo.EntityFrameworkCore.MySql" -o Models
```

데이터 공급자 목록에서 `Pomelo`를 사용했다.

> 오류1.

```
No project was found. Change the current working directory or use the --project option.
```

패키지 관리자 콘솔에 프로젝트 경로가 지정되어 있어도 위와 같은 오류가 발생할 수 있다.

해결법

```
cd "현재 프로젝트의 경로"
```

경로를 변경후에 명령을 다시 입력해주시면 된다.

> 오류2.

```
Your startup project 'JHyeokAspcore.Data' doesn't reference Microsoft.EntityFrameworkCore.Design.
This package is required for the Entity Framework Core Tools to work.
Ensure your startup project is correct, install the package, and try again.
```

해결법

```
Microsoft.EntityFrameworkCore.Design
Microsoft.EntityFrameworkCore.Tools
```

위의 패키지들을 설치해주시면 된다.

혹시 위의 패키지들을 설치하였는데도 해결이 되지 않는다면 `.csproj`를 수정하면 된다.

```
<PropertyGroup>
  <GenerateRuntimeConfigurationFiles>True</GenerateRuntimeConfigurationFiles>
</PropertyGroup>
```

`GenerateRuntimeConfigurationFiles`를 True로 설정해주면 된다.

> 오류3.

```
Startup project 'JHyeokAspcore.Data.csproj' targets framework '.NETStandard'.
There is no runtime associated with this framework, and projects targeting it
cannot be executed directly.
To use the Entity Framework Core .NET Command-line Tools with this project, 
add an executable project targeting .NET Core or .NET Framework that references
this project, and set it as the startup project using --startup-project; or,
update this project to cross-target .NET Core or .NET Framework. For more 
information on using the EF Core Tools with .NET Standard projects,
see https://go.microsoft.com/fwlink/?linkid=2034781
```

해결법

해당 프로젝트는 대상 프레임워크가 `.NET Standard 2.0`여서 발생한 문제였으며, 대상 프레임워크를 `.NET Core 2.2`로 변경하니 해결되었다.
