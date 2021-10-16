---
title: ASP.NET Core 다국어(세계화 및 지역화)
tags: ["Dev", ".Net Core"]
date: "2019-09-11T20:03:20.284Z"
description: ASP.NET Core MVC에서 다국어를 지원하는 사이트를 만드는 방법
---

이번 포스팅에서는 ASP.NET Core MVC에서 **다국어를 지원하는 사이트**를 만들어보는 방법에 대해서 설명해 보려고 한다.

ASP.NET Core는 번역이 포함된 XML 파일 형식의 리소스 파일들을 기반으로 하는데 문화권을 전달하면 해당 문화권에 정의된 이름을 기반으로 리소스 파일을 찾아서 리소스 파일에 정의된 값이 표시된다.

아래처럼 커스텀된 `IHtmlLocalizer`와 `IStringLocalizer`를 이용하면 하나의 리소스 파일에서 번역 리소스들을 관리할 수 있다. 부수적으로 해당 값이 번역되어있는 값인지도 확인이 가능하다.

아래 예제 소스들을 보면서 ASP.NET Core에서 초보자도 쉽게 다국어를 적용할 수 있도록 설명해보도록 하겠다. MSDN에서처럼 View파일별로 다국어를 만드는 방식이 아닌, 하나의 다국어 모듈을 만들어서 처리하는 방법이다.

```
Sample.Language
├─ SampleHtmlLocalizer.cs
├─ SampleHtmlLocalizerFactory.cs
├─ SampleStringLocalizer.cs
├─ SampleStringLocalizerFactory.cs
├─ Resource.en.resx
├─ Resource.ko.resx
└─ Resource.resx
```

결과물이 될 다국어 모듈은 위의 구조로 만들어질 것이다. 이름에서 알 수 있듯이 `Resource.ko.resx`는 한국어가 있는 리소스 파일이며, `Resource.en.resx`는 영어로 번역된 리소스이다.

**SampleHtmlLocalizer**, **SampleHtmlLocalizerFactory**를 어떻게 구현했는지 아래 코드를 보면서 살펴보자.

```csharp
namespace Sample.Language
{
    public class SampleHtmlLocalizer : IHtmlLocalizer
    {
        private readonly IHostingEnvironment _environment;

        public SampleHtmlLocalizer(IHostingEnvironment environment)
        {
            _environment = environment;
        }

        public LocalizedHtmlString this[string name]
        {
            get
            {
                var localizedString = GetString(name);
                return new LocalizedHtmlString(localizedString.Name, localizedString.Value, localizedString.ResourceNotFound);
            }
        }

        public LocalizedHtmlString this[string name, params object[] arguments]
        {
            get
            {
                var localizedString = GetString(name);
                return new LocalizedHtmlString(localizedString.Name, localizedString.Value, localizedString.ResourceNotFound, arguments);
            }
        }

        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures)
        {
            throw new NotImplementedException();
        }

        public LocalizedString GetString(string name)
        {
            var exsits = IsFoundResource(name, out string value);
            return new LocalizedString(name, value, exsits);
        }

        public LocalizedString GetString(string name, params object[] arguments)
        {
            var exsits = IsFoundResource(name, out string value);
            return new LocalizedString(name, string.Format(value, arguments), exsits);
        }

        public IHtmlLocalizer WithCulture(CultureInfo culture)
        {
            CultureInfo.DefaultThreadCurrentCulture = culture;
            return new SampleHtmlLocalizer(_environment);
        }

        private bool IsFoundResource(string name, out string value)
        {
            bool isReady = true;
            value = Resource.ResourceManager.GetString(name);

            if (string.IsNullOrEmpty(value))
            {
                value = name;
                isReady = false;
            }

            // Live 환경이 아니면 번역 유무 출력
            if (!_environment.IsProduction())
                value = $"{value}{(isReady ? "(O)" : "(X)")}";

            return isReady;
        }
    }
}
```

