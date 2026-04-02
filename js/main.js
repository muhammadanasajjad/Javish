const editor = document.getElementById("editor");
const highlighted = document.getElementById("highlighted");
const output = document.getElementById("output");
const tokensPanel = document.getElementById("tokens");
const astPanel = document.getElementById("ast");
const runBtn = document.getElementById("runBtn");
const clearBtn = document.getElementById("clearBtn");
const divider = document.getElementById("divider");
const sidebar = document.getElementById("sidebar");
const lineNumbers = document.getElementById("lineNumbers");

function escapeHTML(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlightTokenise(input) {
  const tokens = [];
  let pos = 0;

  // TODO: ADD FULL FEATURE SET FOR FUTURE INCLUDED
  const highlightRules = [
    { matcher: /^\b(int|float|string|boolean|void)\b/, type: "type-keyword" },
    { matcher: /^\b(if|else|for|while|return)\b/, type: "control-keyword" },

    { matcher: /^\binit\b/, type: "constructor-keyword" },
    { matcher: /^\b(class|struct|enum)\b/, type: "declaration-keyword" },

    {
      matcher: /^\bclass\s+([a-zA-Z_][a-zA-Z0-9_]*)/,
      type: "class-declaration",
    },

    {
      matcher: /^\b(public|private|protected|static|const|final)\b/,
      type: "modifier-keyword",
    },

    { matcher: /^\bnew\b/, type: "operator-new" },
    { matcher: /^\bthis\b/, type: "special-keyword" },

    { matcher: /^"[^"\r\n]*"/, type: "string-literal" },
    { matcher: /^'[^'\r\n]*'/, type: "string-literal" },
    { matcher: /^\b\d+\.\d+f?\b/, type: "number-literal" },
    { matcher: /^\b\d+f?\b/, type: "number-literal" },
    { matcher: /^\btrue\b|^\bfalse\b/, type: "boolean-literal" },

    { matcher: /^\/\/[^\n]*/, type: "comment-line" },
    { matcher: /^\/\*[\s\S]*?\*\//, type: "comment-block" },

    { matcher: /^==|>=|<=|!=/, type: "operator-comparison" },
    { matcher: /^\|\||&&/, type: "operator-logical" },
    { matcher: /^[!<>=+\-*/%]/, type: "operator-arithmetic" },

    { matcher: /^[{}()\[\];,.]/, type: "punctuation" },

    { matcher: /^\n/, type: "line-break" },
    { matcher: /^[ \t]+/, type: "space" },

    { matcher: /^[a-zA-Z_][a-zA-Z0-9_]*/, type: "identifier" },
  ];

  while (pos < input.length) {
    let matched = false;

    for (const rule of highlightRules) {
      const match = input.slice(pos).match(rule.matcher);
      if (match && match.index === 0) {
        let value = match[0];
        let type = rule.type;

        if (type === "identifier") {
          const nextSlice = input.slice(pos + value.length).trimStart();
          const nextChar = nextSlice[0];
          if (nextChar === "(") type = "function-identifier";
          else type = "variable-identifier";
        }

        tokens.push({ type, value });
        pos += value.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      tokens.push({ type: "unknown", value: input[pos] });
      pos++;
    }
  }

  return tokens;
}

editor.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    e.preventDefault();
    const start = editor.selectionStart;
    const end = editor.selectionEnd;

    editor.value =
      editor.value.substring(0, start) + "    " + editor.value.substring(end);

    editor.selectionStart = editor.selectionEnd = start + 4;

    updateLineNumbers();
    updateHighlight();
  }
});

editor.addEventListener("input", () => {
  updateLineNumbers();
  updateHighlight();
});
editor.addEventListener("scroll", () => {
  highlighted.scrollTop = editor.scrollTop;
  highlighted.scrollLeft = editor.scrollLeft;
  lineNumbers.scrollTop = editor.scrollTop;
});

function updateHighlight() {
  const code = editor.value;
  const tokens = highlightTokenise(code);

  highlighted.innerHTML = tokens
    .map((t) => `<span class="token ${t.type}">${escapeHTML(t.value)}</span>`)
    .join("");
}

