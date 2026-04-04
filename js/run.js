function getArrayDims(node) {
  if (node == null) return 0;
  if (node.dims != null) return node.dims;
  if (node.type !== "Array") return 0;
  return 1 + getArrayDims(node.value?.[0]);
}

function getArrayBaseName(node) {
  if (node == null) return null;
  if (node.baseName != null) return node.baseName;
  if (node.type !== "Array") return node.type;
  return getArrayBaseName(node.value?.[0]);
}

function arrayParamMatches(param, val) {
  if (val.type !== "Array") return false;
  if (param.baseName != null && getArrayBaseName(val) !== param.baseName) return false;
  if (param.dims   != null && getArrayDims(val)    !== param.dims)     return false;
  return true;
}

function arrayParamsEqual(a, b) {
  return getArrayBaseName(a) === getArrayBaseName(b) && getArrayDims(a) === getArrayDims(b);
}

function makeEnv(parent = null, copy = null) {
  const defaultEnv = {
    variables: {},
    classes: {},
    functions: {
      print: [
        { type: "BUILTIN_FUNCTION", name: "print", params: [{ type: "String",  name: "value" }], call: async ({ value }) => { printCustomMessage(value); return { type: "void", value: null }; } },
        { type: "BUILTIN_FUNCTION", name: "print", params: [{ type: "Float",   name: "value" }], call: async ({ value }) => { printCustomMessage(value); return { type: "void", value: null }; } },
        { type: "BUILTIN_FUNCTION", name: "print", params: [{ type: "Int",     name: "value" }], call: async ({ value }) => { printCustomMessage(value); return { type: "void", value: null }; } },
        { type: "BUILTIN_FUNCTION", name: "print", params: [{ type: "Boolean", name: "value" }], call: async ({ value }) => { printCustomMessage(value); return { type: "void", value: null }; } },
      ],

      input: [
        { type: "BUILTIN_FUNCTION", name: "input", params: [{ type: "String", name: "prompt" }], returnType: "String",
          call: async ({ prompt }) => { printCustomMessage(prompt); return { type: "String", value: await getCustomInput() }; } },
        { type: "BUILTIN_FUNCTION", name: "input", params: [], returnType: "String",
          call: async ({}) => ({ type: "String", value: await getCustomInput() }) },
      ],

      ord: [{ type: "BUILTIN_FUNCTION", name: "ord", params: [{ type: "String", name: "value" }], returnType: "Int",
        call: async ({ value }) => {
          if (value.length === 0) throwCustomError("ord() requires a non-empty string");
          return { type: "Int", value: value.charCodeAt(0) };
        } }],

      chr: [{ type: "BUILTIN_FUNCTION", name: "chr", params: [{ type: "Int", name: "value" }], returnType: "String",
        call: async ({ value }) => ({ type: "String", value: String.fromCharCode(value) }) }],

      int: [
        { type: "BUILTIN_FUNCTION", name: "int", params: [{ type: "Float",   name: "value" }], call: async ({ value }) => ({ type: "Int", value: parseInt(value) }) },
        { type: "BUILTIN_FUNCTION", name: "int", params: [{ type: "String",  name: "value" }], call: async ({ value }) => ({ type: "Int", value: parseInt(value) }) },
        { type: "BUILTIN_FUNCTION", name: "int", params: [{ type: "Boolean", name: "value" }], call: async ({ value }) => ({ type: "Int", value: value ? 1 : 0 }) },
      ],

      float: [
        { type: "BUILTIN_FUNCTION", name: "float", params: [{ type: "Int",     name: "value" }], call: async ({ value }) => ({ type: "Float", value: parseFloat(value) }) },
        { type: "BUILTIN_FUNCTION", name: "float", params: [{ type: "String",  name: "value" }], call: async ({ value }) => ({ type: "Float", value: parseFloat(value) }) },
        { type: "BUILTIN_FUNCTION", name: "float", params: [{ type: "Boolean", name: "value" }], call: async ({ value }) => ({ type: "Float", value: value ? 1.0 : 0.0 }) },
      ],

      string: [
        { type: "BUILTIN_FUNCTION", name: "string", params: [{ type: "Int",     name: "value" }], call: async ({ value }) => ({ type: "String", value: value.toString() }) },
        { type: "BUILTIN_FUNCTION", name: "string", params: [{ type: "Float",   name: "value" }], call: async ({ value }) => ({ type: "String", value: value.toString() }) },
        { type: "BUILTIN_FUNCTION", name: "string", params: [{ type: "Boolean", name: "value" }], call: async ({ value }) => ({ type: "String", value: value.toString() }) },
      ],

      boolean: [
        { type: "BUILTIN_FUNCTION", name: "boolean", params: [{ type: "Int",    name: "value" }], call: async ({ value }) => ({ type: "Boolean", value: Boolean(value) }) },
        { type: "BUILTIN_FUNCTION", name: "boolean", params: [{ type: "Float",  name: "value" }], call: async ({ value }) => ({ type: "Boolean", value: Boolean(value) }) },
        { type: "BUILTIN_FUNCTION", name: "boolean", params: [{ type: "String", name: "value" }], call: async ({ value }) => ({ type: "Boolean", value: value === "true" || value === true }) },
      ],
    },
    parent,
  };

  if (copy) {
    for (const key in copy.variables || {}) {
      if (!(key in defaultEnv.variables))
        defaultEnv.variables[key] = structuredClone(copy.variables[key]);
    }
    for (const key in copy.classes || {}) {
      if (!(key in defaultEnv.classes))
        defaultEnv.classes[key] = structuredClone(copy.classes[key]);
    }
    for (const key in copy.functions || {}) {
      if (!(key in defaultEnv.functions)) {
        defaultEnv.functions[key] = structuredClone(copy.functions[key]);
      } else {
        const existing = defaultEnv.functions[key];
        for (const fn of copy.functions[key]) {
          if (!existing.some((e) => fnSignaturesEqual(e.params, fn.params)))
            existing.push(structuredClone(fn));
        }
      }
    }
  }

  return defaultEnv;
}