```csharp
namespace Sample.Language
{
    public class SampleHtmlLocalizerFactory : IHtmlLocalizerFactory
    {
        private readonly IHostingEnvironment _environment;

        public SampleHtmlLocalizerFactory(IHostingEnvironment environment)
        {
            _environment = environment;
        }

        public IHtmlLocalizer Create(Type resourceSource)
        {
            return new SampleHtmlLocalizer(_environment);
        }

        public IHtmlLocalizer Create(string baseName, string location)
        {
            return new SampleHtmlLocalizer(_environment);
        }
    }
}
```

`IHtmlLocalizerFactory`는 View에서 지역화(HTML을 포함하는 리소스)를 할 때 필요하다. `Microsoft.AspNetCore.Mvc.Localization`를 참조하고 있다.

이제 View이외의 리소스를 지역화하기 위한 **SampleStringLocalizer**, **SampleStringLocalizerFactory**의 코드를 살펴보자.

```csharp
namespace Sample.Language
{
    public class SampleStringLocalizer : IStringLocalizer
    {
        private readonly IHostingEnvironment _environment;

        public SampleStringLocalizer(IHostingEnvironment environment)
        {
            _environment = environment;
        }

        public LocalizedString this[string name]
        {
            get
            {
                var exists = IsFoundResource(name, out string value);
                return new LocalizedString(name, value, exists);
            }
        }

        public LocalizedString this[string name, params object[] arguments]
        {
            get
            {
                var exists = IsFoundResource(name, out string value);
                return new LocalizedString(name, string.Format(value, arguments), exists);
            }
        }

        public IEnumerable<LocalizedString> GetAllStrings(bool includeParentCultures)
        {
            throw new NotImplementedException();
        }

        public IStringLocalizer WithCulture(CultureInfo culture)
        {
            CultureInfo.DefaultThreadCurrentCulture = culture;
            return new SampleStringLocalizer(_environment);
        }

        private bool IsFoundResource(string name, out string value)
        {
            bool isReady = true;
            value = Resource.ResourceManager.GetString(name);

            if (string.IsNullOrEmpty(value))
            {
                value = name;
                isReady = false;
            }

            // Live 환경이 아니면 번역 유무 출력
            if (!_environment.IsProduction())
                value = $"{value}{(isReady ? "(O)" : "(X)")}";

            return isReady;
        }
    }
}
```

```csharp
namespace Sample.Language
{
    public class SampleStringLocalizerFactory : IStringLocalizerFactory
    {
        private readonly IHostingEnvironment _environment;

        public SampleStringLocalizerFactory(IHostingEnvironment environment)
        {
            _environment = environment;
        }

        public IStringLocalizer Create(Type resourceSource)
        {
            return new SampleStringLocalizer(_environment);
        }

        public IStringLocalizer Create(string baseName, string location)
        {
            return new SampleStringLocalizer(_environment);
        }
    }
}
```

`IStringLocalizerFactory`는 View 이외에서 지역화를 할 때 필요한데, `Microsoft.Extensions.Localization`를 참조하고 있다.

위의 두개의 소스가 비슷한 구성으로 만들어져있는데 부모클래스만 다른 것이지 비슷한 구조로 되어있다. `!_environment.IsProduction()`를 이용해서 프로덕션 환경인지 확인하고 프로덕션 환경이 아니라면, 해당 리소스의 번역본이 있는지 확인후에 있으면 (O)를 표시하고, 없다면 (X)를 표시한다.

위 코드들에서 자주보이는 `LocalizedString`의 경우 ASP.NET Core에서 지원하는 클래스이며 리소스에서 원하는 문자열을 찾아서 문자열을 반환하는 역활을 한다.

## 지역화 구성

```csharp
services.AddMvc()
    .SetCompatibilityVersion(CompatibilityVersion.Version_2_2)
    .AddViewLocalization()
    .AddDataAnnotationsLocalization();
				
services.AddSingleton<IStringLocalizerFactory, SampleStringLocalizerFactory>();
services.AddTransient<IStringLocalizer, SampleStringLocalizer>();
services.AddSingleton<IHtmlLocalizerFactory, SampleHtmlLocalizerFactory>();
services.AddTransient<IHtmlLocalizer, SampleHtmlLocalizer>();
```

`AddViewLocalization`는 View파일에 대한 지역화를 제공한다.

