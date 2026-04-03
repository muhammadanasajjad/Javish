function parse(tokens, fullCode, displayErrors = true) {
  const identifierRegex = /^[a-zA-Z]\w*$/;
  const typeKeywords = ["int", "string", "boolean", "float"];
  const typeNameMap = {
    int: "Int",
    string: "String",
    boolean: "Boolean",
    float: "Float",
  };
  const controlFlowStatements = ["if", "for", "while"];
  const expressionOperators = {
    "||": { leftBinding: 1, rightBinding: 1.1, inAssignment: true },
    "&&": { leftBinding: 2, rightBinding: 2.1, inAssignment: true },
    ">": { leftBinding: 3, rightBinding: 3.1 },
    "<": { leftBinding: 3, rightBinding: 3.1 },
    "<=": { leftBinding: 3, rightBinding: 3.1 },
    ">=": { leftBinding: 3, rightBinding: 3.1 },
    "==": { leftBinding: 3, rightBinding: 3.1 },
    "!=": { leftBinding: 3, rightBinding: 3.1 },
    "+": { leftBinding: 4, rightBinding: 4.1, inAssignment: true },
    "-": { leftBinding: 4, rightBinding: 4.1, inAssignment: true },
    "*": { leftBinding: 5, rightBinding: 5.1, inAssignment: true },
    "/": { leftBinding: 5, rightBinding: 5.1, inAssignment: true },
    "%": { leftBinding: 5, rightBinding: 5.1, inAssignment: true },
  };
  let pos = 0;
  function peek(offset = 0) {
    return tokens[pos + offset];
  }
  function consume(expected) {
    if (expected && tokens[pos].value !== expected)
      throwCustomError(
        `Expected '${expected}', got '${tokens[pos].value}'`,
        tokens[pos],
        fullCode,
        displayErrors,
      );
    return tokens[pos++];
  }

  function isArrayType(startPos) {
    let i = startPos;
    const tok = tokens[i];
    if (!tok) return false;
    const isBase =
      typeKeywords.includes(tok.value) || identifierRegex.test(tok.value);
    if (!isBase) return false;
    i++;
    if (!tokens[i] || tokens[i].value !== "[") return false;
    while (tokens[i] && tokens[i].value === "[") {
      if (!tokens[i + 1] || tokens[i + 1].value !== "]") return false;
      i += 2;
    }
    return i > startPos + 1;
  }

  function parseArrayType() {
    const { value: baseTypeName, lineNumber } = consume();
    const baseName = typeNameMap[baseTypeName] ?? baseTypeName;
    let dims = 0;
    while (peek() && peek().value === "[" && peek(1) && peek(1).value === "]") {
      consume("[");
      consume("]");
      dims++;
    }
    return { baseName, dims, lineNumber };
  }

  function parseCallArgs() {
    consume("(");
    const params = [];
    while (peek().value !== ")") {
      params.push(prattParseExpression());
      if (peek().value !== ",") break;
      consume(",");
    }
    consume(")");
    return params;
  }

  function parseFactor() {
    const {
      value: token,
      type: tokenType,
      lineNumber: tokenLineNumber,
    } = peek();

    if (token === "new") {
      consume("new");
      const nextTok = peek();
      const isArrayBase =
        typeKeywords.includes(nextTok.value) ||
        identifierRegex.test(nextTok.value);
      if (
        isArrayBase &&
        peek(1) &&
        peek(1).value === "[" &&
        peek(2) &&
        peek(2).value !== "]"
      ) {
        const { value: baseTypeName } = consume();
        const baseName = typeNameMap[baseTypeName] ?? baseTypeName;
        const dimensions = [];
        while (peek() && peek().value === "[") {
          const p = peek(1);
          if (p && p.value === "]") break;
          consume("[");
          const sizeExpr = prattParseExpression();
          consume("]");
          dimensions.push(sizeExpr);
        }
        return {
          type: "NewArrayExpression",
          baseName,
          dimensions,
          lineNumber: tokenLineNumber,
        };
      }
      const className = consume().value;
      if (!identifierRegex.test(className))
        throwCustomError(
          `Expected class name after 'new', got '${className}'`,
          tokens[pos],
          fullCode,
          displayErrors,
        );
      const params = parseCallArgs();
      return {
        type: "NewExpression",
        className,
        params,
        lineNumber: tokenLineNumber,
      };
    }

    if (token === "this") {
      consume("this");
      consume(".");
      const prop = consume().value;
      if (!identifierRegex.test(prop))
        throwCustomError(
          `Expected property name after 'this.', got '${prop}'`,
          tokens[pos],
          fullCode,
          displayErrors,
        );
      if (peek() && peek().value === "(") {
        const params = parseCallArgs();
        return {
          type: "MethodCall",
          object: "this",
          name: prop,
          params,
          lineNumber: tokenLineNumber,
        };
      }
      let node = {
        type: "MemberExpression",
        object: "this",
        property: prop,
        lineNumber: tokenLineNumber,
      };
      node = parseIndexSuffix(node, tokenLineNumber);
      return node;
    }

    if (/^".*"$/.test(token)) {
      consume();
      return {
        type: "String",
        value: token.slice(1, -1),
        lineNumber: tokenLineNumber,
        tokenType,
      };
    }
    if (token === "true" || token === "false") {
      consume();
      return {
        type: "Boolean",
        value: token === "true",
        lineNumber: tokenLineNumber,
        tokenType,
      };
    }
    if (/^\d+$/.test(token)) {
      consume();
      return {
        type: "Int",
        value: Number(token),
        lineNumber: tokenLineNumber,
        tokenType,
      };
    }
    if (/^\d+\.\d+$/.test(token)) {
      consume();
      return {
        type: "Float",
        value: Number(token),
        lineNumber: tokenLineNumber,
        tokenType,
      };
    }
    if (/^\d+f$/.test(token)) {
      consume();
      return {
        type: "Float",
        value: Number(token.slice(0, -1)),
        lineNumber: tokenLineNumber,
        tokenType,
      };
    }
    if (/^[a-zA-Z]\w*$/.test(token)) {
      const name = consume().value;
      let node;
      if (peek() && peek().value === "(") {
        const params = parseCallArgs();
        node = {
          type: "FunctionCall",
          name,
          params,
          lineNumber: tokenLineNumber,
        };
      } else {
        node = {
          type: "Identifier",
          name,
          lineNumber: tokenLineNumber,
          tokenType,
        };
      }
      node = parseIndexSuffix(node, tokenLineNumber);
      while (peek() && peek().value === ".") {
        consume(".");
        const member = consume().value;
        if (!identifierRegex.test(member))
          throwCustomError(
            `Expected property name after '.', got '${member}'`,
            tokens[pos],
            fullCode,
            displayErrors,
          );
        if (peek() && peek().value === "(") {
          const params = parseCallArgs();
          node = {
            type: "MethodCall",
            object: node,
            name: member,
            params,
            lineNumber: tokenLineNumber,
          };
        } else {
          node = {
            type: "MemberExpression",
            object: node,
            property: member,
            lineNumber: tokenLineNumber,
          };
        }
        node = parseIndexSuffix(node, tokenLineNumber);
      }
      return node;
    }
    if (token === "(") {
      consume("(");
      const expr = prattParseExpression();
      consume(")");
      return expr;
    }
    throwCustomError(
      `Unexpected token '${token}'`,
      tokens[pos],
      fullCode,
      displayErrors,
    );
  }

  function parseIndexSuffix(node, lineNumber) {
    while (peek() && peek().value === "[") {
      const p1 = peek(1);
      if (p1 && p1.value === "]") break;
      consume("[");
      const index = prattParseExpression();
      consume("]");
      node = {
        type: "IndexExpression",
        object: node,
        index,
        lineNumber,
      };
    }
    return node;
  }

  function prattParseExpression(minBinding = 0) {
    let left = parseFactor();
    while (true) {
      const { value: op, type: opType } = peek();
      const info = expressionOperators[op];
      if (!info || info.leftBinding <= minBinding) break;
      consume();
      const right = prattParseExpression(info.rightBinding);
      left = {
        type: "BinaryExpr",
        operator: op,
        lineNumber: left.lineNumber,
        tokenType: opType,
        left,
        right,
      };
    }
    return left;
  }

  function tryParseIndexAssignment(startPos) {
    let i = startPos;
    let objTok = tokens[i];
    if (!objTok || !identifierRegex.test(objTok.value)) return null;
    i++;
    if (!tokens[i] || tokens[i].value !== "[") return null;
    const savedPos = pos;
    pos = startPos;
    let node = {
      type: "Identifier",
      name: consume().value,
      lineNumber: tokens[startPos].lineNumber,
    };
    while (peek() && peek().value === "[") {
      const p1 = peek(1);
      if (!p1 || p1.value === "]") break;
      consume("[");
      const index = prattParseExpression();
      if (!peek() || peek().value !== "]") {
        pos = savedPos;
        return null;
      }
      consume("]");
      node = {
        type: "IndexExpression",
        object: node,
        index,
        lineNumber: node.lineNumber,
      };
    }
    if (!peek() || peek().value !== "=") {
      pos = savedPos;
      return null;
    }
    if (peek(1) && peek(1).value === "=") {
      pos = savedPos;
      return null;
    }
    consume("=");
    const value = prattParseExpression();
    return {
      type: "IndexAssignment",
      object: node,
      value,
      lineNumber: tokens[startPos].lineNumber,
    };
  }

  function parseAssignment() {
    const {
      value: startToken,
      type: startTokenType,
      lineNumber: startTokenLineNumber,
    } = peek();

    if (identifierRegex.test(startToken) && peek(1) && peek(1).value === "[") {
      const result = tryParseIndexAssignment(pos);
      if (result) return result;
    }

    if (
      startToken === "this" &&
      tokens[pos + 1].value === "." &&
      tokens[pos + 3].value === "="
    ) {
      consume("this");
      consume(".");
      const prop = consume().value;
      consume("=");
      const expression = prattParseExpression();
      return {
        type: "MemberAssignment",
        object: "this",
        property: prop,
        value: expression,
        lineNumber: startTokenLineNumber,
        tokenType: "=",
      };
    }
    if (
      startToken === "this" &&
      tokens[pos + 1].value === "." &&
      expressionOperators[tokens[pos + 3].value]?.inAssignment &&
      tokens[pos + 4].value === "="
    ) {
      consume("this");
      consume(".");
      const { value: prop, lineNumber: propLineNumber } = consume();
      const operator = consume().value;
      consume("=");
      const expression = prattParseExpression();
      const left = {
        type: "MemberExpression",
        object: "this",
        property: prop,
        lineNumber: propLineNumber,
      };
      const value = {
        type: "BinaryExpr",
        operator,
        left,
        right: expression,
        lineNumber: expression.lineNumber,
      };
      return {
        type: "MemberAssignment",
        object: "this",
        property: prop,
        value,
        lineNumber: propLineNumber,
        tokenType: operator + "=",
      };
    }
    if (
      startToken === "this" &&
      tokens[pos + 1] &&
      tokens[pos + 1].value === "." &&
      tokens[pos + 2] &&
      identifierRegex.test(tokens[pos + 2].value) &&
      tokens[pos + 3] &&
      tokens[pos + 3].value === "["
    ) {
      consume("this");
      consume(".");
      const { value: prop, lineNumber: propLineNumber } = consume();
      let node = {
        type: "MemberExpression",
        object: "this",
        property: prop,
        lineNumber: propLineNumber,
      };
      while (peek() && peek().value === "[") {
        const p1 = peek(1);
        if (!p1 || p1.value === "]") break;
        consume("[");
        const index = prattParseExpression();
        consume("]");
        node = {
          type: "IndexExpression",
          object: node,
          index,
          lineNumber: propLineNumber,
        };
      }
      consume("=");
      const expression = prattParseExpression();
      return {
        type: "IndexAssignment",
        object: node,
        value: expression,
        lineNumber: propLineNumber,
      };
    }
    if (identifierRegex.test(startToken) && tokens[pos + 1].value === "=") {
      if (!tokens[pos + 2] || tokens[pos + 2].value !== "=") {
        const name = consume().value;
        consume("=");
        const expression = prattParseExpression();
        return {
          type: "Assignment",
          name,
          value: expression,
          lineNumber: startTokenLineNumber,
          tokenType: "=",
        };
      }
    }
    if (
      identifierRegex.test(startToken) &&
      expressionOperators[tokens[pos + 1].value]?.inAssignment &&
      tokens[pos + 2].value === "="
    ) {
      const { value: name, lineNumber: nameLineNumber } = consume();
      const operator = consume().value;
      consume("=");
      const expression = prattParseExpression();
      const left = { type: "Identifier", name, lineNumber: nameLineNumber };
      const right = expression;
      const value = {
        type: "BinaryExpr",
        operator,
        left,
        right,
        lineNumber: right.lineNumber,
      };
      return {
        type: "Assignment",
        name,
        value,
        lineNumber: nameLineNumber,
        tokenType: operator + "=",
      };
    }
    return prattParseExpression();
  }

  function parseDeclaration() {
    const { value: typeName, lineNumber } = consume();
    if (!typeKeywords.includes(typeName)) {
      throwCustomError(
        `Unknown type '${typeName}'`,
        tokens[pos],
        fullCode,
        displayErrors,
      );
    }
    const name = consume().value;
    if (!identifierRegex.test(name))
      throwCustomError(
        `Invalid identifier '${name}'`,
        tokens[pos],
        fullCode,
        displayErrors,
      );
    consume("=");
    const value = prattParseExpression();
    return {
      type: "Declaration",
      varType: typeNameMap[typeName],
      name,
      value,
      lineNumber,
    };
  }

  function parseArrayDeclaration(lineNumber) {
    const { value: baseTypeName } = consume();
    const baseName = typeNameMap[baseTypeName] ?? baseTypeName;
    let dims = 0;
    while (peek() && peek().value === "[" && peek(1) && peek(1).value === "]") {
      consume("[");
      consume("]");
      dims++;
    }
    const name = consume().value;
    if (!identifierRegex.test(name))
      throwCustomError(
        `Invalid identifier '${name}'`,
        tokens[pos],
        fullCode,
        displayErrors,
      );
    consume("=");
    const value = prattParseExpression();
    return {
      type: "ArrayDeclaration",
      baseName,
      dims,
      name,
      value,
      lineNumber,
    };
  }

  function parseObjectDeclaration() {
    const { value: className, lineNumber } = consume();
    const name = consume().value;
    if (!identifierRegex.test(name))
      throwCustomError(
        `Invalid identifier '${name}'`,
        tokens[pos],
        fullCode,
        displayErrors,
      );
    consume("=");
    const value = prattParseExpression();
    return {
      type: "ObjectDeclaration",
      className,
      name,
      value,
      lineNumber,
    };
  }

  function parseIfStatement() {
    consume("if");
    consume("(");
    const condition = prattParseExpression();
    consume(")");
    const body = [];
    if (peek().value !== "{") {
      body.push(parseStatement());
    } else {
      consume("{");
      while (peek().value !== "}") {
        body.push(parseStatement());
      }
      consume("}");
    }
    let elseCase = null;
    if (peek().value === "else") {
      elseCase = [];
      consume("else");
      if (peek().value === "{") consume("{");
      while (peek().value !== "}") {
        elseCase.push(parseStatement());
      }
      consume("}");
    }
    return {
      type: "IfStatement",
      condition,
      lineNumber: condition.lineNumber,
      thenCase: body,
      elseCase,
    };
  }

  function parseForLoop() {
    consume("for");
    consume("(");
    const init = parseDeclaration();
    consume(";");
    const condition = prattParseExpression();
    consume(";");
    const update = parseAssignment();
    consume(")");
    const body = [];
    if (peek().value === "{") {
      consume("{");
      while (peek().value !== "}") {
        body.push(parseStatement());
      }
      consume("}");
    } else {
      body.push(parseStatement());
    }
    return {
      type: "ForStatement",
      init,
      condition,
      lineNumber: condition.lineNumber,
      update,
      body,
    };
  }

  function parseWhileLoop() {
    consume("while");
    consume("(");
    const condition = prattParseExpression();
    consume(")");
    const body = [];
    if (peek().value !== "{") {
      body.push(parseStatement());
    } else {
      consume("{");
      while (peek().value !== "}") {
        body.push(parseStatement());
      }
      consume("}");
    }
    return {
      type: "WhileStatement",
      lineNumber: condition.lineNumber,
      condition,
      body,
    };
  }

  function parseControlFlowStatements() {
    const parserMap = {
      if: parseIfStatement,
      for: parseForLoop,
      while: parseWhileLoop,
    };
    const { value: token } = peek();
    return parserMap[token]();
  }

  function parseFunctionDeclaration() {
    const { value: returnType } = peek();
    consume(returnType);
    let returnDims = 0;
    while (peek() && peek().value === "[" && peek(1) && peek(1).value === "]") {
      consume("[");
      consume("]");
      returnDims++;
    }
    const name = consume().value;
    consume("(");
    const params = [];
    while (peek().value !== ")") {
      const { value: paramType, lineNumber } = consume();
      let paramDims = 0;
      while (
        peek() &&
        peek().value === "[" &&
        peek(1) &&
        peek(1).value === "]"
      ) {
        consume("[");
        consume("]");
        paramDims++;
      }
      const { value: paramName } = consume();
      params.push({
        type: typeNameMap[paramType] ?? paramType,
        dims: paramDims,
        name: paramName,
        lineNumber,
      });
      if (peek().value !== ",") break;
      consume(",");
    }
    consume(")");
    const body = [];
    if (peek().value !== "{") {
      body.push(parseStatement());
    } else {
      consume("{");
      while (peek().value !== "}") {
        body.push(parseStatement());
      }
      consume("}");
    }
    return {
      type: "FunctionDeclaration",
      name,
      params,
      body,
      returnType: typeNameMap[returnType] ?? returnType,
    };
  }

  function parseMethodDeclaration() {
    const { value: returnType } = peek();
    consume(returnType);
    let returnDims = 0;
    while (peek() && peek().value === "[" && peek(1) && peek(1).value === "]") {
      consume("[");
      consume("]");
      returnDims++;
    }
    const name = consume().value;
    consume("(");
    const params = [];
    while (peek().value !== ")") {
      const { value: paramType, lineNumber } = consume();
      let paramDims = 0;
      while (
        peek() &&
        peek().value === "[" &&
        peek(1) &&
        peek(1).value === "]"
      ) {
        consume("[");
        consume("]");
        paramDims++;
      }
      const { value: paramName } = consume();
      params.push({
        type: typeNameMap[paramType] ?? paramType,
        dims: paramDims,
        name: paramName,
        lineNumber,
      });
      if (peek().value !== ",") break;
      consume(",");
    }
    consume(")");
    const body = [];
    if (peek().value !== "{") {
      body.push(parseStatement());
    } else {
      consume("{");
      while (peek().value !== "}") {
        body.push(parseStatement());
      }
      consume("}");
    }
    return {
      type: "MethodDeclaration",
      name,
      params,
      body,
      returnType: typeNameMap[returnType] ?? returnType,
    };
  }

  function parseClassDeclaration() {
    consume("class");
    const name = consume().value;
    const body = [];
    consume("{");
    while (peek().value !== "}") {
      body.push(parseClassMember());
    }
    consume("}");
    return {
      type: "ClassDeclaration",
      name,
      body,
    };
  }

  function parseClassMember() {
    const { value: token } = peek();
    if (token === "//") {
      const thisLineNumber = peek().lineNumber;
      consume("//");
      while (peek().lineNumber === thisLineNumber) {
        console.log(consume());
      }
      return { type: "CommentLine" };
    } else if (token === "/*") {
      consume("/*");
      while (peek().value !== "*/") {
        console.log(consume());
      }
      consume("*/");
      return { type: "CommentBlock" };
    }
    if (token === "init") {
      return parseConstructorDeclaration();
    }

    const isKnownType = typeKeywords.includes(token) || token === "void";
    const isIdentifierToken = identifierRegex.test(token);

    if (isKnownType || isIdentifierToken) {
      let scanPos = pos + 1;
      let isArrayReturnType = false;
      while (
        tokens[scanPos] &&
        tokens[scanPos].value === "[" &&
        tokens[scanPos + 1] &&
        tokens[scanPos + 1].value === "]"
      ) {
        isArrayReturnType = true;
        scanPos += 2;
      }

      if (
        tokens[scanPos] &&
        identifierRegex.test(tokens[scanPos].value) &&
        tokens[scanPos + 1] &&
        tokens[scanPos + 1].value === "("
      ) {
        return parseMethodDeclaration();
      }

      if (
        isArrayReturnType &&
        tokens[scanPos] &&
        identifierRegex.test(tokens[scanPos].value)
      ) {
        const decl = parseArrayDeclaration(peek().lineNumber);
        consume(";");
        return decl;
      }

      if (
        isKnownType &&
        tokens[pos + 1] &&
        identifierRegex.test(tokens[pos + 1].value)
      ) {
        const decl = parseDeclaration();
        consume(";");
        return decl;
      }

      if (
        isIdentifierToken &&
        !isKnownType &&
        tokens[pos + 1] &&
        identifierRegex.test(tokens[pos + 1].value)
      ) {
        const decl = parseObjectDeclaration();
        consume(";");
        return decl;
      }
    }

    throwCustomError(
      `Unexpected token '${token}' inside class body`,
      tokens[pos],
      fullCode,
      displayErrors,
    );
  }

  function parseConstructorDeclaration() {
    consume("init");
    const constructorName = consume().value;
    consume("(");
    const params = [];
    while (peek().value !== ")") {
      const { value: paramType, lineNumber } = consume();
      let paramDims = 0;
      while (
        peek() &&
        peek().value === "[" &&
        peek(1) &&
        peek(1).value === "]"
      ) {
        consume("[");
        consume("]");
        paramDims++;
      }
      const { value: paramName } = consume();
      params.push({
        type: typeNameMap[paramType] ?? paramType,
        dims: paramDims,
        name: paramName,
        lineNumber,
      });
      if (peek().value !== ",") break;
      consume(",");
    }
    consume(")");
    const body = [];
    if (peek().value !== "{") {
      body.push(parseStatement());
    } else {
      consume("{");
      while (peek().value !== "}") {
        body.push(parseStatement());
      }
      consume("}");
    }
    return {
      type: "ConstructorDeclaration",
      name: constructorName,
      params,
      body,
    };
  }

  const reservedWords = new Set([
    "if",
    "for",
    "while",
    "return",
    "new",
    "this",
    "class",
    "init",
    "true",
    "false",
    "else",
    "void",
  ]);

  function isFunctionDeclarationAhead() {
    let i = pos + 1;
    while (
      tokens[i] &&
      tokens[i].value === "[" &&
      tokens[i + 1] &&
      tokens[i + 1].value === "]"
    )
      i += 2;
    return (
      tokens[i] &&
      identifierRegex.test(tokens[i].value) &&
      tokens[i + 1] &&
      tokens[i + 1].value === "("
    );
  }

  function parseStatement() {
    const { value: token, lineNumber: tokenLineNumber } = peek();
    let stmt;

    if (token === "") {
      consume();
      return { type: "EmptyStatement" };
    } else if (token === "//") {
      const thisLineNumber = peek().lineNumber;
      consume("//");
      while (peek().lineNumber === thisLineNumber) {
        console.log(consume());
      }
      stmt = { type: "CommentLine" };
    } else if (token === "/*") {
      consume("/*");
      while (peek().value !== "*/") {
        console.log(consume());
      }
      consume("*/");
      stmt = { type: "CommentBlock" };
    } else if (token === "class") {
      stmt = parseClassDeclaration();
    } else if (token === "init") {
      stmt = parseConstructorDeclaration();
    } else if (token === "return") {
      consume("return");
      const value = prattParseExpression();
      consume(";");
      stmt = { type: "ReturnStatement", value, lineNumber: value.lineNumber };
    } else if (controlFlowStatements.includes(token)) {
      stmt = parseControlFlowStatements();
    } else if (
      (token === "void" ||
        (identifierRegex.test(token) && !reservedWords.has(token))) &&
      isFunctionDeclarationAhead()
    ) {
      stmt = parseFunctionDeclaration();
    } else if (
      (typeKeywords.includes(token) ||
        (identifierRegex.test(token) && !reservedWords.has(token))) &&
      peek(1) &&
      peek(1).value === "[" &&
      peek(2) &&
      peek(2).value === "]"
    ) {
      stmt = parseArrayDeclaration(tokenLineNumber);
      consume(";");
    } else if (typeKeywords.includes(token)) {
      stmt = parseDeclaration();
      consume(";");
    } else if (
      identifierRegex.test(token) &&
      !reservedWords.has(token) &&
      tokens[pos + 1] &&
      identifierRegex.test(tokens[pos + 1].value) &&
      tokens[pos + 2] &&
      tokens[pos + 2].value === "="
    ) {
      stmt = parseObjectDeclaration();
      consume(";");
    } else {
      stmt = parseAssignment();
      consume(";");
    }
    return stmt;
  }

  function parseProgram() {
    const body = [];
    while (pos < tokens.length) {
      const stmt = parseStatement();
      body.push(stmt);
    }
    return { type: "Program", body };
  }
  return parseProgram();
}