// ─── Operator table ────────────────────────────────────────────────────────

const validOperators = {
  "+":  { types: [["String", "Int", "Float"]], operation: (l, r) => l + r,
          getType: (lt, rt) => lt === "String" || rt === "String" ? "String" : lt === "Int" && rt === "Int" ? "Int" : "Float" },
  "-":  { types: [["Int", "Float"]], operation: (l, r) => l - r,
          getType: (lt, rt) => lt === "Int" && rt === "Int" ? "Int" : "Float" },
  "*":  { types: [["Int", "Float"]], operation: (l, r) => l * r,
          getType: (lt, rt) => lt === "Int" && rt === "Int" ? "Int" : "Float" },
  "/":  { types: [["Int", "Float"]], operation: (l, r, lt, rt) => lt === "Int" && rt === "Int" ? Math.floor(l / r) : l / r,
          getType: (lt, rt) => lt === "Int" && rt === "Int" ? "Int" : "Float" },
  "%":  { types: [["Int", "Float"]], operation: (l, r) => l % r,
          getType: (lt, rt) => lt === "Int" && rt === "Int" ? "Int" : "Float" },
  "<":  { types: [["Int", "Float"]], operation: (l, r) => l < r,  getType: () => "Boolean" },
  ">":  { types: [["Int", "Float"]], operation: (l, r) => l > r,  getType: () => "Boolean" },
  "<=": { types: [["Int", "Float"]], operation: (l, r) => l <= r, getType: () => "Boolean" },
  ">=": { types: [["Int", "Float"]], operation: (l, r) => l >= r, getType: () => "Boolean" },
  "==": { types: [["Int", "Float"], ["Boolean"], ["String"]], operation: (l, r) => l === r, getType: () => "Boolean" },
  "!=": { types: [["Int", "Float"], ["Boolean"], ["String"]], operation: (l, r) => l !== r, getType: () => "Boolean" },
  "||": { types: [["Boolean"]], operation: (l, r) => l || r,
          stopsEvaluation: (l) => l === true,  stopEvaluationReturnValue: { type: "Boolean", value: true },  getType: () => "Boolean" },
  "&&": { types: [["Boolean"]], operation: (l, r) => l && r,
          stopsEvaluation: (l) => l === false, stopEvaluationReturnValue: { type: "Boolean", value: false }, getType: () => "Boolean" },
};

// ─── Environment helpers ───────────────────────────────────────────────────

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

