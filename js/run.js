function makeEnv(parent = null) {
  return {
    variables: {},
    functions: {
      print: [
        {
          type: "BUILTIN_FUNCTION",
          name: "print",
          call: ({ value }) => {
            printCustomMessage(value);
            return { type: "void", value: null };
          },
          params: [{ type: "String", name: "value" }],
          returnType: undefined,
        },
        {
          type: "BUILTIN_FUNCTION",
          name: "print",
          call: ({ value }) => {
            printCustomMessage(value);
            return { type: "void", value: null };
          },
          params: [{ type: "Float", name: "value" }],
          returnType: undefined,
        },
        {
          type: "BUILTIN_FUNCTION",
          name: "print",
          call: ({ value }) => {
            printCustomMessage(value);
            return { type: "void", value: null };
          },
          params: [{ type: "Int", name: "value" }],
          returnType: undefined,
        },
        {
          type: "BUILTIN_FUNCTION",
          name: "print",
          call: ({ value }) => {
            printCustomMessage(value);
            return { type: "void", value: null };
          },
          params: [{ type: "Boolean", name: "value" }],
          returnType: undefined,
        },
      ],
      input: [
        {
          type: "BUILTIN_FUNCTION",
          name: "input",
          call: async ({ prompt }) => {
            printCustomMessage(prompt);
            const value = await getCustomInput();
            return { type: "String", value };
          },
          params: [{ type: "String", name: "prompt" }],
          returnType: "String",
        },
      ],
      Int: [
        {
          type: "BUILTIN_FUNCTION",
          name: "Int",
          call: ({ value }) => ({ type: "Int", value: parseInt(value) }),
          params: [{ type: "Float", name: "value" }],
        },
        {
          type: "BUILTIN_FUNCTION",
          name: "Int",
          call: ({ value }) => ({ type: "Int", value: parseInt(value) }),
          params: [{ type: "String", name: "value" }],
        },
        {
          type: "BUILTIN_FUNCTION",
          name: "Int",
          call: ({ value }) => ({ type: "Int", value: value ? 1 : 0 }),
          params: [{ type: "Boolean", name: "value" }],
        },
      ],
      Float: [
        {
          type: "BUILTIN_FUNCTION",
          name: "Float",
          call: ({ value }) => ({ type: "Float", value: parseFloat(value) }),
          params: [{ type: "Int", name: "value" }],
        },
        {
          type: "BUILTIN_FUNCTION",
          name: "Float",
          call: ({ value }) => ({ type: "Float", value: parseFloat(value) }),
          params: [{ type: "String", name: "value" }],
        },
        {
          type: "BUILTIN_FUNCTION",
          name: "Float",
          call: ({ value }) => ({ type: "Float", value: value ? 1.0 : 0.0 }),
          params: [{ type: "Boolean", name: "value" }],
        },
      ],
      String: [
        {
          type: "BUILTIN_FUNCTION",
          name: "String",
          call: ({ value }) => ({ type: "String", value: value.toString() }),
          params: [{ type: "Int", name: "value" }],
        },
        {
          type: "BUILTIN_FUNCTION",
          name: "String",
          call: ({ value }) => ({ type: "String", value: value.toString() }),
          params: [{ type: "Float", name: "value" }],
        },
        {
          type: "BUILTIN_FUNCTION",
          name: "String",
          call: ({ value }) => ({ type: "String", value: value.toString() }),
          params: [{ type: "Boolean", name: "value" }],
        },
      ],
      Boolean: [
        {
          type: "BUILTIN_FUNCTION",
          name: "Boolean",
          call: ({ value }) => ({ type: "Boolean", value: Boolean(value) }),
          params: [{ type: "Int", name: "value" }],
        },
        {
          type: "BUILTIN_FUNCTION",
          name: "Boolean",
          call: ({ value }) => ({ type: "Boolean", value: Boolean(value) }),
          params: [{ type: "Float", name: "value" }],
        },
        {
          type: "BUILTIN_FUNCTION",
          name: "Boolean",
          call: ({ value }) => ({
            type: "Boolean",
            value: value === "true" || value === true,
          }),
          params: [{ type: "String", name: "value" }],
        },
      ],
    },
    parent,
  };
}

