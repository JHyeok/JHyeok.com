---
title: 클린 코드를 읽고 코드 리팩토링(refactoring) 하기
tags: ["Dev", "후기"]
date: "2019-07-17T22:00:10.284Z"
description: 클린 코드를 읽고 리팩토링(refactoring)한 경험을 적어보았습니다.
---

>"컴퓨터가 이해할수 있는 코드는 어느 바보나 다 짤 수 있다.
>좋은 프로그래머는 사람이 이해할 수 있는 코드를 짠다."
>> **Martin Fowler**

팀의 모든 사람들이 쉽게 이해할 수 있는 코드에는 **'Clean'**이라는 정의가 있습니다. 깨끗한 코드는 원래 작성자가 아닌 개발자가 읽고 이해할 수 있어야 합니다.

이전에 클린 코드에 대해서 읽었지만 최근 Git에서 [clean-code-dotnet](https://github.com/thangchung/clean-code-dotnet)를 읽고 닷넷에서 어떻게 클린 코드를 적용해야 할까? 어느정도 윤곽이 잡혔습니다.

오래 전에 작성한 코드를 보고, 제 자신이 '잉? 뭐지?' 하는 생각이 들었고 '함수는 한 가지 작업을 수행해야 한다' , '이름은 그들이 하는 일을 말해야 한다'를 적용하였고 최근 '얇은 컨트롤러'에 대해서 알게 되었는데 그 부분을 중점으로 리팩토링 해보겠습니다.

```csharp
[HttpPost]
[ValidateAntiForgeryToken]
public async Task<JsonResult> SendArticleMail(int articleId)
{
    EmailHelper emailHelper = new EmailHelper();
    FileS3Upload fileS3Upload = new FileS3Upload();
    var articleMail = await _db.GetArticleMailAsync(articleId);

    var attaList = new List<Attachment>();
    foreach (var file in articleMail.ArticleMailContentsDto.ArticleFiles)
    {
        string subPath = $"/{file.CreateDate.ToString("yyyy")}/{file.CreateDate.ToString("MM")}/{file.CreateDate.ToString("dd")}";
        var bucketName = S3Path.GetS3UploadPathLocation(FileLocation.Article) + subPath;

        var stream = await fileS3Upload.DownloadS3ObjectAsync(file.FileS3Name, bucketName);

        attaList.Add(new Attachment(stream, file.FileViewName));
    }

    var articleMailContents = await MailContents.ArticleEmailTemplateContentsAsync(articleMail.ArticleMailContentsDto);

    var isSended = await emailHelper.SendMailAsync(articleMail.Title, articleMailContents, articleMail.ReceiverList, attaList, "smtp_2");

    if (isSended)
        await _db.ArticleMailStateSuccessAsync(articleId);
    else
        await _db.ArticleMailStateFailureAsync(articleId);

    return Json(new { status = 1 });
}
```
사용자가 `Aritcle`을 작성하면 DB의 사용자 목록에 메일을 발송하는 기능을 가진 컨트롤러 소스가 있습니다. 저는 이 샘플 소스를 한 달 전에 작성하였는데 그때 당시에는 잘 작성하였다고 생각했는데 시간이 흘러서 보니 컨트롤러단의 소스가 길다고 생각해서 다른 사람들이 보기 싫겠다는 생각이 들었습니다.

우선 문제의 부분은

```csharp
    var attaList = new List<Attachment>();
    foreach (var file in articleMail.ArticleMailContentsDto.ArticleFiles)
    {
        string subPath = $"/{file.CreateDate.ToString("yyyy")}/{file.CreateDate.ToString("MM")}/{file.CreateDate.ToString("dd")}";
        var bucketName = S3Path.GetS3UploadPathLocation(FileLocation.Article) + subPath;

        var stream = await fileS3Upload.DownloadS3ObjectAsync(file.FileS3Name, bucketName);

        attaList.Add(new Attachment(stream, file.FileViewName));
    }
```

이 로직은 S3에 업로드되어 있는 파일의 정보를 메일에 첨부하는 역할을 하고 있습니다. 그런데 이 역할이 컨트롤러에 같이 있기 때문에 소스가 길어 보였습니다.

```csharp
private async Task<List<Attachment>> GetMailAttachmentListAsync(IEnumerable<ArticleFile> ArticleFile)
{
    FileS3Upload fileS3Upload = new FileS3Upload();
    var attachmentList = new List<Attachment>();
    foreach (var file in ArticleFile)
    {
        string subPath = $"/{file.CreateDate.ToString("yyyy")}/{file.CreateDate.ToString("MM")}/{file.CreateDate.ToString("dd")}";
        var bucketName = S3Path.GetS3UploadPathLocation(FileLocation.Article) + subPath;

        var stream = await fileS3Upload.DownloadS3ObjectAsync(file.FileS3Name, bucketName);

        attachmentList.Add(new Attachment(stream, file.FileViewName));
    }

    return attachmentList;
}
```

컨트롤러단에서 해당 부분을 빼서 함수로 분리하였습니다.

```csharp
    if (isSended)
        await _db.ArticleMailStateSuccessAsync(articleId);
    else
        await _db.ArticleMailStateFailureAsync(articleId);
```

이 로직은 메일이 발송 이후에 결과에 따라서 상태값 및 여러 작용을 하는 로직들인데 이 분기를 컨트롤러 단에서 하니 얇은 컨트롤러에 위배되는 것 같았습니다.

```csharp
private async Task UpdateArticleMailStateAsync(bool sendState, int ArticleId)
{
    if (sendState)
    {
        await _articleService.ArticleMailStateSuccessAsync(ArticleId);
    }
    else
    {
        await _articleService.ArticleMailStateFailureAsync(ArticleId);
    }
}
```

이 부분도 함수로 분리하였습니다. 그리고 변수명과 함수명들도 의미 있는 이름들로 변경하였습니다.

```csharp
[HttpPost]
[ValidateAntiForgeryToken]
public async Task<JsonResult> SendArticleMail(int articleId)
{
    var articleMail = await _articleService.GetArticleMailAsync(articleId);
    var attachmentList = await GetMailAttachmentListAsync(articleMail.MailContentsDto.ArticleFiles);
    var articleMailContents = await MailContents.GetArticleEmailContentsAsync(articleMail.MailContentsDto);

    var mailSendResult = await _emailService.SendMailAsync(articleMail.Title, articleMailContents, articleMail.ReceiverList, attachmentList, "smtp_2");
    await UpdateArticleMailStateAsync(mailSendResult, articleId);

    return Json(new { status = 1 });
}
```

이후에 컨트롤러단의 코드는 얇아졌습니다. ASP.NET MVC 또는 ASP.NET Core MVC에서 얇은 컨트롤러의 장점은 테스트하는데 간편해지고, 코드가 단순해지며 확장 또는 유지보수에 이점이 있습니다.

몇 개월 전부터 클린 코드에 관심을 갖고 읽었지만 코드를 작성할 때마다 클린 코드를 생각했지만 시간이 지나서 보면 클린 코드에 맞지 않는 코드를 작성할 때가 많았던 것 같습니다. 시간이 지나면 코드를 한번씩 읽어보면서 리팩토링 하는 습관을 가져야 할 것 같습니다.

---
### Reference

https://github.com/thangchung/clean-code-dotnet