function fnSignaturesEqual(aParams, bParams) {
  if (aParams.length !== bParams.length) return false;
  for (let i = 0; i < aParams.length; i++) {
    const a = aParams[i];
    const b = bParams[i];
    if (a.type !== b.type) return false;
    if (a.dims !== b.dims) return false;
    if (a.type === "Array")  {
      const sameSignature = arrayParamsEqual(a, b);
      if (!sameSignature) return false;
    }
  };
  return true;
}

function paramsMatch(fParams, argTypes, argValues) {
  if (!fParams) return true;
  if (fParams.length !== argTypes.length) return false;
  return fParams.every((p, i) => {
    if (p.dims != null && p.dims > 0) return arrayParamMatches(p, argValues[i]);
    return p.type === argTypes[i];
  });
}

function lookupFunction(env, name, argTypes = [], argValues = []) {
  if (name in env.functions) {
    const fn = env.functions[name].find((f) => paramsMatch(f.params, argTypes, argValues));
    if (fn) return fn;
    throwCustomError(`No overload for function '${name}' matches argument types (${argTypes.join(", ")}),`);
  }
  if (env.parent) return lookupFunction(env.parent, name, argTypes, argValues);
  throwCustomError(`Function '${name}' is not yet defined`);
}

function lookupClass(env, name, showError = false) {
  if (env.classes && name in env.classes) return env.classes[name];
  if (env.parent) return lookupClass(env.parent, name);
  if (showError) throwCustomError(`Class '${name}' is not defined`);
  else throw new Error(`Class '${name}' is not defined`);
}

const defaultValues = {
  Int:     { type: "Int",     value: 0 },
  Float:   { type: "Float",   value: 0.0 },
  Boolean: { type: "Boolean", value: false },
  String:  { type: "String",  value: "" },
};

function makeArray(size, remainingDims, baseName) {
  const arr = new Array(size);
  if (size <= 0) throwCustomError(`Cannot create array of size ${size}`);

  if (remainingDims.length > 0) {
    const nextSize = remainingDims[0];
    for (let i = 0; i < size; i++)
      arr[i] = { type: "Array", value: makeArray(nextSize, remainingDims.slice(1), baseName) };
  } else {
    const def = defaultValues[baseName];
    for (let i = 0; i < size; i++)
      arr[i] = def ? { type: def.type, value: def.value } : null;
  }
  return arr;
}

/** Assert that a runtime array value matches the expected baseName and dims. */
function assertArrayType(arrVal, expectedBaseName, expectedDims, node, fullCode) {
  const actualBase = getArrayBaseName(arrVal);
  const actualDims = getArrayDims(arrVal);
  if (actualBase !== expectedBaseName)
    throwCustomError(`Cannot assign a '${actualBase}' array to a '${expectedBaseName}' array`, node, fullCode);
  if (actualDims !== expectedDims)
    throwCustomError(`Cannot assign a ${actualDims}-dimensional array to a ${expectedDims}-dimensional '${expectedBaseName}' array`, node, fullCode);
}

// ─── Dispatcher ────────────────────────────────────────────────────────────