runBtn.addEventListener("click", runCode);
clearBtn.addEventListener("click", () => {
  output.innerHTML = "";
});

const palette = {
  "type-keyword": { bg: "#1a3a3a", border: "#2ac3de", text: "#2ac3de" },
  "control-keyword": { bg: "#2a1a3a", border: "#bb9af7", text: "#bb9af7" },
  identifier: { bg: "#23263a", border: "#a9b1d6", text: "#a9b1d6" },
  "variable-identifier": { bg: "#23263a", border: "#c0caf5", text: "#c0caf5" },
  "function-identifier": { bg: "#23263a", border: "#7aa2f7", text: "#7aa2f7" },
  "function-call": { bg: "#23263a", border: "#7dcfff", text: "#7dcfff" },
  "function-declaration": {
    bg: "#23263a",
    border: "#7aa2f7",
    text: "#7aa2f7",
  },
  "constructor-keyword": { bg: "#23263a", border: "#bb9af7", text: "#bb9af7" },
  "modifier-keyword": { bg: "#23263a", border: "#bb9af7", text: "#bb9af7" },
  "special-keyword": { bg: "#23263a", border: "#bb9af7", text: "#bb9af7" },
  "declaration-keyword": { bg: "#23263a", border: "#bb9af7", text: "#bb9af7" },
  "return-keyword": { bg: "#23263a", border: "#bb9af7", text: "#bb9af7" },
  "param-name": {
    bg: "#23263a",
    border: "#e0af68",
    text: "#e0af68",
  },
  "param-type": { bg: "#23263a", border: "#2ac3de", text: "#2ac3de" },
  "number-literal": { bg: "#3a2a1a", border: "#ff9e64", text: "#ff9e64" },
  "string-literal": { bg: "#1a2a1a", border: "#9ece6a", text: "#9ece6a" },
  "boolean-literal": { bg: "#3a2a1a", border: "#ff9e64", text: "#ff9e64" },
  "operator-arithmetic": { bg: "#1a2a3a", border: "#89ddff", text: "#89ddff" },
  "operator-comparison": { bg: "#1a2a3a", border: "#89ddff", text: "#89ddff" },
  "operator-logical": { bg: "#1a2a3a", border: "#89ddff", text: "#89ddff" },
  "operator-new": { bg: "#23263a", border: "#c0caf5", text: "#c0caf5" },
  assignment: { bg: "#1a2a3a", border: "#89ddff", text: "#89ddff" },
  "comment-line": {
    bg: "#23273a",
    border: "#565f89",
    text: "#565f89",
    fontStyle: "italic",
  },
  "comment-block": {
    bg: "#23273a",
    border: "#565f89",
    text: "#565f89",
    fontStyle: "italic",
  },
  punctuation: { bg: "#252535", border: "#737aa2", text: "#737aa2" },
  "brace-open": { bg: "#252535", border: "#737aa2", text: "#737aa2" },
  "brace-close": { bg: "#252535", border: "#737aa2", text: "#737aa2" },
  "paren-open": { bg: "#252535", border: "#737aa2", text: "#737aa2" },
  "paren-close": { bg: "#252535", border: "#737aa2", text: "#737aa2" },
  semicolon: { bg: "#252535", border: "#737aa2", text: "#737aa2" },
  comma: { bg: "#252535", border: "#737aa2", text: "#737aa2" },
  dot: { bg: "#252535", border: "#737aa2", text: "#737aa2" },
  unknown: { bg: "#2a2a2a", border: "#555", text: "#888" },
};