const VALID_OPERATORS = {
  "+": {
    types: [["String", "Int", "Float"]],
    operation: (l, r) => l + r,
    getType: (lt, rt) =>
      lt === "String" || rt === "String"
        ? "String"
        : lt === "Int" && rt === "Int"
          ? "Int"
          : "Float",
  },
  "-": {
    types: [["Int", "Float"]],
    operation: (l, r) => l - r,
    getType: (lt, rt) => (lt === "Int" && rt === "Int" ? "Int" : "Float"),
  },
  "*": {
    types: [["Int", "Float"]],
    operation: (l, r) => l * r,
    getType: (lt, rt) => (lt === "Int" && rt === "Int" ? "Int" : "Float"),
  },
  "/": {
    types: [["Int", "Float"]],
    operation: (l, r, lt, rt) =>
      lt === "Int" && rt === "Int" ? Math.floor(l / r) : l / r,
    getType: (lt, rt) => (lt === "Int" && rt === "Int" ? "Int" : "Float"),
  },
  "%": {
    types: [["Int", "Float"]],
    operation: (l, r) => l % r,
    getType: (lt, rt) => (lt === "Int" && rt === "Int" ? "Int" : "Float"),
  },
  "<": {
    types: [["Int", "Float"]],
    operation: (l, r) => l < r,
    getType: () => "Boolean",
  },
  ">": {
    types: [["Int", "Float"]],
    operation: (l, r) => l > r,
    getType: () => "Boolean",
  },
  "<=": {
    types: [["Int", "Float"]],
    operation: (l, r) => l <= r,
    getType: () => "Boolean",
  },
  ">=": {
    types: [["Int", "Float"]],
    operation: (l, r) => l >= r,
    getType: () => "Boolean",
  },
  "==": {
    types: [["Int", "Float"], ["Boolean"], ["String"]],
    operation: (l, r) => l === r,
    getType: () => "Boolean",
  },
  "!=": {
    types: [["Int", "Float"], ["Boolean"], ["String"]],
    operation: (l, r) => l !== r,
    getType: () => "Boolean",
  },
  "||": {
    types: [["Boolean"]],
    operation: (l, r) => l || r,
    getType: () => "Boolean",
  },
  "&&": {
    types: [["Boolean"]],
    operation: (l, r) => l && r,
    getType: () => "Boolean",
  },
};

function lookupVariable(env, name) {
  if (name in env.variables) return env.variables[name];
  if (env.parent) return lookupVariable(env.parent, name);
  throwCustomError(`Variable '${name}' is not yet defined`);
}

function setVariable(env, name, value) {
  if (name in env.variables) env.variables[name] = value;
  else if (env.parent) setVariable(env.parent, name, value);
  else throwCustomError(`Variable '${name}' is not yet defined`);
}

function lookupFunction(env, name, argTypes = []) {
  if (name in env.functions) {
    const overloads = env.functions[name];
    const fn = overloads.find((f) => {
      if (!f.params) return true;
      if (f.params.length !== argTypes.length) return false;
      return f.params.every((p, i) => p.type === argTypes[i]);
    });
    if (fn) return fn;
    throwCustomError(
      `No overload for function '${name}' matches argument types (${argTypes.join(", ")})`,
    );
  }
  if (env.parent) return lookupFunction(env.parent, name, argTypes);
  throwCustomError(`Function '${name}' is not yet defined`);
}

function run(node, env, fullCode) {
  if (node == null) throwCustomError("Node is undefined", node, fullCode);
  if (node.type === "Program") return runProgram(node, env, fullCode);
  if (node.type === "Assignment") return runAssignment(node, env, fullCode);
  if (node.type === "Declaration")
    return runVariableDeclaration(node, env, fullCode);
  if (node.type === "BinaryExpr") return runBinaryExpr(node, env, fullCode);
  if (node.type === "Identifier") return runIdentifier(node, env, fullCode);
  if (node.type === "IfStatement") return runIfStatement(node, env, fullCode);
  if (node.type === "WhileStatement")
    return runWhileStatement(node, env, fullCode);
  if (node.type === "ForStatement") return runForStatement(node, env, fullCode);
  if (node.type === "FunctionDeclaration")
    return runFunctionDeclaration(node, env, fullCode);
  if (node.type === "FunctionCall") return runFunctionCall(node, env, fullCode);
  if (node.type === "ReturnStatement")
    return runReturnStatement(node, env, fullCode);
  if (node.constructor === Array) {
    for (const stmt of node) {
      const result = run(stmt, env, fullCode);
      if (result && result.type === "Return") return result;
    }
    return;
  }
  if (["String", "Boolean", "Int", "Float"].includes(node.type))
    return runLiteral(node);
  throwCustomError(`Unknown node type: ${node.type}`, node, fullCode);
}

