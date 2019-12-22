---
title: ASP.NET Core 유효성 검사 - 1
tags: ["Dev", ".Net Core"]
date: "2019-09-19T21:23:20.284Z"
description: ASP.NET Core MVC와 ASP.NET MVC5에서 사용하는 간단한 유효성 검사를 알아봅니다.
---

보통 유효성 검사를 하려고 하면 프론트엔드와 백엔드 어느 부분에 코드를 두어야 할지 고민하시는 개발자분들이 있을 것이라고 생각한다. 필자도 처음에는 이 부분에 대해서 고민을 많이 했고, 구글 검색도 많이 했다.

ASP.NET Core의 유효성 검사에 대해 설명하기 이전에 프론트엔드와 백엔드에서의 유효성 검사에 어떤 장단점이 있는지를 알아보도록 하자. 

프론트엔드에서의 유효성 검사의 장점으로는 백엔드로 넘어가기 전에 사용자의 브라우저 환경(클라이언트)에서 검사를 해서 서버 리소스의 낭비를 줄일 수 있다. 단점으로는 사용자가 악의적인 마음을 먹으면 유효성 검사를 피하고 정보를 입력할 수 있다는 점이다.

백엔드에서의 유효성 검사로는 이 프론트엔드에서의 유효성 검사를 피하고 들어오는 부분에 대해서 백엔드에서는 조작이 힘들기 때문에 확실하게 유효성 검사가 가능하다.

구글링을 하다 보니까 프론트엔드에서의 유효성 검사만 하는 개발자분들도 있고 백엔드에서만 유효성 검사를 하는 개발자분들도 보았다. 개인적인 생각으로는 프론트엔드와 백엔드에서 전부 유효성 검사를 하는 것이 더 좋아 보였다. 불필요한 서버 리소스를 막을 수 있고, 프론트엔드에서 유효성 검사를 피하고 들어오더라도 백엔드에서 또 유효성 검사를 하기 때문에 통과될 일이 없다.

그리고 ASP.NET Core MVC에서는 프론트엔드와 백엔드에 유효성 검사 코드를 작성하는 일이 어렵지 않기 때문이다.

#### 필자가 내린 결론
- 프론트엔드와 백엔드, 두 곳에서 유효성 검사를 하는 것이 좋을 것 같다.

이처럼 생각한 이유는 두 곳에서 유효성 검사를 하는 것이 어렵지 않기 떄문이다. 이제 ASP.NET Core에서 유효성 검사를 하는 방법에 대해서 알아보자.

```csharp
@{await Html.RenderPartialAsync("_ValidationScriptsPartial");}
```

ASP.NET MVC5와 ASP.NET Core에서의 유효성 검사는 비슷하지만, ASP.NET Core는 개발자의 불필요한 작업을 덜어준다.

Views폴더의 Shared에서 `_ValidationScriptsPartial`가 있어서 유효성 검사가 필요한 페이지가 있으면 `RenderPartialAsync`로 사용할 수 있다.

```js
jquery.validate.js
jquery.validate.unobtrusive.js
```
`_ValidationScriptsPartial`가 렌더링 하는 Javascript 라이브러리들이다. ASP.NET MVC5에서는 저 부분을 개발자가 따로 만들거나 따로따로 불러왔어야 하는데, ASP.NET Core는 친절하게 미리 만들어져 있다.

View페이지의 `@model`에 사용되는 Viewmodel 또는 model에 유효성 검사 규칙을 지정할 수 있다.

```csharp
public class RegisterViewModel
{
    [Required(ErrorMessage = "{0}을(를) 입력해 주세요.")]
    [RegularExpression(@"^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$", ErrorMessage = "이메일 형식이 올바르지 않습니다.")]
    [Display(Name = "이메일")]
    public string Email { get; set; }

    [Required(ErrorMessage = "{0}을(를) 입력해 주세요.")]
    [Display(Name = "이름")]
    public string CustomerName { get; set; }

    [Required(ErrorMessage = "{0}을(를) 입력해 주세요.")]
    [StringLength(16, ErrorMessage = "{0}은(는) 최소 {2}, 최대 {1} 글자여야 합니다.", MinimumLength = 8)]
    [DataType(DataType.Password)]
    [RegularExpression(@"^(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$", ErrorMessage = "비밀번호 형식이 올바르지 않습니다.")]
    [Display(Name = "비밀번호")]
    public string Password { get; set; }

    [Required(ErrorMessage = "{0}을(를) 입력해 주세요.")]
    [DataType(DataType.Password)]
    [Display(Name = "비밀번호 확인")]
    [Compare("Password", ErrorMessage = "입력하신 비밀번호와 일치하지 않습니다.")]
    public string ConfirmPassword { get; set; }
}
```

프론트엔드에서는 폼 요소를 가져와서 `.Vaild()`를 사용하면 유효성 검사가 프론트엔드단에서 실행된다. 서버로 넘어가기 전에 유효성 검사를 할 수 있다.