function runCode() {
  output.innerHTML = "";
  try {
    const code = editor.value;

    const tokens = tokenise(code);
    const renderedTokens = highlightTokenise(code);

    const tvWrap = document.getElementById("tokens");
    tvWrap.innerHTML = `<div class="tv-wrap">
      <div class="tv-controls" id="tv-controls"></div>
      <div class="tv-legend" id="tv-legend"></div>
      <div class="tv-lines" id="tv-lines"></div>
    </div>`;

    const fallback = { bg: "#2a2a2a", border: "#555", text: "#888" };

    function getStyle(type) {
      return palette[type] || fallback;
    }

    function groupByLine(toks) {
      const map = {};
      let line = 1;
      toks.forEach((t) => {
        const lines = t.value.split("\n");
        lines.forEach((part, idx) => {
          if (!map[line]) map[line] = [];
          map[line].push({ ...t, value: part });
          if (idx < lines.length - 1) line++;
        });
      });
      return map;
    }

    function renderTV() {
      const byLine = groupByLine(renderedTokens);
      const linesEl = document.getElementById("tv-lines");
      linesEl.innerHTML = "";
      for (const ln of Object.keys(byLine).sort((a, b) => a - b)) {
        const row = document.createElement("div");
        row.className = "tv-line";
        const num = document.createElement("div");
        num.className = "tv-linenum";
        num.textContent = ln;
        const toksEl = document.createElement("div");
        toksEl.className = "tv-tokens";
        for (const t of byLine[ln]) {
          if (t.type === "line-break") continue;
          if (t.type === "space") continue;
          const s = getStyle(t.type);
          const tok = document.createElement("span");
          tok.className = "tv-tok";
          tok.style.background = s.bg;
          tok.style.borderColor = s.border;
          tok.style.color = s.text;
          if (s.fontStyle) tok.style.fontStyle = s.fontStyle;
          tok.innerHTML = `${t.value}<span class="tv-type">${t.type}</span>`;
          tok.title = t.type;
          toksEl.appendChild(tok);
        }
        row.appendChild(num);
        row.appendChild(toksEl);
        linesEl.appendChild(row);
      }
    }

    renderTV();

    const ast = parse(tokens, code);
    renderAstGraph(ast);

    const env = makeEnv();
    const start = Date.now();
    run(ast, env, code).then((val) => {
      const end = Date.now();
      const duration = end - start;

      output.innerHTML += `<div class="customMessage" style="color:#6affb0">Finished</div>`;
      output.innerHTML += `<div class="customMessage" style="color:#6affb0">Took ${duration}ms</div>`;

      const longRunningJokes = [
        "Maybe try using an actual language like HTML?!",
        "Maybe try using a low level language like Assembly?!",
        "This code is taking longer than my last vacation...",
        "Patience is a virtue... but seriously, optimize your loops!",
        "Still counting... maybe the CPU needs a nap...",
        "This feels like writing assembly in your browser...",
        "If this takes any longer, consider learning Python!",
        "Congratulations! You've just summoned the slowest algorithm alive!",
        "Is this code or modern art?",
        "Waiting... maybe try C++ next time for fun!",
        "This is slower than a snail on a sticky note...",
        "Still running... don't forget to stretch your fingers!",
        "Help! Maybe someone should optimise the interpreter!",
      ];
      if (
        duration > 1000 &&
        !tokens.some(
          (t, i) =>
            t.value === "input" && tokens[i + 1] && tokens[i + 1].value === "(",
        )
      ) {
        output.innerHTML += `<div class="customMessage" style="color:#ff6e64">Wow that took long!</div>
                            <div class="customMessage" style="color:#ff6e64">${longRunningJokes[Math.floor(Math.random() * longRunningJokes.length)]}</div>`;
      }

      output.scrollTo({
        top: output.scrollHeight,
        behavior: "smooth",
      });
    });
  } catch (e) {
    console.error(e);
    try {
      if (e.message == "too much recursion")
        throwCustomError("Too Much Recursion!");
    } catch (e) {}
  }
}

