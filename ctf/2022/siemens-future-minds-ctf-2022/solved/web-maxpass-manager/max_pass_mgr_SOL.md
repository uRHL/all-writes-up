# Web: MaxPass Manager

You've been tasked with a pentesting engagement on a password manager platform, they've provided you with a mockup build of the website and they've asked you to find a way to login as "admin".

**Target**: 167.99.202.193:30162

---
First of all, we create a new user to see what can we do with it.
Once the user is authenticated successfully, the server returns an auth token

```js
Set-Cookie: session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNhY2EiLCJpYXQiOjE2NjM3NTc5Mjh9.4_vwHNSSJhjBi0g5WMQnY1WCXqEgMKPDwxnxL2Pvzlk; 
```

If we navigate to the dashboard, the saved passwords are displayed. 
Each password is loaded independently with a request indicating the uuid of the password </api/passwords/[uuid]>. For example: `/api/passwords/144 + cookie:session`

The server returns **all** the password with that uuid, regardless the user that created them.

```json
{"passwords":[{"id":9,"uuid":144,"type":"Web","address":"167.99.202.193","username":"admin","password":"admin","note":"pw:admin"}]}
```

We are going to use Burp Intruder (Snipper) to brute force that path. For that we need a session cookie, but that is easy, since we got one when we logged in with our user.

We configure the snipper to brute force from uuid 0 to 999. Let's take a look into the responses.

The password we add with our user received the uuid 144. We observe that there are some uuids smaller than 144 that have passwords associated.

After reaching the uuid 300 we observe that there was no more hits since the uuid 144 (aparently it is the last one), so we decide to stop the brute force attack.

When we analyze the intercepted responses we see that there are some uuids with passwords. All the leaked password are saved in the file [leaked_pw.json](./leaked_pw.json). Among them there is a "pre-prod" password for admin user. Maybe it has been changed, but it is worth to try. 

Finally, using that "pre-prod" credential we got the flag: `HTB{ID0R_PWN4G3!!}`