async function run(node, env, fullCode, thisEnv = null) {
  if (node == null) throwCustomError("Node is undefined", node, fullCode);

  console.log(node.type);

  if (node.type === "CommentLine" || node.type === "CommentBlock" || node.type === "EmptyStatement") return;
  if (node.type === "Program")             return await runProgram(node, env, fullCode);
  if (node.type === "Assignment")          return await runAssignment(node, env, fullCode, thisEnv);
  if (node.type === "Declaration")         return await runVariableDeclaration(node, env, fullCode, thisEnv);
  if (node.type === "ArrayDeclaration")    return await runArrayDeclaration(node, env, fullCode, thisEnv);
  if (node.type === "ObjectDeclaration")   return await runObjectDeclaration(node, env, fullCode, thisEnv);
  if (node.type === "NewExpression")       return await runNewExpression(node, env, fullCode, thisEnv);
  if (node.type === "NewArrayExpression")  return await runNewArrayExpression(node, env, fullCode, thisEnv);
  if (node.type === "IndexExpression")     return await runIndexExpression(node, env, fullCode, thisEnv);
  if (node.type === "IndexAssignment")     return await runIndexAssignment(node, env, fullCode, thisEnv);
  if (node.type === "BinaryExpr")          return await runBinaryExpr(node, env, fullCode, thisEnv);
  if (node.type === "Identifier")          return await runIdentifier(node, env, fullCode);
  if (node.type === "MemberExpression")    return await runMemberExpression(node, env, fullCode, thisEnv);
  if (node.type === "MemberAssignment")    return await runMemberAssignment(node, env, fullCode, thisEnv);
  if (node.type === "MethodCall")          return await runMethodCall(node, env, fullCode, thisEnv);
  if (node.type === "IfStatement")         return await runIfStatement(node, env, fullCode, thisEnv);
  if (node.type === "WhileStatement")      return await runWhileStatement(node, env, fullCode, thisEnv);
  if (node.type === "ForStatement")        return await runForStatement(node, env, fullCode, thisEnv);
  if (node.type === "FunctionDeclaration") return await runFunctionDeclaration(node, env, fullCode);
  if (node.type === "MethodDeclaration")   return await runMethodDeclaration(node, env, fullCode);
  if (node.type === "FunctionCall")        return await runFunctionCall(node, env, fullCode, thisEnv);
  if (node.type === "ReturnStatement")     return await runReturnStatement(node, env, fullCode, thisEnv);
  if (node.type === "ClassDeclaration")    return await runClassDeclaration(node, env, fullCode);
  if (node.type === "ConstructorDeclaration") return await runConstructorDeclaration(node, env, fullCode);

  if (node.constructor === Array) {
    for (const child of node) {
      const result = await run(child, env, fullCode, thisEnv);
      if (result && result.type === "Return") return result;
    }
    return;
  }

  if (["String", "Boolean", "Float", "Int"].includes(node.type))
    return await runLiteral(node, fullCode);

  throwCustomError(`Unknown node type: ${node.type}`, node, fullCode);
}

// ─── Runners ───────────────────────────────────────────────────────────────

async function runLiteral(node) {
  return { type: node.type, value: node.value };
}

async function runIdentifier(node, env) {
  return lookupVariable(env, node.name);
}

async function runNewArrayExpression(node, env, fullCode, thisEnv) {
  const dimValues = [];
  for (const dimExpr of node.dimensions) {
    const val = await run(dimExpr, env, fullCode, thisEnv);
    if (val.type !== "Int")
      throwCustomError(`Array size must be Int, got '${val.type}'`, node, fullCode);
    dimValues.push(val.value);
  }
  const arr = makeArray(dimValues[0], dimValues.slice(1), node.baseName);
  return { type: "Array", value: arr };
}

async function runArrayDeclaration(node, env, fullCode, thisEnv) {
  if (node.value.type === "NewArrayExpression" && node.value.dimensions.length !== node.dims)
    throwCustomError(
      `Cannot assign a ${node.value.dimensions.length}-dimensional array to a ${node.dims}-dimensional '${node.baseName}' array`,
      node, fullCode,
    );

  const arrVal = await run(node.value, env, fullCode, thisEnv);
  if (arrVal.type !== "Array")
    throwCustomError(`Expected an array for '${node.name}', got '${arrVal.type}'`, node, fullCode);

  assertArrayType(arrVal, node.baseName, node.dims, node, fullCode);

  if (env.variables[node.name] != null)
    throwCustomError(`Variable '${node.name}' already exists`, node, fullCode);

  env.variables[node.name] = { type: "Array", baseName: node.baseName, dims: node.dims, value: arrVal.value };
}

async function runIndexExpression(node, env, fullCode, thisEnv) {
  const obj = await run(node.object, env, fullCode, thisEnv);
  const idx = await run(node.index, env, fullCode, thisEnv);
  if (idx.type !== "Int")
    throwCustomError(`Index must be Int, got '${idx.type}'`, node, fullCode);

  if (obj.type === "String") {
    if (idx.value < 0 || idx.value >= obj.value.length)
      throwCustomError(`Index ${idx.value} out of bounds for string of length ${obj.value.length}`, node, fullCode);
    return { type: "String", value: obj.value[idx.value] };
  }

  if (obj.type !== "Array")
    throwCustomError(`Cannot index into non-array type '${obj.type}'`, node, fullCode);
  if (idx.value < 0 || idx.value >= obj.value.length)
    throwCustomError(`Index ${idx.value} out of bounds for array of length ${obj.value.length}`, node, fullCode);

  const cell = obj.value[idx.value];
  return cell ?? { type: "null", value: null };
}

