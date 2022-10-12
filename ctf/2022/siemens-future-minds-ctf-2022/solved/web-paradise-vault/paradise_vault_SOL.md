# Web: Paradise Vault

Great Scott! Marty, we need to find out when Biff Tannen got his hands on the sports almanac! It may be worth checking his paradise vault for any useful information. Biff is not that bright so his password should be easy enough to guess! Can you break into his vault and see what's in there?

**Target**: 138.68.186.7:31184

---

No additional files, just a login portal.

First attemp 'admin:admin'. It works. The clue here was in the description of the challenge "[...] Biff's credentials should be very dummy"

We are redirected to `/mfa`. It seems that we have to provide a OTP as a second factor of authentication, but we do not know how that OTP is generated. Maybe a physical device, or a software application.

We inspect the web page. There are 3 JavaScript files. One of them is called mfa.js. We open the file to see the source code.

There is an interesting function `requestOTP()`. It sends a request to an api that seems to be providing those OTPs. We navigate to that url and obtain an OTP:
`http://138.68.186.7:31184/api/otp/request -> {"otp":707149}`

Finally, we use that OTP to confirm the authentication. Succeed! 
`HTB{l34k1ng_0Tp_1nt0_Cl13n7s1d3_1s_b4d}`
