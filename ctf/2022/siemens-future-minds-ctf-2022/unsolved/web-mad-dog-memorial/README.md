# Web: MadDog Memorial

You have been tasked with the pentesting engagement on the memorial website of the great Buford "Mad Dog" Tannen, who was a true patriotic countryman and the pride of Hill Valley! The Tannen family has asked you to find out any loopholes in the system and see if the admin account can be compromised. They don't want any teenager or a mad scientist to break in and discover the secrets they are hiding!

**Target**: 138.68.186.7:30986

---

The path `/posts/:id` may be injectable. We tried SQLmap but did not work.

We observe that the **user id** is obtained from the session cookie. If the user id is "admin", the web document will include the flag in the source HTML. This session cookie is not created if, when the page is loaded for the first time, the user already has one.

The session cookie is not a hash nor a random number, but a JSON Web Token. In the web page [jwt.io](https://jwt.io/) we can decode and debug the token to inspect its contents. In our case:

![[./jwt_decoded.png]]

We tried to forge our JWT for "admin" username but, since we do not have the secret key to encrypt it, the server refuses the JWT.

```
curl http://138.68.186.7:30986/ --cookie "session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjIifQ.eyJ1c2VybmFtZSI6InZpc2l0b3JfODRhNGZmIiwiaWF0IjoxNjYzNzc2NjY1fQ.XXXjV-5xLgdztIQza3acly_SYDNU-2OayFvA_-0Toms"
```

## Brute forcing JWT 

Which is the key used by the server to encrypt and verify JWTs?

In the file entrypoint.sh we observe the following commands. Two keys `PRODKEY` and `DEVKEY` are created, which are **random strings of 15 characters [a-zA-Z0-9]**.

```
DEVKEY=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 15 | head -n 1);
PRODKEY=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 15 | head -n 1)

[...]

INSERT INTO tannen_memorial.keystore VALUES (1,'${DEVKEY}');
INSERT INTO tannen_memorial.keystore VALUES (2,'${PRODKEY}');
```

Furthermore, in the file `JWTHelper.js` we observe that when the function `sign()`is called, by default it uses `kid=2`, which in the database corresponds with `PRODKEY`.

From the cookie session we know that the JWT is: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjIifQ.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNjYzNzk0NTAwfQ.VHZEtsv74UvUl9Y8Yxm9ei0uFaxI9dNmbWgGbYPRSGo`.

We though about brute forcing `PRODKEY` but the are too many combinations to break it in a feasible time (`hashcat jwt.txt -m 16500 -a 3 -w 3 -1 ?l?u?d ?1?1?1?1?1?1?1?1?1?1?1?1?1?1?1`)

## Breaking into the database

Let's try something different. In the file database.js we found the DB credentials:
- user: 'root'
- password: 'M@k3l@R!d3s$'
- database: 'tannen_memorial'

We know that MySQL DB are running on port 3306. We tried to access the DB using those credentials, but the connection is refused. Probably the firewall is dropping the the connection (nmap reported the port as filtered).


```bash
$> sudo nmap -sV -p3306 178.128.173.79 -Pn -v

Starting Nmap 7.80 ( https://nmap.org ) at 2022-09-21 22:52 CEST
NSE: Loaded 45 scripts for scanning.
Initiating Parallel DNS resolution of 1 host. at 22:52
Completed Parallel DNS resolution of 1 host. at 22:52, 0.40s elapsed
Initiating SYN Stealth Scan at 22:52
Scanning 178.128.173.79 [1 port]
Completed SYN Stealth Scan at 22:52, 2.02s elapsed (1 total ports)
Initiating Service scan at 22:52
NSE: Script scanning 178.128.173.79.
Initiating NSE at 22:52
Completed NSE at 22:52, 0.00s elapsed
Initiating NSE at 22:52
Completed NSE at 22:52, 0.00s elapsed
Nmap scan report for 178.128.173.79
Host is up.

PORT     STATE    SERVICE VERSION
3306/tcp filtered mysql

Read data files from: /usr/bin/../share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 3.35 seconds
           Raw packets sent: 2 (88B) | Rcvd: 0 (0B)

----------------------------------------------------------------
$> ssh root@178.128.173.79 -p 3306 

[...]

Connection is never stablished
```