async function runIndexAssignment(node, env, fullCode, thisEnv) {
  const value = await run(node.value, env, fullCode, thisEnv);

  // Walk the chain of IndexExpressions to find the root variable and depth
  function chainInfo(indexNode) {
    let depth = 0, current = indexNode;
    while (current.type === "IndexExpression") { depth++; current = current.object; }
    return { depth, rootNode: current };
  }

  const { depth, rootNode } = chainInfo(node.object.object);
  const rootVar = await run(rootNode, env, fullCode, thisEnv);

  // Type-check assignment when the root is a declared typed array
  if (rootVar.baseName != null) {
    const assignDepth = depth + 1;
    if (assignDepth === rootVar.dims) {
      const valueTypeName = value.type === "Instance" ? value.className : value.type;
      if (valueTypeName !== rootVar.baseName)
        throwCustomError(`Cannot assign type '${valueTypeName}' to array of base type '${rootVar.baseName}'`, node, fullCode);
    } else if (assignDepth < rootVar.dims) {
      if (value.type !== "Array")
        throwCustomError(`Cannot assign non-array type '${value.type}' at dimension ${assignDepth} of a ${rootVar.dims}-dimensional array`, node, fullCode);
    } else {
      throwCustomError(`Too many index dimensions for a ${rootVar.dims}-dimensional array`, node, fullCode);
    }
  }

  // Resolve to the direct parent container
  async function resolveToParent(indexNode) {
    if (indexNode.type === "IndexExpression") {
      const parent = await resolveToParent(indexNode.object);
      if (parent.type !== "Array")
        throwCustomError(`Cannot index into non-array type '${parent.type}'`, node, fullCode);
      const idx = await run(indexNode.index, env, fullCode, thisEnv);
      if (idx.type !== "Int")
        throwCustomError(`Array index must be Int, got '${idx.type}'`, node, fullCode);
      const cell = parent.value[idx.value];
      if (cell == null) throwCustomError(`Null reference at index ${idx.value}`, node, fullCode);
      return cell;
    }
    return await run(indexNode, env, fullCode, thisEnv);
  }

  const parentContainer = await resolveToParent(node.object.object);
  const idx = await run(node.object.index, env, fullCode, thisEnv);
  if (idx.type !== "Int")
    throwCustomError(`Index must be Int, got '${idx.type}'`, node, fullCode);

  if (parentContainer.type === "String") {
    if (idx.value < 0 || idx.value >= parentContainer.value.length)
      throwCustomError(`Index ${idx.value} out of bounds for string of length ${parentContainer.value.length}`, node, fullCode);
    if (value.type !== "String" || value.value.length !== 1)
      throwCustomError(`Can only assign single-character strings to string indices`, node, fullCode);
    const chars = parentContainer.value.split("");
    chars[idx.value] = value.value;
    parentContainer.value = chars.join("");
    return;
  }

  if (parentContainer.type !== "Array")
    throwCustomError(`Cannot index into non-array type '${parentContainer.type}'`, node, fullCode);
  if (idx.value < 0 || idx.value >= parentContainer.value.length)
    throwCustomError(`Index ${idx.value} out of bounds for array of length ${parentContainer.value.length}`, node, fullCode);
  parentContainer.value[idx.value] = value;
}

async function runMemberExpression(node, env, fullCode, thisEnv) {
  if (node.object === "this") {
    if (!thisEnv) throwCustomError(`'this' used outside of a class`, node, fullCode);
    const val = thisEnv.variables[node.property];
    if (val == null) throwCustomError(`Property '${node.property}' does not exist on this`, node, fullCode);
    return val;
  }

  const obj = await run(node.object, env, fullCode, thisEnv);

  if ((obj.type === "String" || obj.type === "Array") && node.property === "length")
    return { type: "Int", value: obj.value.length };

  const instanceEnv = obj.type === "Instance" ? obj.value : obj.value?.variables ? obj.value : null;
  if (!instanceEnv)
    throwCustomError(`Cannot access property '${node.property}' on type '${obj.type}'`, node, fullCode);

  const val = instanceEnv.variables[node.property];
  if (val == null) throwCustomError(`Property '${node.property}' does not exist on instance`, node, fullCode);
  return val;
}

