# Javish Language Documentation

## Overview

Javish is a simple, typed programming language that runs entirely in the browser using pure JavaScript, HTML, and CSS via a custom interpreter. It's designed to be readable and fun — similar to Java syntax.

## Table of Contents

- [Basic Syntax](#basic-syntax)
- [Data Types](#data-types)
- [Variables](#variables)
- [Operators](#operators)
- [Control Flow](#control-flow)
- [Functions](#functions)
- [Classes & Constructors](#classes--constructors)
- [Arrays](#arrays)
- [Input / Output](#input--output)
- [Examples](#examples)

---

## Basic Syntax

Statements end with a semicolon `;`.  
Blocks are enclosed in curly braces `{ }`.  
Comments:

```javish
// Single-line comment
/* Multi-line comment */
```

---

## Data Types

- `int` — Integer numbers, e.g. `int x = 5;`
- `float` — Decimal numbers, e.g. `float pi = 3.14;`
- `string` — Text, e.g. `string s = "hello";`
- `boolean` — True/false, e.g. `boolean flag = true;`
- `void` — No return value, e.g. `void foo() {}`

---

## Variables

Declare variables with a type and name:

```javish
int age = 20;
string name = "Anas";
boolean isActive = true;
```

Variables can be reassigned:

```javish
age = 25;
```

---

## Operators

- Arithmetic: `+`, `-`, `*`, `/`, `%`
- Comparison: `==`, `!=`, `<`, `>`, `<=`, `>=`
- Logical: `&&`, `||`, `!`

---

## Control Flow

### If / Else

```javish
if (x > 0) {
  print("Positive");
} else {
  print("Non-positive");
}
```

### While Loop

```javish
int i = 0;
while (i < 5) {
  print(i);
  i = i + 1;
}
```

### For Loop

```javish
for (int i = 0; i < 5; i = i + 1) {
  print(i);
}
```

---

## Functions

```javish
void greet(string name) {
  print("Hello " + name);
}

int add(int a, int b) {
  return a + b;
}
```

Calling functions:

```javish
greet("World");
int sum = add(5, 3);
```

---

## Classes & Constructors

```javish
class Counter {
  int value = 0;

  init Counter(int start) {
    this.value = start;
  }

  void increment() {
    this.value = this.value + 1;
  }

  void show() {
    print(this.value);
  }
}

Counter c = new Counter(10);
c.increment();
c.show();
```

---

## Arrays

### 1D Arrays

```javish
int[] arr = new int[5];
arr[0] = 10;
```

### 2D Arrays

```javish
int[][] matrix = new int[2][3];
matrix[0][0] = 1;
```

---

## Input / Output

### Input

```javish
string name = input("Enter your name: ");
```

### Output

```javish
print("Hello " + name);
```

---

## Examples

Examples can be found on the official Javish interpreter web app [here](https://javish-interpreter.web.app/).
