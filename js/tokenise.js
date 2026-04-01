const END = Symbol("END");

const rules = [
  { matcher: /^\n/, type: "line-break" },
  { matcher: /[ \t]+/, type: null },
  { matcher: /\/\//, type: "comment-line" },
  { matcher: /\/\*|\*\//, type: "comment-block" },

  { matcher: /{/, type: "brace-open" },
  { matcher: /}/, type: "brace-close" },
  { matcher: /\(/, type: "paren-open" },
  { matcher: /\)/, type: "paren-close" },
  { matcher: /\[/, type: "bracket-open" },
  { matcher: /\]/, type: "bracket-close" },
  { matcher: /;/, type: "semicolon" },
  { matcher: /,/, type: "comma" },
  { matcher: /\./, type: "dot" },

  { matcher: /==/, type: "operator-comparison" },
  { matcher: />=/, type: "operator-comparison" },
  { matcher: /<=/, type: "operator-comparison" },
  { matcher: /!=/, type: "operator-comparison" },

  { matcher: /!/, type: "operator-boolean" },
  { matcher: /=/, type: "operator-assignment" },
  { matcher: />/, type: "operator-comparison" },
  { matcher: /</, type: "operator-comparison" },
  { matcher: /\|\|/, type: "operator-logical" },
  { matcher: /&&/, type: "operator-logical" },

  { matcher: /\+/, type: "operator-arithmetic" },
  { matcher: /-/, type: "operator-arithmetic" },
  { matcher: /\*/, type: "operator-arithmetic" },
  { matcher: /\//, type: "operator-arithmetic" },
  { matcher: /%/, type: "operator-arithmetic" },

  { matcher: /"[^"\r\n]*"/, type: "string-literal" },
  { matcher: /'[^'\r\n]*'/, type: "string-literal" },
  { matcher: /\b[0-9]+\.[0-9]+f?\b/, type: "number-literal" },
  { matcher: /\b[0-9]+f?\b/, type: "number-literal" },
  { matcher: /\btrue\b|\bfalse\b/, type: "boolean-literal" },

  { matcher: /\bint\b/, type: "type-keyword" },
  { matcher: /\bfloat\b/, type: "type-keyword" },
  { matcher: /\bstring\b/, type: "type-keyword" },
  { matcher: /\bboolean\b/, type: "type-keyword" },
  { matcher: /\bvoid\b/, type: "type-keyword" },

  { matcher: /\bif\b/, type: "control-keyword" },
  { matcher: /\belse\b/, type: "control-keyword" },
  { matcher: /\bfor\b/, type: "control-keyword" },
  { matcher: /\bwhile\b/, type: "control-keyword" },

  { matcher: /\bclass\b/, type: "declaration-keyword" },
  { matcher: /\binit\b/, type: "constructor-keyword" },
  { matcher: /\bstruct\b/, type: "declaration-keyword" },
  { matcher: /\benum\b/, type: "declaration-keyword" },
  { matcher: /\bpublic\b/, type: "modifier-keyword" },
  { matcher: /\bprivate\b/, type: "modifier-keyword" },
  { matcher: /\bprotected\b/, type: "modifier-keyword" },
  { matcher: /\bstatic\b/, type: "modifier-keyword" },
  { matcher: /\bconst\b/, type: "modifier-keyword" },
  { matcher: /\bfinal\b/, type: "modifier-keyword" },
  { matcher: /\bnew\b/, type: "operator-new" },

  { matcher: /\bthis\b/, type: "special-keyword" },

  { matcher: /[a-zA-Z_][a-zA-Z0-9_]*/, type: "identifier" },

  { matcher: /^.+/, type: null },
];

let testVariable;
function tokenise(input, safeMode = true) {
  const tokens = [];
  let pos = 0;
  let lineNumber = 1;
  testVariable = input;

  while (pos < input.length) {
    let matched = false;

    for (const rule of rules) {
      const match = input.slice(pos).match(rule.matcher);

      if (match && match.index === 0) {
        matched = true;
        const value = match[0];
        pos += value.length;

        if (rule.type == "line-break") {
          lineNumber++;
          if (!safeMode) tokens.push({ type: "line-break", value, lineNumber });
        } else if (rule.type !== null) {
          let token = {
            value: rule.valueExtractor ? rule.valueExtractor(value) : value,
            type: rule.type,
            lineNumber: lineNumber,
          };
          if (rule.postProcess) token = rule.postProcess(token);
          tokens.push(token);
        } else if (!safeMode) tokens.push({ type: "space", value, lineNumber });

        break;
      }
    }

    if (!matched && safeMode) {
      throwCustomError(
        `Unexpected character '${
          input[pos]
        }' at position ${pos} \n ${input.substring(
          Math.max(pos - 10, 0),
          pos,
        )}...${input[pos]}...${input.substring(
          pos + 1,
          Math.min(pos + 10, input.length - 1),
        )}`,
      );
    }

    if (!safeMode && !matched) {
      tokens.push({
        type: "unknown",
        value: input.substring(pos, input.length),
        lineNumber,
      });
      pos = input.length;
    }
  }

  return tokens;
}
