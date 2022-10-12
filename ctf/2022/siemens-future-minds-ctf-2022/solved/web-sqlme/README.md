# Web: SQLme

I think my login panel application might be vulnerable, could you figure it out and try to login as admin?

**Target**: 139.59.183.170:30130

---

First we tried to brute force the login panel using Hydra and some dictionaries with common and leaked passwords. Unfortunatelly, the attack did not work.

We also observed that the password si generated using the function `randomBytes(32)`, which generates an string of 32 random bytes (1 byte per character). It is to expensive to brute force using incremental mode, so there must be another way to break the login.

We were pretty sure that the vulnerbaility was related with SQL injection, so we tried with sqlmap (`python3 sqlmap -u http://139.59.183.170:30130/login --data="username=admin&password=admin" -p username,password --current-db`), but it reported that the field was not injectable, what was very confusing for us. 

After a cofee brake, we started to try SQL injections manually. For our surprise, we found that the field `username` was injectable. Writting `admin' OR 1='1` in the username, with any password, and you will pass the login, since the password check is skipped with the OR clause.

Finally, after we are logged in the browser displays: `{"message":"HTB{no_parameterization_equals_pwn4g3}"}`


