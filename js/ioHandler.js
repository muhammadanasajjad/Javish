function printCustomMessage(message) {
  const container = document.getElementById("output");

  const line = document.createElement("div");
  line.className = "customMessage";
  line.textContent = message;

  container.appendChild(line);
}

function throwCustomError(message, node = null, fullCode) {
  const container = document.getElementById("output");

  const wrapper = document.createElement("div");
  wrapper.className = "errorBox";

  const title = document.createElement("div");
  title.className = "errorTitle";
  title.textContent = "Error";

  const msg = document.createElement("div");
  msg.className = "errorMessage";
  msg.textContent = message;

  wrapper.appendChild(title);
  wrapper.appendChild(msg);

  if (node?.lineNumber && fullCode) {
    const lines = fullCode.split(/\r?\n/);
    const lineIndex = node.lineNumber - 1;
    const lineText = lines[lineIndex] || "";

    const codeBlock = document.createElement("pre");
    codeBlock.className = "errorCode";

    const lineEl = document.createElement("div");
    lineEl.textContent = `${node.lineNumber} | ${lineText}`;

    codeBlock.appendChild(lineEl);

    if (node.value) {
      const col = lineText.indexOf(node.value);

      if (col !== -1) {
        const pointer = document.createElement("div");
        pointer.className = "errorPointer";

        const spaces = " ".repeat(String(node.lineNumber).length + 3 + col);
        pointer.textContent = spaces + "^";

        codeBlock.appendChild(pointer);
      }
    }

    wrapper.appendChild(codeBlock);
  }

  container.appendChild(wrapper);

  throw new Error(message);
}

function getLine(fullCode, lineNumber) {
  const lines = fullCode.split(/\r?\n/);
  return lines[lineNumber - 1] ?? "";
}