function astToVisNodesEdges(
  node,
  parentId = null,
  nodes = [],
  edges = [],
  depth = 0,
) {
  const id = nodes.length;

  const nodeColorMap = {
    NewExpression: "declaration-keyword",
    ArrayDeclaration: "declaration-keyword",
    NewArrayExpression: "declaration-keyword",
    IndexExpression: "operator-arithmetic",
    FunctionDeclaration: "function-declaration",
    MethodDeclaration: "function-declaration",
    ClassDeclaration: "declaration-keyword",
    ConstructorDeclaration: "constructor-keyword",
    ObjectDeclaration: "declaration-keyword",
    MemberAssignment: "assignment",
    FunctionCall: "function-call",
    MethodCall: "function-call",
    ConstructorCall: "constructor-keyword",
    Declaration: "declaration-keyword",
    Assignment: "assignment",
    IndexAssignment: "assignment",
    IfStatement: "control-keyword",
    WhileStatement: "control-keyword",
    ForStatement: "control-keyword",
    ReturnStatement: "return-keyword",
    BinaryExpr: "operator-arithmetic",
    Identifier: "variable-identifier",
    Param: "param-name",
    Type: "param-type",
    Int: "number-literal",
    Float: "number-literal",
    String: "string-literal",
    Boolean: "boolean-literal",
  };

  const style = palette[nodeColorMap[node.type] || "unknown"];
  let extraLabel = node.name ?? node.value ?? node.operator ?? "";

  if (node.type === "MemberAssignment") {
    extraLabel = node.object + "." + node.property;
  }
  if (node.type === "IndexAssignment") {
    extraLabel = "";
  }

  nodes.push({
    id,
    label: node.type + (extraLabel ? ` (${extraLabel})` : ""),
    level: depth,
    color: {
      background: style.bg,
      border: style.border,
      highlight: {
        background: style.bg,
        border: style.border,
      },
    },
    font: {
      color: style.text,
      highlight: style.bg,
    },
  });

  if (parentId !== null) edges.push({ from: parentId, to: id });

  if (node.type === "ObjectDeclaration" && node.value.params) {
    node.value.params.forEach((c) =>
      astToVisNodesEdges(c, id, nodes, edges, depth + 1),
    );
    return;
  }

  if (node.body)
    node.body.forEach((c) =>
      astToVisNodesEdges(c, id, nodes, edges, depth + 1),
    );

  if (node.params)
    node.params.forEach((c) =>
      astToVisNodesEdges(c, id, nodes, edges, depth + 1),
    );

  if (node.left) astToVisNodesEdges(node.left, id, nodes, edges, depth + 1);

  if (node.right) astToVisNodesEdges(node.right, id, nodes, edges, depth + 1);

  if (node.thenCase)
    node.thenCase.forEach((c) =>
      astToVisNodesEdges(c, id, nodes, edges, depth + 1),
    );

  if (node.elseCase)
    node.elseCase.forEach((c) =>
      astToVisNodesEdges(c, id, nodes, edges, depth + 1),
    );

  if (node.value && node.value.value !== undefined) {
    const valId = nodes.length;

    const valType =
      node.value.type === "String"
        ? "string-literal"
        : node.value.type === "Int" || node.value.type === "Float"
          ? "number-literal"
          : "boolean-literal";

    const valStyle = palette[valType];

    nodes.push({
      id: valId,
      label:
        node.value.type === "String"
          ? `"${node.value.value}"`
          : `${node.value.value}`,
      level: depth + 1,
      color: {
        background: valStyle.bg,
        border: valStyle.border,
        highlight: {
          background: valStyle.bg,
          border: valStyle.border,
        },
      },
      font: {
        color: valStyle.text,
      },
    });

    edges.push({ from: id, to: valId });
  } else if (node.value && typeof node.value === "object") {
    astToVisNodesEdges(node.value, id, nodes, edges, depth + 1);
  }

  return { nodes, edges };
}

