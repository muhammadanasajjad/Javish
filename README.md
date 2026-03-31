# Javish – A Simple Typed Interpreted Language

**Javish** is a lightweight, typed programming language that runs entirely in the browser using pure JavaScript, HTML, and CSS. It’s designed to be simple, readable, and fun to experiment with—similar to C/Java syntax but with minimal overhead.

---

## **Features**

- Strongly typed: `int`, `boolean`, `string`, `void`
- Functions with recursion
- Loops (`for`) and conditionals (`if/else`)
- Arithmetic and logical operators
- Printing to output via `print(value);`
- No arrays, lists, or classes
- Runs fully in the browser

---

## **Syntax Example**

```javish
int a = 1;
int b = 1;

void fib(int n) {
    if (n <= 0) {
        return 0;
    }
    int next = a + b;
    print(next);
    a = b;
    b = next;
    fib(n - 1);
}

fib(10);

boolean flag = true;
if (flag) {
    print(1);
} else {
    print(0);
}

string greeting = "Hello";
string name = "World";
print(greeting + " " + name);
```
