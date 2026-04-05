# Javish Language Documentation

## Overview

Javish is a simple, typed programming language that runs entirely in the browser using pure JavaScript, HTML, and CSS via a custom interpreter. It's designed to be readable and fun - similar to Java syntax.

## Table of Contents

- [Basic Syntax](#basic-syntax)
- [Data Types](#data-types)
- [Variables](#variables)
- [Operators](#operators)
- [Control Flow](#control-flow)
- [Functions](#functions)
- [Classes and Constructors](#classes-and-constructors)
- [Arrays](#arrays)
- [Built-in Functions](#built-in-functions)
- [Examples](#examples)

## Basic Syntax

Statements end with a semicolon `;`.  
Blocks are enclosed in curly braces `{ }`.  
Comments:

```javish
// Single-line comment
/* Multi-line comment */
```

## Data Types

- `int` - Integer numbers, e.g. `int x = 5;`
- `float` - Decimal numbers, e.g. `float pi = 3.14;`
- `string` - Text, e.g. `string s = "hello";`
- `boolean` - True/false, e.g. `boolean flag = true;`
- `void` - No return value, e.g. `void foo() {}`

## Variables

Declare variables with a type and name:

```javish
int age = 100;
string name = "Person";
boolean isActive = true;
```

Variables can be reassigned:

```javish
age = 101;
```

## Operators

- Arithmetic: `+`, `-`, `*`, `/`, `%`
- Comparison: `==`, `!=`, `<`, `>`, `<=`, `>=`
- Logical: `&&`, `||`

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

## Classes and Constructors

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

## Built-in Functions

Javish includes several built-in functions for input/output, type conversion, and character handling.

### print

Outputs a value to the console.

```javish
print("Hello World");
print(10);
print(3.14);
print(true);
```

### input

Reads user input as a string.

```javish
string name = input("Enter your name: ");
string value = input();
```

### ord

Returns the ASCII/Unicode value of the first character in a string.

```javish
int code = ord("A"); // 65
```

### chr

Converts an integer into its corresponding character.

```javish
string letter = chr(65); // "A"
```

### Type Conversions

#### int

Converts a value to an integer.

```javish
int a = int(3.7);
int b = int("42");
int c = int(true);
```

#### float

Converts a value to a float.

```javish
float a = float(5);
float b = float("3.14");
float c = float(false);
```

#### string

Converts a value to a string.

```javish
string a = string(10);
string b = string(3.14);
string c = string(true);
```

#### boolean

Converts a value to a boolean.

```javish
boolean a = boolean(1);
boolean b = boolean(0);
boolean c = boolean("true");
```

## Examples

Examples can be found on the official Javish interpreter web app [here](https://javish-interpreter.web.app/).
