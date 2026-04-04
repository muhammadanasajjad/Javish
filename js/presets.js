const presets = [
  `// Sum of user input array
int size = int(input("Enter array size: "));

int[] arr = new int[size];
int i = 0;

while (i < arr.length) {
  arr[i] = int(input("Enter number " + string(i) + ": "));
  i = i + 1;
}

int sum = 0;
i = 0;
while (i < arr.length) {
  sum = sum + arr[i];
  i = i + 1;
}

print("Total: " + string(sum));`,

  `// Reverse a string using indexing
string s = input("Enter a string: ");

string result = "";
int i = s.length - 1;

while (i >= 0) {
  result = result + s[i];
  i = i - 1;
}

print("Reversed: " + result);`,

  `// 2D array (matrix) + sum
int rows = int(input("Enter number of rows: "));
int cols = int(input("Enter number of columns: "));

int[][] matrix = new int[rows][cols];

int i = 0;
while (i < rows) {
  int j = 0;
  while (j < cols) {
    matrix[i][j] = int(input("Enter value [" + string(i) + "][" + string(j) + "]: "));
    j = j + 1;
  }
  i = i + 1;
}

int total = 0;
i = 0;

while (i < matrix.length) {
  int j = 0;
  while (j < matrix[i].length) {
    total = total + matrix[i][j];
    j = j + 1;
  }
  i = i + 1;
}

print("Matrix sum: " + string(total));`,

  `// Simple class with methods and state
class Counter {
  int value = 0;

  init Counter(int start) {
    this.value = start;
  }

  void increment() {
    this.value = this.value + 1;
  }

  void add(int x) {
    this.value = this.value + x;
  }

  void show() {
    print("Counter: " + string(this.value));
  }
}

int start = int(input("Enter starting value: "));
Counter c = new Counter(start);

int addVal = int(input("Enter amount to add on top of single increment: "));
c.increment();
c.add(addVal);
c.show();`,

  `// Prime number checker
int n = int(input("Enter a number: "));

int i = 2;
boolean isPrime = true;

while (i < n) {
  if ((n % i) == 0) {
    isPrime = false;
  }
  i = i + 1;
}

if (isPrime) {
  print("Prime");
} else {
  print("Not prime");
}`,

  `// Caesar-like encryption
string encrypt(string message, int shift) {
  string result = "";
  int i = 0;
  
  while (i < message.length) {
    int code = ord(message[i]);
    code = (code + shift) % 256;
    result += chr(code);
    i += 1;
  }
  
  return result;
}

string decrypt(string encrypted, int shift) {
  string result = "";
  int i = 0;
  
  while (i < encrypted.length) {
    int code = ord(encrypted[i]);
    code = (code - shift + 256) % 256;
    result += chr(code);
    i += 1;
  }
  
  return result;
}

string message = input("Enter message: ");
int shift = int(input("Enter shift: "));

string encrypted = encrypt(message, shift);
print("Encrypted: " + encrypted);

string decrypted = decrypt(encrypted, shift);
print("Decrypted: " + decrypted);`,

  `// Find max in array
int size = int(input("Enter array size: "));
int[] arr = new int[size];

int i = 0;
while (i < size) {
  arr[i] = int(input("Enter number: "));
  i = i + 1;
}

int max = arr[0];
i = 1;

while (i < arr.length) {
  if (arr[i] > max) {
    max = arr[i];
  }
  i = i + 1;
}

print("Max: " + string(max));`,

  `// Nested arrays + lengths showcase
int n = int(input("Enter grid size: "));
int[][] grid = new int[n][n];

int i = 0;
while (i < grid.length) {
  int j = 0;
  while (j < grid[i].length) {
    grid[i][j] = i * j;
    j = j + 1;
  }
  i = i + 1;
}

print("Rows: " + string(grid.length));
print("Cols: " + string(grid[0].length));`,

  `// Run-Length Encoding (RLE) using strings
string text = input("Enter text to compress: ");

string result = "";
int i = 0;

while (i < text.length) {
  string current = text[i];
  int count = 1;
  int j = i + 1;
  while (j < text.length && text[j] == current) {
    count = count + 1;
    j = j + 1;
  }
  result = result + current + string(count);
  i = j;
}

print("RLE: " + result);`,

  `// Basic Diffie-Hellman demo
int prime = int(input("Enter prime: "));
int base = int(input("Enter base: "));
int alicePrivate = int(input("Enter Alice private key: "));
int bobPrivate = int(input("Enter Bob private key: "));

int alicePublic = 1;
int i = 0;
while (i < alicePrivate) {
  alicePublic = (alicePublic * base) % prime;
  i = i + 1;
}

int bobPublic = 1;
i = 0;
while (i < bobPrivate) {
  bobPublic = (bobPublic * base) % prime;
  i = i + 1;
}

int aliceShared = 1;
i = 0;
while (i < alicePrivate) {
  aliceShared = (aliceShared * bobPublic) % prime;
  i = i + 1;
}

int bobShared = 1;
i = 0;
while (i < bobPrivate) {
  bobShared = (bobShared * alicePublic) % prime;
  i = i + 1;
}

print("Alice key: " + string(aliceShared));
print("Bob key: " + string(bobShared));`,
];

