# Web: solid recruit

You've been tasked with a pentesting engagement on a recruitment portal system, they've provided you with a mockup build of the website and they've asked you to find a way to hijack sensitive information.

**Target**: 178.62.105.83:31673

---

First of all let's inspect the web portal. There is a login page. We try some default credentials (e.g. admin:admin), but any of them work. It is not going to be that easy.

We create a new user. Automatically we are redirected to the sign in page. It is courious that burp did not intercep any of those requests, so maybe the user is created in the client with JS. We log in with our new user. In this case, Burp was able to intercep the request. We are redirectedto to the dashboard (`/dashboard`).

There is a register form with 10 fields. It might be vulnerable to XSS. We try to inject a simple script into the field 'bibliography'. A 'success' message appears, regardless the contents of the fields, even if some of them are empty. Burp intecepts a request some seconds after the 'success' message is displayed, so once more we think that the processing of the form is done in the client.

We decide to inspect the static resource `form.js`. We observe that there is no input validation at all, only a double quote escaping. A further inspection of the file `routes/index.js` reveals that the path `/enroll` is used to register the 'employment request' form. This path cannot be brute forced since there is a puppeter "bot" (`bot.js`) that inspects the form and makes another request (`http://127.0.0.1:1337/review?username=${username}`).

`bot.js` opens a new incognito browser, add a cookie to the request (flag), then navigates to another page (`/review`), and finally the browser is closed. All that is executed locally in the server side, not in the client like we tough, so we cannot intercept those requests. We need to **intercept that request since it contains the cookie**.

```js
[...]
const reviewForm = async (username) => {
    try {
		const browser = await puppeteer.launch(browser_options);
		let context = await browser.createIncognitoBrowserContext();
		let page = await context.newPage();
		await page.setCookie({
			name: "flag",
			'value': 'HTB{f4k3_fl4g_f0r_t3st1ng}',
			domain: "127.0.0.1:1337"
		});
		await page.goto(`http://127.0.0.1:1337/review?username=${username}`, {
			waitUntil: 'networkidle2',
			timeout: 5000
		});
		await browser.close();
    } catch(e) {
        console.log(e);
    }
};
```
We continue inspecting the file `routes/index.js`. There is another function, which performs the authentication against the DB, and generates a JWT. There is a secret key stored in the DB that is used to encrypt and verify those JWT, but the number of combinations is to big to brute force it.

The endpoint `api/enroll` reads from the request a JSON object with 10 fields ([parameters.json](./parameters.json)), the same number of fields that the form has, so we conclude that this endpoint is processing the form submissions. Nonetheless, only one of those fields is used to validate the form (`checkForm()`): the parameter `username`. If username exists and it is not empty, the form will be accepted, otherwise an error will be thrown. We may try to use 'admin' in the `username` field so that we could retrieve the information submited in the form by the admin user. The problem is that `username` is not included in the JSON object received. It is read from another part of the request. Since the web portal is using JWT, we conclude that the `username` is read from the session cookie. We do not have the necessary secret key to forge those session cookies, so we cannot trick the server to think that we are the admin user. This is a dead-end. We need to explore other solutions.


HOW COULD WE INTERCEPT THE REQUEST MADE BY THE BOT `http://127.0.0.1:1337/review?username=${username}`??