function runLiteral(node) {
  return { type: node.type, value: node.value };
}

function runIdentifier(node, env) {
  return lookupVariable(env, node.name);
}

function runBinaryExpr(node, env, fullCode) {
  const left = run(node.left, env, fullCode);
  const right = run(node.right, env, fullCode);
  const l = left.value;
  const r = right.value;

  const op = VALID_OPERATORS[node.operator];
  if (!op)
    throwCustomError(`Unknown operator: ${node.operator}`, node, fullCode);
  const lt = left.type;
  const rt = right.type;
  let valid = false;
  for (const types of op.types) {
    if (types.includes(lt) && types.includes(rt)) {
      valid = true;
      break;
    }
  }
  if (!valid)
    throwCustomError(
      `No operator ${node.operator} defined for types ${lt} and ${rt}`,
      node,
      fullCode,
    );
  return { type: op.getType(lt, rt), value: op.operation(l, r, lt, rt) };
}

function runAssignment(node, env, fullCode) {
  const expression = run(node.value, env, fullCode);
  const existing = lookupVariable(env, node.name);
  if (existing.type != expression.type)
    throwCustomError(
      `${node.name} is of type ${existing.type} not ${expression.type}`,
      node,
      fullCode,
    );
  setVariable(env, node.name, { type: existing.type, value: expression.value });
}

function runVariableDeclaration(node, env, fullCode) {
  const expression = run(node.value, env, fullCode);
  if (env.variables[node.name] != null)
    throwCustomError(`Variable ${node.name} already exists`, node, fullCode);
  if (expression.type != node.varType)
    throwCustomError(
      `${node.name} is of type ${node.varType} not ${expression.type}`,
      node,
      fullCode,
    );
  env.variables[node.name] = { type: node.varType, value: expression.value };
}

function runIfStatement(node, env, fullCode) {
  const cond = run(node.condition, env, fullCode);
  if (cond.type !== "Boolean")
    throwCustomError(
      `If statement requires type Boolean, type ${cond.type} was provided instead`,
      node,
      fullCode,
    );
  const localEnv = makeEnv(env);
  if (cond.value === true) return run(node.thenCase, localEnv, fullCode);
  if (node.elseCase) return run(node.elseCase, localEnv, fullCode);
}

function runWhileStatement(node, env, fullCode) {
  const localEnv = makeEnv(env);
  while (run(node.condition, localEnv, fullCode).value) {
    const result = run(node.body, makeEnv(localEnv), fullCode);
    if (result && result.type === "Return") return result;
  }
}

function runForStatement(node, env, fullCode) {
  const localEnv = makeEnv(env);
  run(node.init, localEnv, fullCode);
  while (run(node.condition, localEnv, fullCode).value) {
    const result = run(node.body, makeEnv(localEnv), fullCode);
    if (result && result.type === "Return") return result;
    run(node.update, localEnv, fullCode);
  }
}

function runFunctionDeclaration(node, env, fullCode) {
  if (!(node.name in env.functions)) env.functions[node.name] = [];
  env.functions[node.name].push(node);
}

function runFunctionCall(node, env, fullCode) {
  const argValues = node.params.map((p) => run(p, env, fullCode));
  const argTypes = argValues.map((v) => v.type);
  const fn = lookupFunction(env, node.name, argTypes);
  const localEnv = makeEnv(env);
  for (let i = 0; i < fn.params.length; i++)
    localEnv.variables[fn.params[i].name] = argValues[i];
  if (fn.type === "BUILTIN_FUNCTION") {
    const args = {};
    for (let i = 0; i < fn.params.length; i++)
      args[fn.params[i].name] = argValues[i].value;
    return fn.call(args);
  }
  for (const stmt of fn.body) {
    const result = run(stmt, localEnv, fullCode);
    if (result && result.type === "Return")
      return result.value ?? { type: "void", value: null };
  }
  return { type: "void", value: null };
}

function runReturnStatement(node, env, fullCode) {
  if (node.value == null) return { type: "Return", value: null };
  return { type: "Return", value: run(node.value, env, fullCode) };
}

function runProgram(node, env, fullCode) {
  let result;
  for (const stmt of node.body) result = run(stmt, env, fullCode);
  return result;
}