const presetDetails = [
  {
    name: "Sum of User Input Array",
    description:
      "Demonstrates creating an array, taking input from the user, iterating over it using a while loop, and calculating the sum.",
    featuresUsed: [
      { name: "array", bg: "#23263a", border: "#c0caf5", text: "#c0caf5" },
      { name: "while loop", bg: "#2a1a3a", border: "#bb9af7", text: "#bb9af7" },
    ],
  },
  {
    name: "Reverse a String",
    description:
      "Shows how to access string characters by index and reverse a string using a while loop.",
    featuresUsed: [
      {
        name: "string indexing",
        bg: "#1a2a1a",
        border: "#9ece6a",
        text: "#9ece6a",
      },
      { name: "while loop", bg: "#2a1a3a", border: "#bb9af7", text: "#bb9af7" },
    ],
  },
  {
    name: "2D Array Matrix Sum",
    description:
      "Illustrates creating a two-dimensional array (matrix), iterating through rows and columns with nested while loops, and summing all elements.",
    featuresUsed: [
      { name: "2D array", bg: "#23263a", border: "#c0caf5", text: "#c0caf5" },
      {
        name: "nested loops",
        bg: "#2a1a3a",
        border: "#bb9af7",
        text: "#bb9af7",
      },
    ],
  },
  {
    name: "Simple Counter Class",
    description:
      "Introduces classes, constructors, maintaining state with class properties, and defining methods to manipulate that state.",
    featuresUsed: [
      { name: "class", bg: "#1a3a3a", border: "#2ac3de", text: "#2ac3de" },
      {
        name: "constructor",
        bg: "#23263a",
        border: "#bb9af7",
        text: "#bb9af7",
      },
      { name: "methods", bg: "#23263a", border: "#7aa2f7", text: "#7aa2f7" },
      { name: "state", bg: "#23263a", border: "#a9b1d6", text: "#a9b1d6" },
    ],
  },
  {
    name: "Prime Number Checker",
    description:
      "Checks if a number is prime using a while loop and conditionals, while demonstrating the use of boolean flags.",
    featuresUsed: [
      { name: "while loop", bg: "#2a1a3a", border: "#bb9af7", text: "#bb9af7" },
      {
        name: "if statement",
        bg: "#2a1a3a",
        border: "#bb9af7",
        text: "#bb9af7",
      },
      { name: "boolean", bg: "#3a2a1a", border: "#ff9e64", text: "#ff9e64" },
    ],
  },
  {
    name: "Caesar-Like Encryption",
    description:
      "Shows how to encode and decode a message using string indexing, ASCII conversion, and loops.",
    featuresUsed: [
      {
        name: "string indexing",
        bg: "#1a2a1a",
        border: "#9ece6a",
        text: "#9ece6a",
      },
      { name: "ord/chr", bg: "#23263a", border: "#7dcfff", text: "#7dcfff" },
      { name: "while loop", bg: "#2a1a3a", border: "#bb9af7", text: "#bb9af7" },
      { name: "functions", bg: "#23263a", border: "#7dcfff", text: "#7dcfff" }
    ],
  },
  {
    name: "Find Max in Array",
    description:
      "Finds the maximum value in an array using iteration and conditional statements.",
    featuresUsed: [
      { name: "array", bg: "#23263a", border: "#c0caf5", text: "#c0caf5" },
      { name: "while loop", bg: "#2a1a3a", border: "#bb9af7", text: "#bb9af7" },
      {
        name: "if statement",
        bg: "#2a1a3a",
        border: "#bb9af7",
        text: "#bb9af7",
      },
    ],
  },
  {
    name: "Nested Arrays & Lengths",
    description:
      "Demonstrates creating nested arrays and accessing their length properties while iterating with nested loops.",
    featuresUsed: [
      { name: "2D array", bg: "#23263a", border: "#c0caf5", text: "#c0caf5" },
      {
        name: "nested loops",
        bg: "#2a1a3a",
        border: "#bb9af7",
        text: "#bb9af7",
      },
    ],
  },
  {
    name: "Run-Length Encoding (RLE)",
    description:
      "Implements a basic run-length encoding algorithm using string indexing and nested loops.",
    featuresUsed: [
      {
        name: "string indexing",
        bg: "#1a2a1a",
        border: "#9ece6a",
        text: "#9ece6a",
      },
      {
        name: "nested loops",
        bg: "#2a1a3a",
        border: "#bb9af7",
        text: "#bb9af7",
      },
    ],
  },
  {
    name: "Basic Diffie-Hellman Demo",
    description:
      "Simulates a basic Diffie-Hellman key exchange to demonstrate loops and modular arithmetic.",
    featuresUsed: [
      { name: "while loop", bg: "#2a1a3a", border: "#bb9af7", text: "#bb9af7" },
      { name: "modulus", bg: "#1a2a3a", border: "#89ddff", text: "#89ddff" },
    ],
  },
];

const presetContainer = document.getElementById("presets");
for (let i = 0; i < presets.length; i++) {
  const preset = presets[i];
  const details = presetDetails[i];
  const button = document.createElement("button");
  if (i == presets.length - 1) button.classList.add("last");
  let featuresHTML = "";
  for (let j = 0; j < details.featuresUsed.length; j++) {
    const feature = details.featuresUsed[j];
    featuresHTML += `<div class="feature" style="background-color: ${feature.bg}; border-color: ${feature.border}; color: ${feature.text}">${feature.name}</div>`;
  }
  button.innerHTML = `<h3>${details.name}</h3><div class="feature-container">${featuresHTML}</div><p>${details.description}</p>`;
  button.addEventListener("click", () => {
    editor.value = preset;
    updateHighlight();
    updateSidebar();
    updateLineNumbers();
  });
  presetContainer.appendChild(button);
}

const closeBtn = document.getElementById("preset-close");
closeBtn.addEventListener("click", () => {
  presetContainer.style.right = "-350px";
});

const openBtn = document.getElementById("preset-open");
openBtn.addEventListener("click", () => {
  presetContainer.style.right = "0px";
});