```csharp
if (!ModelState.IsValid)
{
    return View(viewModel);
}
```
백엔드에서는 컨트롤러에서 위의 코드를 이용해서 유효성 검사를 할 수 있다. 이메일 형식이 올바르지 않으면, 저 `if`문에 걸려 오류 메시지가 포함된 viewModel을 View에 반환한다.

아래는 View페이지 소스 전체이다. `@model`은 위에서 유효성 검사를 지정한 `RegisterViewModel`을 사용하고 있다. Javascript에서 `.valid()`를 사용해서 프론트엔드에서 유효성 검사를 먼저 할 수 있다.

```csharp
@model SampleWeb.Data.ViewModels.RegisterViewModel

@{
    ViewData["Title"] = "Register";
}

<div class="container-scroller">
    <div class="container-fluid page-body-wrapper full-page-wrapper auth-page">
        <div class="content-wrapper d-flex align-items-center auth register-bg-1 theme-one">
            <div class="row w-100">
                <div class="col-lg-4 mx-auto">
                    <h2 class="text-center mb-4">회원가입</h2>
                    <div class="auto-form-wrapper">
                        <form method="post" id="registerAccount" asp-controller="Account" asp-action="Register">
                            <div class="form-group">
                                <div class="input-group">
                                    <input type="text" class="form-control" asp-for="Email" placeholder="아이디" onfocusin="onFocusEmail()" onfocusout="onFocusOutEmail()">
                                    <div class="input-group-append">
                                        <span class="input-group-text">
                                            <i class="mdi mdi-check-circle-outline"></i>
                                        </span>
                                    </div>
                                </div>
                                <span class="text-small text-danger font-weight-semibold" id="dataValEmail" asp-validation-for="Email"></span>
                            </div>
                            <div class="form-group">
                                <div class="input-group">
                                    <input type="text" class="form-control" asp-for="CustomerName" placeholder="이름">
                                    <div class="input-group-append">
                                        <span class="input-group-text">
                                            <i class="mdi mdi-check-circle-outline"></i>
                                        </span>
                                    </div>
                                </div>
                                <span class="text-small text-danger font-weight-semibold" asp-validation-for="CustomerName"></span>
                            </div>
                            <div class="form-group">
                                <div class="input-group">
                                    <input type="password" class="form-control" asp-for="Password" placeholder="비밀번호" onfocusout="onFocusOutPassword()">
                                    <div class="input-group-append">
                                        <span class="input-group-text">
                                            <i class="mdi mdi-check-circle-outline"></i>
                                        </span>
                                    </div>
                                </div>
                                <span class="text-small text-danger font-weight-semibold" asp-validation-for="Password"></span>
                            </div>
                            <div class="form-group">
                                <div class="input-group">
                                    <input type="password" class="form-control" asp-for="ConfirmPassword" placeholder="비밀번호 확인" onfocusout="onFocusOutConfirmPassword()">
                                    <div class="input-group-append">
                                        <span class="input-group-text">
                                            <i class="mdi mdi-check-circle-outline"></i>
                                        </span>
                                    </div>
                                </div>
                                <span class="text-small text-danger font-weight-semibold" asp-validation-for="ConfirmPassword"></span>
                            </div>
                            <div class="text-small text-danger font-weight-semibold" asp-validation-summary="ModelOnly"></div>
                            <div class="form-group">
                                <button class="btn btn-primary submit-btn btn-block" id="btnRegister">회원가입</button>
                            </div>
                            <div class="text-block text-center my-3">
                                <span class="text-small font-weight-semibold">이미 회원이신가요 ?</span>
                                <a class="text-black text-small" asp-controller="Account" asp-action="Login">로그인</a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        <!-- content-wrapper ends -->
    </div>
    <!-- page-body-wrapper ends -->
</div>

@section Scripts {
    @{await Html.RenderPartialAsync("_ValidationScriptsPartial");}
    <script>
        $('form#registerAccount').submit(function () {
            if ($('form#registerAccount').valid()) {
                return true;
            }
        });
    </script>
}
```

부트스트랩 모달에서 모델에 선언한 어노테이션이 되지 않아서 프론트엔드에서 유효성 검사가 되지 않을 때가 있는데 그럴 땐 아래의 Javascript를 사용하면 된다.

```js
var initValidate = function () {
    $('form#articleSubmitForm').removeData('validator').removeData('unobtrusiveValidation');
    $.validator.unobtrusive.parse('form#articleSubmitForm');
};
```

`articleSubmitForm`은 해당 폼의 ID이다. 모델에 유효성 검사 규칙을 지정해준 이후 간단한 코드만으로 프론트엔드와 백엔드에서 유효성 검사를 알아보았다.

ASP.NET Core MVC 또는 ASP.NET MVC5의 환경에서 개발하는 개발자분들이 유효성 검사 코드를 어디에 둘 지 필자처럼 고민하지 않았으면 좋겠다.