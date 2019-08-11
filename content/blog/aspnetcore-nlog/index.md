---
title: ASP.NET Core 로그 라이브러리 NLog 적용하기
date: "2019-08-11T10:02:10.284Z"
description: ASP.NET Core MVC 시리즈
---

#### ASP.NET Core에서 로그 라이브러리 NLog 적용하기

NLog는 닷넷 플랫폼 로그 라이브러리이다. 옵션들을 이용해서 다양한 레벨에서 로그를 남길 수 있다. 이번 ASP.NET Core MVC 시리즈 포스트에서는 NLog를 적용하는 방법을 알아본다.

ASP.NET MVC 5에서 NLog를 적용하는 방법과는 다르게 ASP.NET Core 2.2에서는 정말 간단하게 적용할 수 있다.

Nuget에서 [NLog.Web.AspNetCore](https://www.nuget.org/packages/NLog.Web.AspNetCore/4.8.3)를 다운로드한다.

프로그램 진입점인 Program 클래스의 Main에다가 아래처럼 코드를 작성한다.

```csharp
public static void Main(string[] args)
{
    var logger = NLogBuilder.ConfigureNLog("nlog.config").GetCurrentClassLogger();
    try
    {
        logger.Debug("Init Main");
        CreateWebHostBuilder(args).Build().Run();
    }
    catch (Exception ex)
    {
        logger.Error(ex, "Stopped program because of exception");
        throw;
    }
    finally
    {
        NLog.LogManager.Shutdown();
    }
}
```

그리고 nlog.config을 만들어준다.

```xml
<?xml version="1.0" encoding="utf-8" ?>
<nlog xmlns="http://www.nlog-project.org/schemas/NLog.xsd"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" >
  <extensions>
    <add assembly="NLog.Web.AspNetCore"/>
  </extensions>

  <targets>
    <target name="file" type="File"  fileName="${basedir}/Logs/${level}/${shortdate}.txt" layout="${longdate}|${event-properties:item=EventId_Id}|${uppercase:${level}}|${logger}|${message} ${exception:format=tostring}" />
  </targets>
  <rules>
    <logger name="*" minLevel="Error" writeTo="file" />
  </rules>
</nlog>
```

로깅할 최소 레벨을 설정이 가능한데, Trace로 하면 모든 오류를 다 쌓고, Error로 설정하면 Error위의 레벨만 쌓는다.
자세한 로그 레벨 정보는 [여기서](https://github.com/NLog/NLog/wiki/Configuration-file#log-levels) 확인이 가능하다.

```csharp
public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
    WebHost.CreateDefaultBuilder(args)
    .UseStartup<Startup>()
    .UseNLog();
```

CreateWebHostBuilder에다가 UseNLog를 해서 주입을 시킨다.
이러면 NLog설정이 끝난다. 오류가 발생한다면 NLog.config에 정의해놓은 target과 rule에 맞추어서 파일이 만들어진다.

짧은 시간 안에 ASP.NET Core에서 오류 라이브러리인 NLog를 적용하였다.

---
### Reference

https://github.com/NLog

https://www.nuget.org/packages/NLog.Web.AspNetCore/4.8.3

https://github.com/NLog/NLog/wiki/Configuration-file#log-levels