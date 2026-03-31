function parse(tokens, fullCode) {
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

  function peek() {
    return tokens[pos];
  }

  function consume(expected) {
    if (expected && tokens[pos].value !== expected)
      throwCustomError(
        `Expected '${expected}', got '${tokens[pos].value}'`,
        tokens[pos],
        fullCode
      );
    return tokens[pos++];
  }

  function parseFactor() {
    const {
      value: token,
      type: tokenType,
      lineNumber: tokenLineNumber,
    } = peek();

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

      if (peek() && peek().value === "(") {
        consume("(");
        const params = [];
        while (peek().value !== ")") {
          params.push(prattParseExpression());
          if (peek().value !== ",") break;
          consume(",");
        }
        consume(")");
        return {
          type: "FunctionCall",
          name,
          params,
          lineNumber: tokenLineNumber,
        };
      }

      return {
        type: "Identifier",
        name,
        lineNumber: tokenLineNumber,
        tokenType,
      };
    }

    if (token === "(") {
      consume("(");
      const expr = prattParseExpression();
      consume(")");
      return expr;
    }

    throwCustomError(`Unexpected token '${token}'`, tokens[pos], fullCode);
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

  function parseAssignment() {
    const {
      value: startToken,
      type: startTokenType,
      lineNumber: startTokenLineNumber,
    } = peek();

    if (identifierRegex.test(startToken) && tokens[pos + 1].value === "=") {
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
      throwCustomError(`Unknown type '${typeName}'`, tokens[pos], fullCode);
    }

    const name = consume().value;
    if (!identifierRegex.test(name))
      throwCustomError(`Invalid identifier '${name}'`, tokens[pos], fullCode);

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
    const name = consume().value;

    consume("(");
    const params = [];
    while (peek().value !== ")") {
      const { value: paramType, lineNumber } = consume();
      const { value: paramName } = consume();
      params.push({
        type: typeNameMap[paramType],
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
      returnType: typeNameMap[returnType],
    };
  }

  function parseStatement() {
    const { value: token } = peek();

    let stmt;
    if (
      (typeKeywords.includes(token) &&
        tokens.length > pos + 2 &&
        tokens[pos + 2].value == "(") ||
      token == "void"
    ) {
      stmt = parseFunctionDeclaration();
    } else if (token == "return") {
      consume("return");
      const value = prattParseExpression();
      consume(";");
      stmt = {
        type: "ReturnStatement",
        value,
        lineNumber: value.lineNumber,
      };
    } else if (typeKeywords.includes(token)) {
      stmt = parseDeclaration();
      consume(";");
    } else if (controlFlowStatements.includes(token)) {
      stmt = parseControlFlowStatements();
    } else {
      stmt = parseAssignment();
      consume(";");
    }

    return stmt;
  }

  function parseProgram() {
    const body = [];
    while (pos < tokens.length) {
      body.push(parseStatement());
    }
    return { type: "Program", body };
  }

  return parseProgram();
}