`AddDataAnnotationsLocalization`는 `IStringLocalizer` 추상화를 통해 지역화된 유효성 검사 메시지에 대한 지원을 추가한다.

`Startup.cs`의 `ConfigureServices`에서 서비스를 위처럼 추가한다.

## 지역화 미들웨어

```csharp
var supportedCultures = new[]
{
	new CultureInfo("en-US"),
    new CultureInfo("ko-KR"),
};

app.UseRequestLocalization(new RequestLocalizationOptions
{
    DefaultRequestCulture = new RequestCulture("en-US"),
    SupportedCultures = supportedCultures,
    SupportedUICultures = supportedCultures
});
```

`Startup.cs`의 `Configure`에서 요청 파이프라인 구성은 위처럼 추가한다.

## DataAnnotations 지역화

**DataAnnotations 지역화**를 사용하기 위해서는
Model이나 ViewModel에서 사용하는 방법이다.

```csharp
[Required(ErrorMessage = "{0}을(를) 입력해 주세요.")]
```

'{0}을(를) 입력해 주세요.'의 영어로 번역된 문장이 영어 리소스 파일에 포함되어 있으면 된다.

컨트롤러에서는 아래처럼 사용하도록 한다.

```csharp
private readonly IStringLocalizer _localizer;

public AccountController(IStringLocalizer localizer)
{
    _localizer = localizer;
}
	
ModelState.AddModelError(string.Empty, _localizer["사용자 ID 혹은 비밀번호가 올바르지 않습니다."]);
```

## View에서의 지역화

View에서는 아래처럼 사용하도록 한다.

```csharp
@inject Microsoft.AspNetCore.Mvc.Localization.IHtmlLocalizer htmlLocalizer;
<p>@htmlLocalizer["안녕"]</p>
```

## 사용자가 언어권을 선택할 수 있도록 구현하기

이제 언어를 변경하는 리스트를 만들 때에는 아래와 같이 만들면 된다.

```csharp
@using Microsoft.AspNetCore.Localization

@inject Microsoft.AspNetCore.Mvc.Localization.IHtmlLocalizer htmlLocalizer;

@model IList<Sample.Data.CommonDatabase.Models.AccountLoginLog>

@{
    ViewData["Title"] = "Home";

    var requestCulture = Context.Features.Get<IRequestCultureFeature>();
}

@using (Html.BeginForm("SetLanguage", "Home", new { area = "" },
        FormMethod.Post, true, new { id = "language" }))
{
    <input type="hidden" name="returnUrl" value="/Home/Index" />
    <select name="culture" onchange="$('#language').submit();">
        @{
            switch (requestCulture.RequestCulture.Culture.ToString())
            {
                case "ko-KR":
                    <option value="ko-KR" selected>KR</option>
                    <option value="en-US">EN</option>
                    break;
                case "en-US":
                    <option value="ko-KR">KR</option>
                    <option value="en-US" selected>EN</option>
                    break;
                default:
                    <option value="ko-KR" selected>KR</option>
                    <option value="en-US">EN</option>
                    break;
            }
        }
    </select>
}
```

Html select를 통해서 원하는 언어를 선택하면 Home컨트롤러의 `SetLanguage`를 호출하는 방식이다.

```csharp
[HttpPost]
[AllowAnonymous]
public IActionResult SetLanguage(string culture, string returnUrl)
{
    Response.Cookies.Append(
        CookieRequestCultureProvider.DefaultCookieName,
        CookieRequestCultureProvider.MakeCookieValue(new RequestCulture(culture)),
        new CookieOptions { Expires = DateTimeOffset.UtcNow.AddYears(1) }
    );

    return LocalRedirect(returnUrl);
}
```

## 마치며

간단한 예제 코드를 이용해서 ASP.NET Core의 다국어 번역에 대해서 알아보았다. ASP.NET MVC에서보다 더 쉽게 다국어를 적용할 수 있고, 그 외에 유효성 검사에 대한 다국어도 쉽게 적용할 수 있어서 좋았던 것 같다.

---
## Reference

https://docs.microsoft.com/ko-kr/aspnet/core/fundamentals/localization?view=aspnetcore-2.2