function renderAstGraph(ast) {
  astPanel.innerHTML = "";

  const { nodes, edges } = astToVisNodesEdges(ast);

  const nodesDS = new vis.DataSet(nodes);
  const edgesDS = new vis.DataSet(edges);

  const options = {
    layout: {
      hierarchical: {
        enabled: true,
        direction: "UD",
        sortMethod: "directed",
        levelSeparation: 120,
        nodeSpacing: 150,
        treeSpacing: 200,
        parentCentralization: true,
        blockShifting: true,
        edgeMinimization: true,
      },
    },
    nodes: {
      shape: "box",
      font: { color: "#fff" },
      margin: 10,
    },
    edges: {
      arrows: "to",
      color: "#aaa",
      smooth: {
        type: "cubicBezier",
        forceDirection: "none",
      },
    },
    physics: {
      enabled: true,
      hierarchicalRepulsion: {
        avoidOverlap: 1,
      },
    },
  };

  const network = new vis.Network(
    astPanel,
    { nodes: nodesDS, edges: edgesDS },
    options,
  );

  // network.once("stabilizationIterationsDone", () => {
  //   const positions = network.getPositions();
  //   nodesDS.forEach((node) => {
  //     node.x = positions[node.id].x;
  //     node.y = positions[node.id].y;
  //   });
  //   nodesDS.update(nodesDS.get());

  //   network.setOptions({
  //     physics: false,
  //     layout: { hierarchical: false },
  //   });
  // });

  const childrenMap = {};
  edges.forEach((edge) => {
    if (!childrenMap[edge.from]) childrenMap[edge.from] = [];
    childrenMap[edge.from].push(edge.to);
  });

  function getDescendants(nodeId) {
    const result = [];
    const stack = [...(childrenMap[nodeId] || [])];

    while (stack.length) {
      const current = stack.pop();
      result.push(current);

      const children = childrenMap[current] || [];
      stack.push(...children);
    }

    return result;
  }

  const collapsed = new Set();

  network.on("doubleClick", (params) => {
    if (!params.nodes.length) return;

    const nodeId = params.nodes[0];
    const descendants = getDescendants(nodeId);
    const shouldHide = !collapsed.has(nodeId);

    descendants.forEach((id) => nodesDS.update({ id, hidden: shouldHide }));
    edges.forEach((edge) => {
      if (descendants.includes(edge.to))
        edgesDS.update({ id: edge.id, hidden: shouldHide });
    });

    if (shouldHide) collapsed.add(nodeId);
    else collapsed.delete(nodeId);
  });
}

let isResizing = false;
divider.addEventListener("mousedown", () => {
  isResizing = true;
});
document.addEventListener("mouseup", () => {
  isResizing = false;
});
document.addEventListener("mousemove", (e) => {
  if (!isResizing) return;
  const newWidth = e.clientX;
  if (newWidth > 100 && newWidth < window.innerWidth - 100) {
    sidebar.style.width = newWidth + "px";
  }
});

document.querySelectorAll(".resizable-vertical").forEach((panel) => {
  const resizer = panel.querySelector(".resizer-vertical");
  resizer.addEventListener("mousedown", (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = panel.offsetHeight;

    const onMouseMove = (e) => {
      const dy = e.clientY - startY;
      const newHeight = startHeight - dy;
      if (newHeight > 40 && newHeight < window.innerHeight - 100) {
        panel.style.flex = "none";
        panel.style.height = newHeight + "px";
      }
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });
});

function updateLineNumbers() {
  const lines = editor.value.split("\n").length;

  let html = "";
  for (let i = 1; i <= lines; i++) {
    html += `<div>${i}</div>`;
  }

  lineNumbers.innerHTML = html;
}

updateLineNumbers();
updateHighlight();

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

int addVal = int(input("Enter amount to add: "));
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
string msg = input("Enter message: ");
int shift = int(input("Enter shift: "));

string result = "";
int i = 0;

while (i < msg.length) {
  int code = ord(msg[i]);
  code = (code + shift) % 256;
  result = result + chr(code);
  i = i + 1;
}

print("Encrypted: " + result);

// decrypt
string decrypted = "";
i = 0;

while (i < result.length) {
  int code = ord(result[i]);
  code = (code - shift + 256) % 256;
  decrypted = decrypted + chr(code);
  i = i + 1;
}

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

function getRandomPreset() {
  const index = Math.floor(Math.random() * presets.length);
  return presets[index];
}

window.addEventListener("DOMContentLoaded", () => {
  const editor = document.getElementById("editor");
  if (editor.value === "" || presets.includes(editor.value))
    editor.value = getRandomPreset();

  updateLineNumbers();
  updateHighlight();
});