async function runMemberAssignment(node, env, fullCode, thisEnv) {
  const expression = await run(node.value, env, fullCode, thisEnv);

  if (node.object === "this") {
    if (!thisEnv) throwCustomError(`'this' used outside of a class method or constructor`, node, fullCode);
    const existing = thisEnv.variables[node.property];
    if (existing == null) throwCustomError(`Property '${node.property}' does not exist on this`, node, fullCode);
    if (existing.type !== expression.type)
      throwCustomError(`this.${node.property} is of type ${existing.type} not ${expression.type}`, node, fullCode);
    thisEnv.variables[node.property] = { type: expression.type, value: expression.value };
    return;
  }

  const obj = await run(node.object, env, fullCode, thisEnv);
  const instanceEnv = obj.type === "Instance" ? obj.value : obj.value?.variables ? obj.value : null;
  if (!instanceEnv)
    throwCustomError(`Cannot assign property '${node.property}' on non-instance type '${obj.type}'`, node, fullCode);

  const existing = instanceEnv.variables[node.property];
  if (existing != null && existing.type !== expression.type)
    throwCustomError(`${node.object}.${node.property} is of type ${existing.type} not ${expression.type}`, node, fullCode);
  instanceEnv.variables[node.property] = { type: expression.type, value: expression.value };
}

/** Shared logic for calling a user-defined or built-in function body. */
async function callFunction(fn, argValues, outerEnv, fullCode, thisEnv) {
  const localEnv = makeEnv(outerEnv);
  for (let i = 0; i < fn.params.length; i++)
    localEnv.variables[fn.params[i].name] = argValues[i];

  if (fn.type === "BUILTIN_FUNCTION") {
    const params = {};
    for (let i = 0; i < fn.params.length; i++)
      params[fn.params[i].name] = argValues[i].value;
    return await fn.call(params);
  }

  for (const stmt of fn.body) {
    const result = await run(stmt, localEnv, fullCode, thisEnv);
    if (result && result.type === "Return")
      return result.value ?? { type: "void", value: null };
  }
  return { type: "void", value: null };
}

async function runMethodCall(node, env, fullCode, thisEnv) {
  const argValues = [];
  for (const p of node.params ?? [])
    argValues.push(await run(p, env, fullCode, thisEnv));
  const argTypes = argValues.map((v) => v.type);

  if (node.object === "this") {
    if (!thisEnv) throwCustomError(`'this' used outside of a class method or constructor`, node, fullCode);
    const fn = lookupFunction(thisEnv, node.name, argTypes, argValues);
    return await callFunction(fn, argValues, thisEnv, fullCode, thisEnv);
  }

  const obj = await run(node.object, env, fullCode, thisEnv);
  const instanceEnv = obj.type === "Instance" ? obj.value : obj.value?.variables ? obj.value : null;
  if (!instanceEnv)
    throwCustomError(`Cannot call method '${node.name}' on non-instance type '${obj.type}'`, node, fullCode);

  const fn = lookupFunction(instanceEnv, node.name, argTypes, argValues);
  return await callFunction(fn, argValues, instanceEnv, fullCode, instanceEnv);
}

async function runBinaryExpr(node, env, fullCode, thisEnv = null) {
  const left = await run(node.left, env, fullCode, thisEnv);
  const op = validOperators[node.operator];
  if (!op) throwCustomError(`Unknown operator: ${node.operator}`, node, fullCode);

  if (op.stopsEvaluation?.(left.value)) return op.stopEvaluationReturnValue;

  const right = await run(node.right, env, fullCode, thisEnv);
  const lt = left.type, rt = right.type;

  const valid = op.types.some((types) => types.includes(lt) && types.includes(rt));
  if (!valid)
    throwCustomError(`No operator ${node.operator} defined for types ${lt} and ${rt}`, node, fullCode);

  return { type: op.getType(lt, rt), value: op.operation(left.value, right.value, lt, rt) };
}

async function runAssignment(node, env, fullCode, thisEnv = null) {
  const expression = await run(node.value, env, fullCode, thisEnv);
  const existing = lookupVariable(env, node.name);
  if (existing.type !== expression.type)
    throwCustomError(`${node.name} is of type ${existing.type} not ${expression.type}`, node, fullCode);
  setVariable(env, node.name, { type: existing.type, value: expression.value });
}

async function runVariableDeclaration(node, env, fullCode, thisEnv = null) {
  if (env.variables[node.name] != null)
    throwCustomError(`Variable ${node.name} already exists`, node, fullCode);
  env.variables[node.name] = { type: null, value: null };
  const expression = await run(node.value, env, fullCode, thisEnv);
  if (expression.type !== node.varType)
    throwCustomError(`${node.name} is of type ${node.varType} not ${expression.type}`, node, fullCode);
  env.variables[node.name] = { type: node.varType, value: expression.value };
}

