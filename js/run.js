function makeEnv(parent = null) {
  return {
    variables: {},
    classes: {},
    functions: {
      print: [
        {
          type: "BUILTIN_FUNCTION",
          name: "print",
          call: async ({ value }) => {
            printCustomMessage(value);
            return { type: "void", value: null };
          },
          params: [{ type: "String", name: "value" }],
        },
        {
          type: "BUILTIN_FUNCTION",
          name: "print",
          call: async ({ value }) => {
            printCustomMessage(value);
            return { type: "void", value: null };
          },
          params: [{ type: "Float", name: "value" }],
        },
        {
          type: "BUILTIN_FUNCTION",
          name: "print",
          call: async ({ value }) => {
            printCustomMessage(value);
            return { type: "void", value: null };
          },
          params: [{ type: "Int", name: "value" }],
        },
        {
          type: "BUILTIN_FUNCTION",
          name: "print",
          call: async ({ value }) => {
            printCustomMessage(value);
            return { type: "void", value: null };
          },
          params: [{ type: "Boolean", name: "value" }],
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
        {
          type: "BUILTIN_FUNCTION",
          name: "input",
          call: async ({}) => {
            const value = await getCustomInput();
            return { type: "String", value };
          },
          params: [],
          returnType: "String",
        },
      ],

      // ✅ NEW: ord
      ord: [
        {
          type: "BUILTIN_FUNCTION",
          name: "ord",
          call: async ({ value }) => {
            if (value.length === 0)
              throwCustomError("ord() requires a non-empty string");
            return { type: "Int", value: value.charCodeAt(0) };
          },
          params: [{ type: "String", name: "value" }],
          returnType: "Int",
        },
      ],

      chr: [
        {
          type: "BUILTIN_FUNCTION",
          name: "chr",
          call: async ({ value }) => {
            return { type: "String", value: String.fromCharCode(value) };
          },
          params: [{ type: "Int", name: "value" }],
          returnType: "String",
        },
      ],

      int: [
        {
          type: "BUILTIN_FUNCTION",
          name: "int",
          call: async ({ value }) => ({ type: "Int", value: parseInt(value) }),
          params: [{ type: "Float", name: "value" }],
        },
        {
          type: "BUILTIN_FUNCTION",
          name: "int",
          call: async ({ value }) => ({ type: "Int", value: parseInt(value) }),
          params: [{ type: "String", name: "value" }],
        },
        {
          type: "BUILTIN_FUNCTION",
          name: "int",
          call: async ({ value }) => ({ type: "Int", value: value ? 1 : 0 }),
          params: [{ type: "Boolean", name: "value" }],
        },
      ],

      float: [
        {
          type: "BUILTIN_FUNCTION",
          name: "float",
          call: async ({ value }) => ({
            type: "Float",
            value: parseFloat(value),
          }),
          params: [{ type: "Int", name: "value" }],
        },
        {
          type: "BUILTIN_FUNCTION",
          name: "float",
          call: async ({ value }) => ({
            type: "Float",
            value: parseFloat(value),
          }),
          params: [{ type: "String", name: "value" }],
        },
        {
          type: "BUILTIN_FUNCTION",
          name: "float",
          call: async ({ value }) => ({
            type: "Float",
            value: value ? 1.0 : 0.0,
          }),
          params: [{ type: "Boolean", name: "value" }],
        },
      ],

      string: [
        {
          type: "BUILTIN_FUNCTION",
          name: "string",
          call: async ({ value }) => ({
            type: "String",
            value: value.toString(),
          }),
          params: [{ type: "Int", name: "value" }],
        },
        {
          type: "BUILTIN_FUNCTION",
          name: "string",
          call: async ({ value }) => ({
            type: "String",
            value: value.toString(),
          }),
          params: [{ type: "Float", name: "value" }],
        },
        {
          type: "BUILTIN_FUNCTION",
          name: "string",
          call: async ({ value }) => ({
            type: "String",
            value: value.toString(),
          }),
          params: [{ type: "Boolean", name: "value" }],
        },
      ],

      boolean: [
        {
          type: "BUILTIN_FUNCTION",
          name: "boolean",
          call: async ({ value }) => ({
            type: "Boolean",
            value: Boolean(value),
          }),
          params: [{ type: "Int", name: "value" }],
        },
        {
          type: "BUILTIN_FUNCTION",
          name: "boolean",
          call: async ({ value }) => ({
            type: "Boolean",
            value: Boolean(value),
          }),
          params: [{ type: "Float", name: "value" }],
        },
        {
          type: "BUILTIN_FUNCTION",
          name: "boolean",
          call: async ({ value }) => ({
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

const validOperators = {
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
    stopsEvaluation: (l) => l === true,
    stopEvaluationReturnValue: { type: "Boolean", value: true },
    getType: () => "Boolean",
  },
  "&&": {
    types: [["Boolean"]],
    operation: (l, r) => l && r,
    stopsEvaluation: (l) => l === false,
    stopEvaluationReturnValue: { type: "Boolean", value: false },
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

function paramsMatch(fParams, argTypes, argValues) {
  if (!fParams) return true;
  if (fParams.length !== argTypes.length) return false;
  return fParams.every((p, i) => {
    // Array parameter: p has dims > 0, argument type is "Array"
    if (p.dims && p.dims > 0) {
      if (argTypes[i] !== "Array") return false;
      const argVal = argValues[i];
      if (!argVal) return true;
      // Match base type
      if (argVal.baseName != null && argVal.baseName !== p.type) return false;
      // Match dimensionality
      if (argVal.dims != null && argVal.dims !== p.dims) return false;
      return true;
    }
    return p.type === argTypes[i];
  });
}

function lookupFunction(env, name, argTypes = [], argValues = []) {
  if (name in env.functions) {
    const overloads = env.functions[name];
    const fn = overloads.find((f) =>
      paramsMatch(f.params, argTypes, argValues),
    );
    if (fn) return fn;
    throwCustomError(
      `No overload for function '${name}' matches argument types (${argTypes.join(", ")}),`,
    );
  }
  if (env.parent) return lookupFunction(env.parent, name, argTypes, argValues);
  throwCustomError(`Function '${name}' is not yet defined`);
}

function lookupClass(env, name) {
  if (env.classes && name in env.classes) return env.classes[name];
  if (env.parent) return lookupClass(env.parent, name);
  throwCustomError(`Class '${name}' is not defined`);
}

const defaultValues = {
  Int: { type: "Int", value: 0 },
  Float: { type: "Float", value: 0.0 },
  Boolean: { type: "Boolean", value: false },
  String: { type: "String", value: "" },
};

function makeArray(size, remainingDims, baseName) {
  const arr = new Array(size);
  if (remainingDims.length > 0) {
    const nextSize = remainingDims[0];
    for (let i = 0; i < size; i++) {
      arr[i] = {
        type: "Array",
        value: makeArray(nextSize, remainingDims.slice(1), baseName),
      };
    }
  } else {
    const def = defaultValues[baseName];
    for (let i = 0; i < size; i++) {
      arr[i] = def ? { type: def.type, value: def.value } : null;
    }
  }
  return arr;
}

function resolveIndexTarget(arrayVal, indices) {
  let current = arrayVal;
  for (let i = 0; i < indices.length - 1; i++) {
    const idx = indices[i];
    if (current.type !== "Array")
      throwCustomError(`Cannot index into non-array type '${current.type}'`);
    const arr = current.value;
    if (idx < 0 || idx >= arr.length)
      throwCustomError(
        `Index ${idx} out of bounds for array of length ${arr.length}`,
      );
    current = arr[idx];
    if (current === null || current === undefined)
      throwCustomError(`Null reference at index ${idx}`);
  }
  return { container: current, lastIndex: indices[indices.length - 1] };
}

async function run(node, env, fullCode, thisEnv = null) {
  if (node == null) throwCustomError("Node is undefined", node, fullCode);

  if (
    node.type === "CommentLine" ||
    node.type === "CommentBlock" ||
    node.type === "EmptyStatement"
  )
    return;
  if (node.type === "Program") return await runProgram(node, env, fullCode);
  if (node.type === "Assignment")
    return await runAssignment(node, env, fullCode, thisEnv);
  if (node.type === "Declaration")
    return await runVariableDeclaration(node, env, fullCode, thisEnv);
  if (node.type === "ArrayDeclaration")
    return await runArrayDeclaration(node, env, fullCode, thisEnv);
  if (node.type === "ObjectDeclaration")
    return await runObjectDeclaration(node, env, fullCode, thisEnv);
  if (node.type === "NewExpression")
    return await runNewExpression(node, env, fullCode, thisEnv);
  if (node.type === "NewArrayExpression")
    return await runNewArrayExpression(node, env, fullCode, thisEnv);
  if (node.type === "IndexExpression")
    return await runIndexExpression(node, env, fullCode, thisEnv);
  if (node.type === "IndexAssignment")
    return await runIndexAssignment(node, env, fullCode, thisEnv);
  if (node.type === "BinaryExpr")
    return await runBinaryExpr(node, env, fullCode, thisEnv);
  if (node.type === "Identifier")
    return await runIdentifier(node, env, fullCode);
  if (node.type === "MemberExpression")
    return await runMemberExpression(node, env, fullCode, thisEnv);
  if (node.type === "MemberAssignment")
    return await runMemberAssignment(node, env, fullCode, thisEnv);
  if (node.type === "MethodCall")
    return await runMethodCall(node, env, fullCode, thisEnv);
  if (node.type === "IfStatement")
    return await runIfStatement(node, env, fullCode, thisEnv);
  if (node.type === "WhileStatement")
    return await runWhileStatement(node, env, fullCode, thisEnv);
  if (node.type === "ForStatement")
    return await runForStatement(node, env, fullCode, thisEnv);
  if (node.type === "FunctionDeclaration")
    return await runFunctionDeclaration(node, env, fullCode);
  if (node.type === "MethodDeclaration")
    return await runMethodDeclaration(node, env, fullCode);
  if (node.type === "FunctionCall")
    return await runFunctionCall(node, env, fullCode, thisEnv);
  if (node.type === "ReturnStatement")
    return await runReturnStatement(node, env, fullCode, thisEnv);
  if (node.type === "ClassDeclaration")
    return await runClassDeclaration(node, env, fullCode);
  if (node.type === "ConstructorDeclaration")
    return await runConstructorDeclaration(node, env, fullCode);

  if (node.constructor === Array) {
    for (let i = 0; i < node.length; i++) {
      const result = await run(node[i], env, fullCode, thisEnv);
      if (result && result.type === "Return") return result;
    }
    return;
  }

  if (["String", "Boolean", "Float", "Int"].includes(node.type))
    return await runLiteral(node, fullCode);

  throwCustomError(`Unknown node type: ${node.type}`, node, fullCode);
}

async function runLiteral(node, fullCode) {
  return { type: node.type, value: node.value };
}

async function runIdentifier(node, env, fullCode) {
  return lookupVariable(env, node.name);
}

async function runNewArrayExpression(node, env, fullCode, thisEnv) {
  const dimValues = [];
  for (const dimExpr of node.dimensions) {
    const val = await run(dimExpr, env, fullCode, thisEnv);
    if (val.type !== "Int")
      throwCustomError(
        `Array size must be Int, got '${val.type}'`,
        node,
        fullCode,
      );
    dimValues.push(val.value);
  }
  const firstSize = dimValues[0];
  const innerDims = dimValues.slice(1);
  const arr = makeArray(firstSize, innerDims, node.baseName);
  return { type: "Array", value: arr };
}

async function runArrayDeclaration(node, env, fullCode, thisEnv) {
  if (
    node.value.type === "NewArrayExpression" &&
    node.value.dimensions.length !== node.dims
  )
    throwCustomError(
      `Cannot assign a ${node.value.dimensions.length}-dimensional array to a ${node.dims}-dimensional '${node.baseName}' array`,
      node,
      fullCode,
    );
  const arrVal = await run(node.value, env, fullCode, thisEnv);
  if (arrVal.type !== "Array")
    throwCustomError(
      `Expected an array for '${node.name}', got '${arrVal.type}'`,
      node,
      fullCode,
    );
  if (env.variables[node.name] != null)
    throwCustomError(`Variable '${node.name}' already exists`, node, fullCode);
  env.variables[node.name] = {
    type: "Array",
    baseName: node.baseName,
    dims: node.dims,
    value: arrVal.value,
  };
}

async function runIndexExpression(node, env, fullCode, thisEnv) {
  const obj = await run(node.object, env, fullCode, thisEnv);
  if (obj.type === "String") {
    const idx = await run(node.index, env, fullCode, thisEnv);
    if (idx.type !== "Int")
      throwCustomError(
        `String index must be Int, got '${idx.type}'`,
        node,
        fullCode,
      );
    if (idx.value < 0 || idx.value >= obj.value.length)
      throwCustomError(
        `Index ${idx.value} out of bounds for string of length ${obj.value.length}`,
        node,
        fullCode,
      );
    return (
      { type: "String", value: obj.value[idx.value] } || {
        type: "String",
        value: "",
      }
    );
  }
  if (obj.type !== "Array")
    throwCustomError(
      `Cannot index into non-array type '${obj.type}'`,
      node,
      fullCode,
    );
  const idx = await run(node.index, env, fullCode, thisEnv);
  if (idx.type !== "Int")
    throwCustomError(
      `Array index must be Int, got '${idx.type}'`,
      node,
      fullCode,
    );
  const arr = obj.value;
  if (idx.value < 0 || idx.value >= arr.length)
    throwCustomError(
      `Index ${idx.value} out of bounds for array of length ${arr.length}`,
      node,
      fullCode,
    );
  const cell = arr[idx.value];
  if (cell === null || cell === undefined) return { type: "null", value: null };
  return cell;
}

async function runIndexAssignment(node, env, fullCode, thisEnv) {
  const value = await run(node.value, env, fullCode, thisEnv);

  function getChainDepthAndRoot(indexNode) {
    let depth = 0;
    let current = indexNode;
    while (current.type === "IndexExpression") {
      depth++;
      current = current.object;
    }
    return { depth, rootNode: current };
  }

  const { depth, rootNode } = getChainDepthAndRoot(node.object.object);
  const rootVar = await run(rootNode, env, fullCode, thisEnv);
  const baseName = rootVar.baseName;
  const totalDims = rootVar.dims;

  if (baseName != null) {
    const assignDepth = depth + 1;
    if (assignDepth === totalDims) {
      const valueTypeName =
        value.type === "Instance" ? value.className : value.type;
      if (valueTypeName !== baseName)
        throwCustomError(
          `Cannot assign type '${valueTypeName}' to array of base type '${baseName}'`,
          node,
          fullCode,
        );
    } else if (assignDepth < totalDims) {
      if (value.type !== "Array")
        throwCustomError(
          `Cannot assign non-array type '${value.type}' at dimension ${assignDepth} of a ${totalDims}-dimensional array`,
          node,
          fullCode,
        );
    } else {
      throwCustomError(
        `Too many index dimensions for a ${totalDims}-dimensional array`,
        node,
        fullCode,
      );
    }
  }

  async function resolveToParent(indexNode) {
    if (indexNode.type === "IndexExpression") {
      const parentArr = await resolveToParent(indexNode.object);
      if (parentArr.type !== "Array")
        throwCustomError(
          `Cannot index into non-array type '${parentArr.type}'`,
          node,
          fullCode,
        );
      const idx = await run(indexNode.index, env, fullCode, thisEnv);
      if (idx.type !== "Int")
        throwCustomError(
          `Array index must be Int, got '${idx.type}'`,
          node,
          fullCode,
        );
      const cell = parentArr.value[idx.value];
      if (cell === null || cell === undefined)
        throwCustomError(
          `Null reference at index ${idx.value}`,
          node,
          fullCode,
        );
      return cell;
    }
    return await run(indexNode, env, fullCode, thisEnv);
  }

  const parentContainer = await resolveToParent(node.object.object);
  if (parentContainer.type === "String") {
    const idx = await run(node.object.index, env, fullCode, thisEnv);
    if (idx.type !== "Int")
      throwCustomError(
        `String index must be Int, got '${idx.type}'`,
        node,
        fullCode,
      );
    if (idx.value < 0 || idx.value >= parentContainer.value.length)
      throwCustomError(
        `Index ${idx.value} out of bounds for string of length ${parentContainer.value.length}`,
        node,
        fullCode,
      );

    if (value.type !== "String" || value.value.length !== 1)
      throwCustomError(
        `Can only assign single-character strings to string indices, got '${value.type}' with length ${value.value.length}`,
        node,
        fullCode,
      );
    const strArr = parentContainer.value.split("");
    strArr[idx.value] = value.value;
    parentContainer.value = strArr.join("");
    return;
  }

  if (parentContainer.type !== "Array")
    throwCustomError(
      `Cannot index into non-array type '${parentContainer.type}'`,
      node,
      fullCode,
    );
  const idx = await run(node.object.index, env, fullCode, thisEnv);
  if (idx.type !== "Int")
    throwCustomError(
      `Array index must be Int, got '${idx.type}'`,
      node,
      fullCode,
    );
  const arr = parentContainer.value;
  if (idx.value < 0 || idx.value >= arr.length)
    throwCustomError(
      `Index ${idx.value} out of bounds for array of length ${arr.length}`,
      node,
      fullCode,
    );
  arr[idx.value] = value;
}

async function runMemberExpression(node, env, fullCode, thisEnv) {
  if (node.object === "this") {
    if (!thisEnv)
      throwCustomError(`'this' used outside of a class`, node, fullCode);
    const val = thisEnv.variables[node.property];
    if (val == null)
      throwCustomError(
        `Property '${node.property}' does not exist on this`,
        node,
        fullCode,
      );
    return val;
  }

  const obj = await run(node.object, env, fullCode, thisEnv);

  if (obj.type === "String" && node.property === "length") {
    return { type: "Int", value: obj.value.length };
  }

  if (obj.type === "Array" && node.property === "length") {
    return { type: "Int", value: obj.value.length };
  }

  // Instance property access
  const instanceEnv =
    obj.type === "Instance"
      ? obj.value
      : obj.value?.variables
        ? obj.value
        : null;

  if (!instanceEnv)
    throwCustomError(
      `Cannot access property '${node.property}' on type '${obj.type}'`,
      node,
      fullCode,
    );

  const val = instanceEnv.variables[node.property];
  if (val == null)
    throwCustomError(
      `Property '${node.property}' does not exist on instance`,
      node,
      fullCode,
    );
  return val;
}

async function runMemberAssignment(node, env, fullCode, thisEnv) {
  if (node.object === "this") {
    if (!thisEnv)
      throwCustomError(
        `'this' used outside of a class method or constructor`,
        node,
        fullCode,
      );
    const expression = await run(node.value, env, fullCode, thisEnv);
    const existing = thisEnv.variables[node.property];
    if (existing != null && existing.type !== expression.type)
      throwCustomError(
        `this.${node.property} is of type ${existing.type} not ${expression.type}`,
        node,
        fullCode,
      );
    thisEnv.variables[node.property] = {
      type: expression.type,
      value: expression.value,
    };
    return;
  }

  const obj = await run(node.object, env, fullCode, thisEnv);

  const instanceEnv =
    obj.type === "Instance"
      ? obj.value
      : obj.value?.variables
        ? obj.value
        : null;
  if (!instanceEnv)
    throwCustomError(
      `Cannot assign property '${node.property}' on non-instance type '${obj.type}'`,
      node,
      fullCode,
    );

  const expression = await run(node.value, env, fullCode, thisEnv);
  const existing = instanceEnv.variables[node.property];
  if (existing != null && existing.type !== expression.type)
    throwCustomError(
      `${node.object}.${node.property} is of type ${existing.type} not ${expression.type}`,
      node,
      fullCode,
    );

  instanceEnv.variables[node.property] = {
    type: expression.type,
    value: expression.value,
  };
}

async function runMethodCall(node, env, fullCode, thisEnv) {
  if (node.object === "this") {
    if (!thisEnv)
      throwCustomError(
        `'this' used outside of a class method or constructor`,
        node,
        fullCode,
      );

    const argValues = [];
    for (const p of node.params ?? []) {
      argValues.push(await run(p, env, fullCode, thisEnv));
    }
    const argTypes = argValues.map((v) => v.type);
    const fn = lookupFunction(thisEnv, node.name, argTypes, argValues);
    const localEnv = makeEnv(thisEnv);
    for (let i = 0; i < fn.params.length; i++) {
      localEnv.variables[fn.params[i].name] = argValues[i];
    }
    for (const stmt of fn.body) {
      const result = await run(stmt, localEnv, fullCode, thisEnv);
      if (result && result.type === "Return") {
        return result.value ?? { type: "void", value: null };
      }
    }
    return { type: "void", value: null };
  }

  const obj = await run(node.object, env, fullCode, thisEnv);

  const instanceEnv =
    obj.type === "Instance"
      ? obj.value
      : obj.value?.variables
        ? obj.value
        : null;
  if (!instanceEnv)
    throwCustomError(
      `Cannot call method '${node.name}' on non-instance type '${obj.type}'`,
      node,
      fullCode,
    );

  const argValues = [];
  for (const p of node.params ?? []) {
    argValues.push(await run(p, env, fullCode, thisEnv));
  }
  const argTypes = argValues.map((v) => v.type);
  const fn = lookupFunction(instanceEnv, node.name, argTypes, argValues);
  const localEnv = makeEnv(instanceEnv);
  for (let i = 0; i < fn.params.length; i++) {
    localEnv.variables[fn.params[i].name] = argValues[i];
  }

  if (fn.type === "BUILTIN_FUNCTION") {
    const params = {};
    for (let i = 0; i < fn.params.length; i++) {
      params[fn.params[i].name] = argValues[i].value;
    }
    return await fn.call(params);
  }

  for (const stmt of fn.body) {
    const result = await run(stmt, localEnv, fullCode, instanceEnv);
    if (result && result.type === "Return") {
      return result.value ?? { type: "void", value: null };
    }
  }
  return { type: "void", value: null };
}

async function runBinaryExpr(node, env, fullCode, thisEnv = null) {
  const left = await run(node.left, env, fullCode, thisEnv);

  const op = validOperators[node.operator];
  if (!op)
    throwCustomError(`Unknown operator: ${node.operator}`, node, fullCode);

  if (op.stopsEvaluation && op.stopsEvaluation(left.value)) {
    return op.stopEvaluationReturnValue;
  }

  const right = await run(node.right, env, fullCode, thisEnv);

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

  const resultValue = op.operation(left.value, right.value, lt, rt);
  const resultType = op.getType(lt, rt);

  return { type: resultType, value: resultValue };
}

async function runAssignment(node, env, fullCode, thisEnv = null) {
  const expression = await run(node.value, env, fullCode, thisEnv);
  const existing = lookupVariable(env, node.name);

  if (existing.type != expression.type)
    throwCustomError(
      `${node.name} is of type ${existing.type} not ${expression.type}`,
      node,
      fullCode,
    );

  setVariable(env, node.name, { type: existing.type, value: expression.value });
}

async function runVariableDeclaration(node, env, fullCode, thisEnv = null) {
  const expression = await run(node.value, env, fullCode, thisEnv);

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

async function runObjectDeclaration(node, env, fullCode, thisEnv = null) {
  const instance = await run(node.value, env, fullCode, thisEnv);

  if (instance.type !== "Instance")
    throwCustomError(
      `Expected an instance of class '${node.className}', got '${instance.type}'`,
      node,
      fullCode,
    );
  if (env.variables[node.name] != null)
    throwCustomError(`Variable '${node.name}' already exists`, node, fullCode);

  env.variables[node.name] = { type: node.className, value: instance.value };
}

async function runNewExpression(node, env, fullCode, thisEnv = null) {
  const classDef = lookupClass(env, node.className);

  const argValues = [];
  for (const arg of node.params) {
    argValues.push(await run(arg, env, fullCode, thisEnv));
  }
  const argTypes = argValues.map((v) => v.type);

  const ctor = lookupFunction(classDef, node.className, argTypes, argValues);

  const instanceEnv = makeEnv(classDef);

  for (let i = 0; i < ctor.params.length; i++) {
    instanceEnv.variables[ctor.params[i].name] = argValues[i];
  }

  for (const stmt of ctor.body) {
    const result = await run(stmt, instanceEnv, fullCode, instanceEnv);
    if (result && result.type === "Return") break;
  }

  return { type: "Instance", className: node.className, value: instanceEnv };
}

async function runIfStatement(node, env, fullCode, thisEnv = null) {
  const cond = await run(node.condition, env, fullCode, thisEnv);

  if (cond.type !== "Boolean")
    throwCustomError(
      `If statement requires type Boolean, type ${cond.type} was provided instead`,
      node,
      fullCode,
    );

  const localEnv = makeEnv(env);

  if (cond.value === true)
    return await run(node.thenCase, localEnv, fullCode, thisEnv);
  else if (node.elseCase)
    return await run(node.elseCase, localEnv, fullCode, thisEnv);
}

async function runWhileStatement(node, env, fullCode, thisEnv = null) {
  const localEnv = makeEnv(env);
  while ((await run(node.condition, localEnv, fullCode, thisEnv)).value) {
    const result = await run(node.body, makeEnv(localEnv), fullCode, thisEnv);
    if (result && result.type === "Return") return result;
  }
}

async function runForStatement(node, env, fullCode, thisEnv = null) {
  const localEnv = makeEnv(env);
  for (
    await run(node.init, localEnv, fullCode, thisEnv);
    (await run(node.condition, localEnv, fullCode, thisEnv)).value;
    await run(node.update, localEnv, fullCode, thisEnv)
  ) {
    const result = await run(node.body, makeEnv(localEnv), fullCode, thisEnv);
    if (result && result.type === "Return") return result;
  }
}

async function runFunctionDeclaration(node, env, fullCode) {
  if (!(node.name in env.functions)) env.functions[node.name] = [];
  env.functions[node.name].push(node);
}

async function runMethodDeclaration(node, env, fullCode) {
  if (!(node.name in env.functions)) env.functions[node.name] = [];
  env.functions[node.name].push(node);
}

async function runFunctionCall(node, env, fullCode, thisEnv = null) {
  const argValues = [];
  for (const p of node.params) {
    argValues.push(await run(p, env, fullCode, thisEnv));
  }
  const argTypes = argValues.map((v) => v.type);

  const fn = lookupFunction(env, node.name, argTypes, argValues);

  const localEnv = makeEnv(env);

  for (let i = 0; i < fn.params.length; i++) {
    localEnv.variables[fn.params[i].name] = argValues[i];
  }

  if (fn.type === "BUILTIN_FUNCTION") {
    const params = {};
    for (let i = 0; i < fn.params.length; i++) {
      params[fn.params[i].name] = argValues[i].value;
    }
    return await fn.call(params);
  }

  for (const stmt of fn.body) {
    const result = await run(stmt, localEnv, fullCode, thisEnv);
    if (result && result.type === "Return") {
      return result.value ?? { type: "void", value: null };
    }
  }

  return { type: "void", value: null };
}

async function runReturnStatement(node, env, fullCode, thisEnv = null) {
  if (node.value == null) return { type: "Return", value: null };
  return {
    type: "Return",
    value: await run(node.value, env, fullCode, thisEnv),
  };
}

async function runClassDeclaration(node, env, fullCode) {
  if (!env.classes) env.classes = {};
  const classEnv = makeEnv(env);
  for (const stmt of node.body) {
    if (stmt.type === "ConstructorDeclaration") {
      if (!classEnv.functions[stmt.name]) classEnv.functions[stmt.name] = [];
      classEnv.functions[stmt.name].push(stmt);
    } else if (stmt.type === "MethodDeclaration") {
      if (!classEnv.functions[stmt.name]) classEnv.functions[stmt.name] = [];
      classEnv.functions[stmt.name].push(stmt);
    } else {
      await run(stmt, classEnv, fullCode);
    }
  }
  env.classes[node.name] = classEnv;
  return { type: "Class", value: classEnv };
}

async function runConstructorDeclaration(node, env, fullCode) {
  const instanceEnv = makeEnv(env);

  for (const param of node.params) {
    instanceEnv.variables[param.name] = { type: param.type, value: null };
  }

  for (const stmt of node.body) {
    const result = await run(stmt, instanceEnv, fullCode, instanceEnv);
    if (result && result.type === "Return") return result.value;
  }

  return { type: "Instance", value: instanceEnv };
}

async function runProgram(node, env, fullCode) {
  let result;
  for (const stmt of node.body) {
    result = await run(stmt, env, fullCode);
  }
  return result;
}