async function runObjectDeclaration(node, env, fullCode, thisEnv = null) {
  const instance = await run(node.value, env, fullCode, thisEnv);
  if (instance.type !== "Instance")
    throwCustomError(`Expected an instance of class '${node.className}', got '${instance.type}'`, node, fullCode);
  if (env.variables[node.name] != null)
    throwCustomError(`Variable '${node.name}' already exists`, node, fullCode);
  env.variables[node.name] = { type: node.className, value: instance.value };
}

async function runNewExpression(node, env, fullCode, thisEnv = null) {
  const classDef = lookupClass(env, node.className);
  const argValues = [];
  for (const arg of node.params)
    argValues.push(await run(arg, env, fullCode, thisEnv));
  const argTypes = argValues.map((v) => v.type);

  const constructor = lookupFunction(classDef, node.className, argTypes, argValues);
  const instanceEnv = makeEnv(env, classDef);
  for (let i = 0; i < constructor.params.length; i++)
    instanceEnv.variables[constructor.params[i].name] = argValues[i];

  for (const stmt of constructor.body) {
    const result = await run(stmt, instanceEnv, fullCode, instanceEnv);
    if (result && result.type === "Return") break;
  }
  return { type: "Instance", className: node.className, value: instanceEnv };
}

async function runIfStatement(node, env, fullCode, thisEnv = null) {
  const cond = await run(node.condition, env, fullCode, thisEnv);
  if (cond.type !== "Boolean")
    throwCustomError(`If statement requires type Boolean, type ${cond.type} was provided instead`, node, fullCode);
  const localEnv = makeEnv(env);
  if (cond.value === true) return await run(node.thenCase, localEnv, fullCode, thisEnv);
  if (node.elseCase)       return await run(node.elseCase, localEnv, fullCode, thisEnv);
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

async function registerFunction(env, node, fullCode, type="Function") {
  if (!env.functions[node.name]) env.functions[node.name] = [];
  if (env.functions[node.name].some((f) => fnSignaturesEqual(f.params, node.params)))
    throwCustomError(type + " already defined with the same signature", node, fullCode);
  env.functions[node.name].push(node);
}

async function runFunctionDeclaration(node, env, fullCode) {
  await registerFunction(env, node, fullCode);
}

async function runMethodDeclaration(node, env, fullCode) {
  await registerFunction(env, node, fullCode, "Method");
}

async function runConstructorDeclaration(node, env, fullCode) {
  await registerFunction(env, node, fullCode, "Constructor");
}

async function runFunctionCall(node, env, fullCode, thisEnv = null) {
  const argValues = [];
  for (const p of node.params)
    argValues.push(await run(p, env, fullCode, thisEnv));
  const argTypes = argValues.map((v) => v.type);
  const fn = lookupFunction(env, node.name, argTypes, argValues);
  return await callFunction(fn, argValues, env, fullCode, thisEnv);
}

async function runReturnStatement(node, env, fullCode, thisEnv = null) {
  if (node.value == null) return { type: "Return", value: null };
  return { type: "Return", value: await run(node.value, env, fullCode, thisEnv) };
}

async function runClassDeclaration(node, env, fullCode) {
  if (!env.classes) env.classes = {};

  let classExists = true;
  try { lookupClass(env, node.name, false); } catch { classExists = false; }
  if (classExists) throwCustomError(`Class '${node.name}' already exists`, node, fullCode);

  const classEnv = makeEnv(env);
  for (const stmt of node.body) {
    if (stmt.type === "ConstructorDeclaration") {
      if (node.name !== stmt.name) throwCustomError("Constructor name mismatch", node, fullCode);
      await runConstructorDeclaration(stmt, classEnv, fullCode);
    } else if (stmt.type === "MethodDeclaration") {
      if (node.name === stmt.name) throwCustomError("Method name cannot be same as class", node, fullCode);
      await runMethodDeclaration(stmt, classEnv, fullCode);
    } else {
      await run(stmt, classEnv, fullCode);
    }
  }
  env.classes[node.name] = classEnv;
  return { type: "Class", value: classEnv };
}

async function runProgram(node, env, fullCode) {
  let result;
  for (const stmt of node.body)
    result = await run(stmt, env, fullCode);
  return result;
}