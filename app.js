import spinnerLibrary from "./node_modules/unicode-animations/dist/index.js";

const outputEl = document.getElementById("output");
const inputEl = document.getElementById("command-input");
const promptEl = document.getElementById("prompt");
const jumpButton = document.getElementById("jump-to-bottom");
const sizeMeasureEl = document.getElementById("terminal-size-measure");
const terminalEl = document.getElementById("terminal");
const caretEl = document.getElementById("terminal-caret");
const measureEl = document.getElementById("terminal-measure");
const inputWrapEl = document.querySelector(".terminal__input-wrap");

const STORAGE_KEYS = {
  shellOutput: "terminalos.shell.output",
  aiOutput: "terminalos.ai.output",
  shellHistory: "terminalos.shell.history",
  aiHistory: "terminalos.ai.history",
  theme: "terminalos.theme",
  stats: "terminalos.stats",
};

const settings = {
  showTimestamps: false,
  maxHistory: 100,
};

const shellState = {
  user: "guest",
  host: "terminal",
  home: "/Users/guest",
  cwd: "/Users/guest",
};

let mode = "shell"; // shell | flow | ai
let shellHistory = [];
let shellHistoryIndex = -1;
let aiHistory = [];
let aiHistoryIndex = -1;
let shellOutputHTML = "";
let aiOutputHTML = "";
let currentFlow = null;
let flowState = null;
let isRunning = false;
let pendingTimers = new Set();
let activeSpinner = null;
let tabState = { value: "", timestamp: 0 };
let isUserAtBottom = true;
let sessionStats = {
  startedAt: Date.now(),
  commandsExecuted: 0,
  lastCommand: "",
  sessionDurationMs: 0,
};

const projectData = [
  {
    slug: "terminal-sandbox",
    name: "Terminal Sandbox",
    summary: "Terminal-first personal site with command routing and flows.",
    tech: "Vanilla JS, HTML, CSS",
    highlights: ["Command registry", "Flow engine", "AI mode stub"],
  },
  {
    slug: "signal-lab",
    name: "Signal Lab",
    summary: "Interactive data stories built with a terminal-inspired UI.",
    tech: "D3.js, TypeScript",
    highlights: ["Dynamic charts", "Narrative flow", "Accessible visuals"],
  },
  {
    slug: "ops-console",
    name: "Ops Console",
    summary: "Operational dashboard that feels like a mission control.",
    tech: "React, Node",
    highlights: ["Real-time status", "Custom alerts", "Role-based views"],
  },
];

const appsData = [
  {
    slug: "demo-hub",
    name: "Demo Hub",
    description: "Curated playground of interactive prototypes.",
    url: "https://example.com",
  },
  {
    slug: "ai-sandbox",
    name: "AI Sandbox",
    description: "Experimental AI workflows in the browser.",
    url: "https://example.com/ai",
  },
];

const flows = {
  tour: {
    id: "tour",
    name: "Guided Tour",
    startStepId: "welcome",
    steps: {
      welcome: {
        id: "welcome",
        prompt: "Welcome to terminalOS. Ready for a 60-second tour? (yes/no)",
        type: "choice",
        choices: [
          { label: "yes", value: "yes" },
          { label: "no", value: "no" },
        ],
        next: (input) => (input === "yes" ? "focus" : "end"),
      },
      focus: {
        id: "focus",
        prompt: "What do you want to explore? (about/portfolio/apps)",
        type: "choice",
        choices: [
          { label: "about", value: "about" },
          { label: "portfolio", value: "portfolio" },
          { label: "apps", value: "apps" },
        ],
        next: (input) => `show-${input}`,
      },
      "show-about": {
        id: "show-about",
        prompt: "Type 'about' anytime for the short intro. Want the command list now? (yes/no)",
        type: "choice",
        choices: [
          { label: "yes", value: "yes" },
          { label: "no", value: "no" },
        ],
        next: (input) => (input === "yes" ? "closing" : "closing"),
      },
      "show-portfolio": {
        id: "show-portfolio",
        prompt: "Type 'portfolio' to list projects. Want a quick resume link too? (yes/no)",
        type: "choice",
        choices: [
          { label: "yes", value: "yes" },
          { label: "no", value: "no" },
        ],
        next: () => "closing",
      },
      "show-apps": {
        id: "show-apps",
        prompt: "Type 'apps' to see demos, then 'launch <app>'. Want to open apps now? (yes/no)",
        type: "choice",
        choices: [
          { label: "yes", value: "yes" },
          { label: "no", value: "no" },
        ],
        next: () => "closing",
      },
      closing: {
        id: "closing",
        prompt: "Tour complete. Ready to explore? (yes to exit)",
        type: "choice",
        choices: [{ label: "yes", value: "yes" }],
        links: [{ text: "Open resume PDF", url: "resume.pdf" }],
        next: () => "end",
      },
    },
  },
};

const fileSystem = createFileSystem();

function createFileSystem() {
  return {
    type: "dir",
    entries: {
      Users: {
        type: "dir",
        entries: {
          guest: {
            type: "dir",
            entries: {
              Desktop: {
                type: "dir",
                entries: {
                  "welcome.txt": {
                    type: "file",
                    content: "welcome to terminalOS\ntry: help, ls, pwd, cat about.txt",
                  },
                },
              },
              Documents: {
                type: "dir",
                entries: {
                  "resume.pdf": {
                    type: "file",
                    content: "binary file",
                    openUrl: "resume.pdf",
                    binary: true,
                  },
                },
              },
              Projects: {
                type: "dir",
                entries: {
                  terminalOS: {
                    type: "dir",
                    entries: {
                      "README.txt": {
                        type: "file",
                        content:
                          "terminalOS\n- a terminal-inspired portfolio sandbox\n- try: portfolio, apps, tour",
                      },
                    },
                  },
                },
              },
              "about.txt": {
                type: "file",
                content: () =>
                  "Hi, I'm Nikki Nguyen. This is a terminal-style sandbox for my work.\nTry: portfolio, apps, tour, ai",
              },
              "resume.pdf": {
                type: "file",
                content: "binary file",
                openUrl: "resume.pdf",
                binary: true,
              },
              "portfolio.txt": {
                type: "file",
                content: () =>
                  [
                    "Projects:",
                    ...projectData.map(
                      (project) =>
                        `- ${project.name} (${project.slug}): ${project.summary}`
                    ),
                  ].join("\n"),
              },
              "apps.txt": {
                type: "file",
                content: () =>
                  [
                    "Apps:",
                    ...appsData.map(
                      (app) => `- ${app.name} (${app.slug}): ${app.description}`
                    ),
                  ].join("\n"),
              },
              "links.txt": {
                type: "file",
                content:
                  "Resume: resume.pdf\nEmail: mailto:hello@example.com\nLinkedIn: https://linkedin.com\nGitHub: https://github.com",
              },
            },
          },
        },
      },
    },
  };
}

const themeOptions = ["default", "amber", "ice"];
const spinnerNames = Object.keys(spinnerLibrary).filter((name) => {
  const spinner = spinnerLibrary[name];
  return spinner && Array.isArray(spinner.frames) && spinner.frames.length > 0;
});
const thinkingSpinner =
  spinnerLibrary[
    spinnerNames[Math.floor(Math.random() * spinnerNames.length)] || "braille"
  ] ||
  spinnerLibrary.braille ||
  spinnerLibrary.helix;
const DEFAULT_COMMAND_DELAY = 520;
const DEFAULT_STEP_DELAY = 45;

const baseCommands = [
  {
    name: "help",
    aliases: ["?", "commands"],
    description: "List available commands.",
    usage: "help [command]",
    handler: (args) => {
      if (args.length) {
        return buildCommandHelp(args[0]);
      }
      const events = [printLine("Available commands:", "success")];
      const sorted = [...new Set(baseCommands.map((cmd) => cmd.name))].sort();
      sorted.forEach((name) => {
        const cmd = commandRegistry.get(name);
        if (cmd) {
          events.push(printLine(`${cmd.name.padEnd(10)} ${cmd.description}`));
        }
      });
      events.push(printLine("Try: man <command>", "success"));
      return events;
    },
  },
  {
    name: "man",
    aliases: [],
    description: "Show command manual.",
    usage: "man <command>",
    handler: (args) => {
      if (!args.length) {
        return [printLine("man: what manual page do you want?", "error")];
      }
      return buildCommandHelp(args[0]);
    },
  },
  {
    name: "pwd",
    aliases: [],
    description: "Print working directory.",
    usage: "pwd",
    handler: () => [printLine(shellState.cwd)],
  },
  {
    name: "whoami",
    aliases: [],
    description: "Print current user.",
    usage: "whoami",
    handler: () => [printLine(shellState.user)],
  },
  {
    name: "ls",
    aliases: [],
    description: "List directory contents.",
    usage: "ls [path]",
    runDelay: 80,
    stepDelay: 20,
    thinkingLabel: "Working...",
    handler: (args) => {
      const target = args[0] || ".";
      const resolved = resolvePath(target);
      const node = getNode(resolved);
      if (!node) {
        return [printLine(`ls: ${target}: No such file or directory`, "error")];
      }
      if (node.type !== "dir") {
        return [printLine(target)];
      }
      return [htmlLine(formatDirectoryListing(node.entries || {}))];
    },
  },
  {
    name: "cd",
    aliases: [],
    description: "Change directory.",
    usage: "cd [path]",
    handler: (args) => {
      const target = args[0] || shellState.home;
      const resolved = resolvePath(target);
      const node = getNode(resolved);
      if (!node) {
        return [printLine(`cd: no such file or directory: ${target}`, "error")];
      }
      if (node.type !== "dir") {
        return [printLine(`cd: not a directory: ${target}`, "error")];
      }
      shellState.cwd = resolved;
      updatePrompt();
      updateTitle();
      return [];
    },
  },
  {
    name: "cat",
    aliases: [],
    description: "Print file contents.",
    usage: "cat <file>",
    runDelay: 120,
    stepDelay: 20,
    thinkingLabel: "Working...",
    handler: (args) => {
      const target = args[0];
      if (!target) {
        return [printLine("cat: missing file operand", "error")];
      }
      const resolved = resolvePath(target);
      const node = getNode(resolved);
      if (!node) {
        return [printLine(`cat: ${target}: No such file or directory`, "error")];
      }
      if (node.type === "dir") {
        return [printLine(`cat: ${target}: Is a directory`, "error")];
      }
      if (node.binary) {
        return [printLine(`cat: ${target}: Binary file`, "error")];
      }
      return [printLine(getFileContent(node))];
    },
  },
  {
    name: "open",
    aliases: [],
    description: "Open a file, url, or app.",
    usage: "open <file|url|app>",
    runDelay: 150,
    stepDelay: 20,
    thinkingLabel: "Working...",
    handler: (args) => {
      if (!args.length) {
        return [printLine("open: missing operand", "error")];
      }
      const target = args.join(" ");
      const normalized = target.toLowerCase();
      if (normalized === "resume") {
        return [openUrl("resume.pdf")];
      }
      const url = normalizeUrl(target);
      if (url) {
        return [openUrl(url)];
      }

      const app = findApp(target);
      if (app) {
        return [openUrl(app.url)];
      }

      const project = findProject(target);
      if (project) {
        return describeProject(project);
      }

      const resolved = resolvePath(target);
      const node = getNode(resolved);
      if (node && node.type === "file") {
        if (node.openUrl) {
          return [openUrl(node.openUrl)];
        }
        if (isOpenableFile(target)) {
          return [openUrl(target)];
        }
        return [printLine(`open: ${target}: not a supported file type`, "error")];
      }
      return [printLine(`open: ${target}: No such file or app`, "error")];
    },
  },
  {
    name: "clear",
    aliases: [],
    description: "Clear the screen.",
    usage: "clear",
    handler: () => [clearScreen()],
  },
  {
    name: "reset",
    aliases: [],
    description: "Reset the terminal.",
    usage: "reset",
    handler: () => [resetTerminal()],
  },
  {
    name: "about",
    aliases: [],
    description: "Short intro and suggested next steps.",
    usage: "about",
    handler: () => [
      printLine("Hi, I'm Nikki Nguyen. This is a terminal-style sandbox for my work."),
      printLine("Try: portfolio, apps, tour, ai", "success"),
    ],
  },
  {
    name: "portfolio",
    aliases: [],
    description: "List featured projects.",
    usage: "portfolio",
    runDelay: 80,
    stepDelay: 25,
    thinkingLabel: "Working...",
    handler: () => {
      const events = [printLine("Projects:", "success")];
      projectData.forEach((project) => {
        events.push(
          printLine(`- ${project.name} (${project.slug}): ${project.summary}`)
        );
      });
      events.push(printLine("Use: open <project>", "success"));
      return events;
    },
  },
  {
    name: "apps",
    aliases: [],
    description: "List external demos.",
    usage: "apps",
    runDelay: 80,
    stepDelay: 25,
    thinkingLabel: "Working...",
    handler: () => {
      const events = [printLine("Apps:", "success")];
      appsData.forEach((app) => {
        events.push(printLine(`- ${app.name} (${app.slug}): ${app.description}`));
      });
      events.push(printLine("Use: open <app>", "success"));
      return events;
    },
  },
  {
    name: "launch",
    aliases: [],
    description: "Open a listed app in a new tab.",
    usage: "launch <app>",
    handler: (args) => {
      const slug = args[0];
      if (!slug) {
        return [printLine("Missing app slug. Usage: launch <app>", "error")];
      }
      const app = findApp(slug);
      if (!app) {
        return [printLine(`App not found: ${slug}. Usage: launch <app>`, "error")];
      }
      return [openUrl(app.url)];
    },
  },
  {
    name: "resume",
    aliases: [],
    description: "Open resume PDF in a new tab.",
    usage: "resume",
    handler: () => [openUrl("resume.pdf")],
  },
  {
    name: "contact",
    aliases: [],
    description: "Show contact links.",
    usage: "contact",
    handler: () => [
      linkLine("Email", "mailto:hello@example.com"),
      linkLine("LinkedIn", "https://linkedin.com"),
      linkLine("GitHub", "https://github.com"),
    ],
  },
  {
    name: "tour",
    aliases: [],
    description: "Start the guided tour flow.",
    usage: "tour",
    handler: () => [enterFlow("tour")],
  },
  {
    name: "ai",
    aliases: ["chat"],
    description: "Enter AI chat mode.",
    usage: "ai",
    handler: () => [enterAIMode()],
  },
  {
    name: "theme",
    aliases: [],
    description: "List or set a theme.",
    usage: "theme [name]",
    handler: (args) => {
      const nextTheme = args[0];
      if (!nextTheme) {
        return [printLine(`Themes: ${themeOptions.join(", ")}`, "success")];
      }
      if (!themeOptions.includes(nextTheme)) {
        return [printLine(`Unknown theme. Choose: ${themeOptions.join(", ")}`, "error")];
      }
      applyTheme(nextTheme);
      return [printLine(`Theme set to ${nextTheme}.`, "success")];
    },
  },
  {
    name: "sudo",
    aliases: [],
    description: "Easter egg.",
    usage: "sudo",
    handler: () => [printLine("Permission denied. Nice try.", "error")],
  },
  {
    name: "rm",
    aliases: [],
    description: "Easter egg.",
    usage: "rm -rf /",
    handler: (args) => {
      if (args.includes("-rf") && args.includes("/")) {
        return [printLine("Nope. This sandbox is indestructible.", "error")];
      }
      return [printLine("rm: missing operand", "error")];
    },
  },
];

const commandRegistry = buildCommandRegistry(baseCommands);

function buildCommandRegistry(commands) {
  const registry = new Map();
  commands.forEach((command) => {
    registry.set(command.name, command);
    command.aliases.forEach((alias) => registry.set(alias, command));
  });
  return registry;
}

function printLine(text, tone = "") {
  return { type: "print", text, tone };
}

function htmlLine(html, tone = "") {
  return { type: "html", html, tone };
}

function linkLine(text, url) {
  return { type: "link", text, url };
}

function enterFlow(flowId) {
  return { type: "enterFlow", flowId };
}

function enterAIMode() {
  return { type: "enterAIMode" };
}

function openUrl(url) {
  return { type: "openUrl", url };
}

function clearScreen() {
  return { type: "clear" };
}

function resetTerminal() {
  return { type: "reset" };
}

function escapeHTML(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatText(text) {
  const escaped = escapeHTML(text);
  const codeBlockRegex = /```([\s\S]*?)```/g;
  let formatted = escaped.replace(codeBlockRegex, (match, code) => {
    return `<pre>${code}</pre>`;
  });

  formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  formatted = formatted.replace(/`([^`]+)`/g, "<code>$1</code>");
  return formatted;
}

function getFileContent(node) {
  if (!node || node.type !== "file") return "";
  if (typeof node.content === "function") {
    return node.content();
  }
  return node.content || "";
}

function resolvePath(input) {
  if (!input || input === "~") return shellState.home;
  let base = input;
  if (input.startsWith("~")) {
    base = `${shellState.home}${input.slice(1)}`;
  } else if (!input.startsWith("/")) {
    base = `${shellState.cwd}/${input}`;
  }

  const segments = base.split("/").filter(Boolean);
  const resolved = [];
  segments.forEach((segment) => {
    if (segment === ".") return;
    if (segment === "..") {
      resolved.pop();
      return;
    }
    resolved.push(segment);
  });
  return `/${resolved.join("/")}`;
}

function getNode(path) {
  if (!path) return null;
  const segments = path.split("/").filter(Boolean);
  let node = fileSystem;
  for (const segment of segments) {
    if (!node.entries || !node.entries[segment]) return null;
    node = node.entries[segment];
  }
  return node;
}

function formatDirectoryListing(entries) {
  const names = Object.keys(entries || {}).sort((a, b) => a.localeCompare(b));
  return names
    .map((name) => {
      const node = entries[name];
      const safeName = escapeHTML(name);
      if (node.type === "dir") {
        return `<span class="dir">${safeName}</span>`;
      }
      return `<span class="file">${safeName}</span>`;
    })
    .join("  ");
}

function formatPromptPath(path) {
  if (path === shellState.home) return "~";
  if (path.startsWith(`${shellState.home}/`)) {
    return `~/${path.slice(shellState.home.length + 1)}`;
  }
  return path;
}

function getPromptText() {
  const path = formatPromptPath(shellState.cwd);
  return `${shellState.user}@${shellState.host} ${path} %`;
}

function normalizeUrl(target) {
  if (!target) return "";
  const trimmed = target.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^mailto:/i.test(trimmed)) return trimmed;
  return "";
}

function isOpenableFile(target) {
  return /\.(pdf|html?|png|jpe?g)$/i.test(target);
}

function findApp(target) {
  const normalized = target.toLowerCase();
  return appsData.find(
    (item) =>
      item.slug.toLowerCase() === normalized ||
      item.name.toLowerCase() === normalized
  );
}

function findProject(target) {
  const normalized = target.toLowerCase();
  return projectData.find(
    (item) =>
      item.slug.toLowerCase() === normalized ||
      item.name.toLowerCase() === normalized
  );
}

function describeProject(project) {
  return [
    printLine(`Project: ${project.name}`, "success"),
    printLine(project.summary),
    printLine(`Tech: ${project.tech}`),
    printLine(`Highlights: ${project.highlights.join(", ")}`),
  ];
}

function buildCommandHelp(commandName) {
  const entry = commandRegistry.get(commandName);
  if (!entry) {
    return [printLine(`help: no help topics match '${commandName}'`, "error")];
  }
  const aliases = entry.aliases.length ? entry.aliases.join(", ") : "none";
  return [
    printLine(`${entry.name} - ${entry.description}`, "success"),
    printLine(`usage: ${entry.usage}`),
    printLine(`aliases: ${aliases}`),
  ];
}

function appendLine(text, tone = "") {
  const line = document.createElement("div");
  line.className = "output-line";
  if (tone) line.classList.add(tone);

  if (settings.showTimestamps) {
    const timestamp = document.createElement("span");
    timestamp.className = "timestamp";
    timestamp.textContent = new Date().toLocaleTimeString();
    line.appendChild(timestamp);
  }

  const span = document.createElement("span");
  span.innerHTML = formatText(text);
  line.appendChild(span);
  addOutputNode(line);
}

function appendHTMLLine(html, tone = "") {
  const line = document.createElement("div");
  line.className = "output-line";
  if (tone) line.classList.add(tone);
  line.innerHTML = html;
  addOutputNode(line);
}

function appendCommandEcho(commandText) {
  const line = document.createElement("div");
  line.className = "output-line";

  const promptSpan = document.createElement("span");
  promptSpan.className = "cmd";
  promptSpan.textContent = `${promptEl.textContent} `;
  line.appendChild(promptSpan);

  const cmdSpan = document.createElement("span");
  cmdSpan.textContent = commandText;
  line.appendChild(cmdSpan);
  addOutputNode(line);
}

function appendLink(text, url) {
  const line = document.createElement("div");
  line.className = "output-line";
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  anchor.textContent = text;
  line.appendChild(anchor);
  addOutputNode(line);
}

function appendPanel(title, content) {
  const container = document.createElement("div");
  container.className = "panel";

  const heading = document.createElement("div");
  heading.className = "panel__title";
  heading.textContent = title;
  container.appendChild(heading);

  const body = document.createElement("div");
  body.className = "panel__content";
  body.innerHTML = formatText(content);
  container.appendChild(body);

  addOutputNode(container);
}

function startThinkingIndicator(label = "Thinking...") {
  stopThinkingIndicator();
  if (!thinkingSpinner?.frames?.length) return;

  const line = document.createElement("div");
  line.className = "output-line output-line--spinner";

  const frame = document.createElement("span");
  frame.className = "spinner-frame";
  frame.textContent = thinkingSpinner.frames[0];
  line.appendChild(frame);

  const text = document.createElement("span");
  text.textContent = label;
  line.appendChild(text);

  addOutputNode(line);

  let index = 1;
  const timerId = window.setInterval(() => {
    frame.textContent = thinkingSpinner.frames[index % thinkingSpinner.frames.length];
    index += 1;
  }, thinkingSpinner.interval || 80);

  activeSpinner = { line, timerId };
}

function stopThinkingIndicator() {
  if (!activeSpinner) return;
  window.clearInterval(activeSpinner.timerId);
  activeSpinner.line.remove();
  activeSpinner = null;
}

function scrollToBottom() {
  outputEl.scrollTop = outputEl.scrollHeight;
  isUserAtBottom = true;
  updateJumpButton();
}

function isScrolledToBottom() {
  const threshold = 8;
  return (
    outputEl.scrollHeight - outputEl.scrollTop - outputEl.clientHeight < threshold
  );
}

function updateJumpButton() {
  if (!jumpButton) return;
  const shouldShow = !isUserAtBottom;
  jumpButton.classList.toggle("is-visible", shouldShow);
}

function addOutputNode(node) {
  const wasAtBottom = isScrolledToBottom();
  outputEl.appendChild(node);
  if (wasAtBottom) {
    scrollToBottom();
  } else {
    isUserAtBottom = false;
    updateJumpButton();
  }
}

function updateCaret() {
  if (!caretEl || !measureEl) return;
  const caretIndex =
    typeof inputEl.selectionStart === "number"
      ? inputEl.selectionStart
      : inputEl.value.length;
  measureEl.textContent = inputEl.value.slice(0, caretIndex) || "";
  const width = measureEl.getBoundingClientRect().width;
  const offset = Math.max(0, width - inputEl.scrollLeft);
  caretEl.style.transform = `translateX(${offset}px)`;
}

function setInputValue(value) {
  inputEl.value = value;
  tabState = { value: "", timestamp: 0 };
  const end = value.length;
  inputEl.setSelectionRange(end, end);
  updateCaret();
}

function parseInput(input) {
  const tokens = [];
  const regex = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let match;
  while ((match = regex.exec(input)) !== null) {
    tokens.push(match[1] || match[2] || match[3]);
  }
  const command = (tokens[0] || "").toLowerCase();
  const argsRaw = tokens.slice(1);
  const flags = {};
  const args = [];

  argsRaw.forEach((arg) => {
    if (arg.startsWith("--")) {
      flags[arg.slice(2)] = true;
      return;
    }
    if (arg.startsWith("-") && arg.length > 1) {
      arg
        .slice(1)
        .split("")
        .forEach((flag) => {
          flags[flag] = true;
        });
      return;
    }
    args.push(arg);
  });

  return { command, args, flags, raw: input };
}

function setRunning(next) {
  isRunning = next;
  inputEl.disabled = next;
  if (!next) {
    inputEl.focus({ preventScroll: true });
    updateCaret();
  }
}

function clearPendingTimers() {
  pendingTimers.forEach((timerId) => clearTimeout(timerId));
  pendingTimers.clear();
  stopThinkingIndicator();
}

function scheduleEvent(callback, delay) {
  const timerId = window.setTimeout(() => {
    pendingTimers.delete(timerId);
    callback();
  }, delay);
  pendingTimers.add(timerId);
}

function queueEvents(events, options = {}) {
  const queuedEvents = Array.isArray(events) ? events : [];
  const initialDelay =
    typeof options.initialDelay === "number" ? options.initialDelay : 0;
  const stepDelay =
    typeof options.stepDelay === "number" ? options.stepDelay : DEFAULT_STEP_DELAY;
  const thinkingLabel = options.thinkingLabel || "Thinking...";
  setRunning(true);
  startThinkingIndicator(thinkingLabel);
  let totalDelay = initialDelay;
  queuedEvents.forEach((event, index) => {
    scheduleEvent(() => {
      if (index === 0) {
        stopThinkingIndicator();
      }
      renderEvent(event);
    }, totalDelay);
    totalDelay += stepDelay;
  });
  scheduleEvent(() => {
    stopThinkingIndicator();
    setRunning(false);
    saveOutput();
  }, totalDelay);
}

function interruptRunning() {
  if (!isRunning) return false;
  clearPendingTimers();
  setRunning(false);
  return true;
}

function runCommand(input) {
  const trimmed = input.trim();
  if (!trimmed) return;
  if (isRunning) return;

  appendCommandEcho(trimmed);
  recordCommand(trimmed);

  const { command, args } = parseInput(trimmed);
  const entry = commandRegistry.get(command);
  if (!entry) {
    queueEvents([printLine(`zsh: command not found: ${command}`, "error")], {
      initialDelay: DEFAULT_COMMAND_DELAY,
      stepDelay: 0,
      thinkingLabel: "Thinking...",
    });
    return;
  }

  const events = entry.handler(args) || [];
  const runDelay = Math.max(entry.runDelay || 0, DEFAULT_COMMAND_DELAY);
  const stepDelay = entry.stepDelay || 0;
  queueEvents(events, {
    initialDelay: runDelay,
    stepDelay,
    thinkingLabel: entry.thinkingLabel,
  });
}

function renderEvent(event) {
  if (!event) return;
  switch (event.type) {
    case "print":
      appendLine(event.text, event.tone || "");
      break;
    case "html":
      appendHTMLLine(event.html, event.tone || "");
      break;
    case "link":
      appendLink(event.text, event.url);
      break;
    case "panel":
      appendPanel(event.title, event.content);
      break;
    case "clear":
      outputEl.innerHTML = "";
      isUserAtBottom = true;
      updateJumpButton();
      break;
    case "reset":
      outputEl.innerHTML = "";
      shellState.cwd = shellState.home;
      mode = "shell";
      updatePrompt();
      updateTitle();
      isUserAtBottom = true;
      updateJumpButton();
      break;
    case "openUrl":
      window.open(event.url, "_blank", "noopener,noreferrer");
      appendLine(`Opening ${event.url}...`, "success");
      break;
    case "enterFlow":
      startFlow(event.flowId);
      break;
    case "enterAIMode":
      startAIMode();
      break;
    default:
      appendLine("Unknown event.", "error");
  }
}

function startFlow(flowId) {
  const flow = flows[flowId];
  if (!flow) {
    appendLine(`Flow not found: ${flowId}`, "error");
    return;
  }
  mode = "flow";
  currentFlow = flow;
  flowState = {
    id: flowId,
    stepId: flow.startStepId,
    answers: {},
    stack: [],
  };
  updatePrompt();
  appendLine(`Entering flow: ${flow.name}`, "success");
  printFlowStep();
}

function printFlowStep() {
  if (!currentFlow || !flowState) return;
  const step = currentFlow.steps[flowState.stepId];
  if (!step) {
    appendLine("Flow step missing.", "error");
    exitFlow();
    return;
  }
  let promptText = step.prompt;
  if (step.type === "choice" && step.choices) {
    const choicesText = step.choices
      .map((choice, index) => `${index + 1}) ${choice.label}`)
      .join(" ");
    promptText = `${promptText}\n${choicesText}`;
  }
  appendLine(promptText, "success");
  if (step.links && Array.isArray(step.links)) {
    step.links.forEach((item) => {
      appendLink(item.text, item.url);
    });
  }
}

function handleFlowInput(input) {
  const trimmed = input.trim();
  if (!trimmed) return;

  const reserved = trimmed.toLowerCase();
  if (reserved === "exit") {
    appendLine("Flow exited.", "error");
    exitFlow();
    return;
  }
  if (reserved === "restart") {
    flowState.stepId = currentFlow.startStepId;
    flowState.answers = {};
    flowState.stack = [];
    appendLine("Flow restarted.", "success");
    printFlowStep();
    return;
  }
  if (reserved === "back") {
    const previous = flowState.stack.pop();
    if (previous) {
      flowState.stepId = previous;
      appendLine("Back to previous step.", "success");
      printFlowStep();
    } else {
      appendLine("No previous step.", "error");
    }
    return;
  }
  if (reserved === "help") {
    appendLine("Flow commands: exit, back, restart, help", "success");
    return;
  }

  const step = currentFlow.steps[flowState.stepId];
  if (!step) {
    appendLine("Flow step missing.", "error");
    exitFlow();
    return;
  }

  let answer = trimmed;

  if (step.type === "choice" && step.choices) {
    const index = Number.parseInt(trimmed, 10);
    if (!Number.isNaN(index) && step.choices[index - 1]) {
      answer = step.choices[index - 1].value;
    } else {
      const match = step.choices.find(
        (choice) => choice.value === trimmed || choice.label === trimmed
      );
      if (match) {
        answer = match.value;
      } else {
        appendLine("Invalid choice. Try one of the listed options.", "error");
        return;
      }
    }
  }

  if (typeof step.validate === "function") {
    const error = step.validate(answer);
    if (error) {
      appendLine(error, "error");
      return;
    }
  }

  flowState.answers[step.id] = answer;
  flowState.stack.push(step.id);

  let nextStep = null;
  if (typeof step.next === "function") {
    nextStep = step.next(answer, flowState.answers);
  } else {
    nextStep = step.next;
  }

  if (nextStep === "end") {
    appendLine("Flow complete. Summary:", "success");
    Object.entries(flowState.answers).forEach(([key, value]) => {
      appendLine(`- ${key}: ${value}`);
    });
    exitFlow();
    return;
  }

  flowState.stepId = nextStep;
  printFlowStep();
}

function exitFlow() {
  mode = "shell";
  currentFlow = null;
  flowState = null;
  updatePrompt();
  appendLine("Returned to shell.", "success");
  saveOutput();
}

function startAIMode() {
  if (mode === "ai") return;
  shellOutputHTML = outputEl.innerHTML;
  outputEl.innerHTML = aiOutputHTML;
  mode = "ai";
  updatePrompt();
  appendLine("AI mode active. Type 'exit' to return.", "success");
  saveOutput();
}

function exitAIMode() {
  aiOutputHTML = outputEl.innerHTML;
  outputEl.innerHTML = shellOutputHTML;
  mode = "shell";
  updatePrompt();
  appendLine("Exited AI mode.", "success");
  saveOutput();
}

function handleAIInput(input) {
  const trimmed = input.trim();
  if (!trimmed) return;

  if (trimmed.toLowerCase() === "exit") {
    appendLine("Leaving AI mode...", "success");
    exitAIMode();
    return;
  }
  if (trimmed.toLowerCase() === "clear") {
    outputEl.innerHTML = "";
    appendLine("AI transcript cleared.", "success");
    return;
  }

  appendLine(`You: ${trimmed}`);
  const reply = generateAIReply(trimmed);
  queueEvents([printLine(`AI: ${reply}`, "success")], {
    initialDelay: 1200,
    stepDelay: 0,
    thinkingLabel: "Thinking...",
  });
}

function generateAIReply(input) {
  const lower = input.toLowerCase();
  if (lower.includes("portfolio")) {
    return "Try `portfolio` to list projects, then `open <slug>` for details.";
  }
  if (lower.includes("resume")) {
    return "Use `resume` to open the PDF in a new tab.";
  }
  if (lower.includes("help")) {
    return "Type `help` for the command list. I can guide you too.";
  }
  return "I'm a lightweight AI stub. Ask about the portfolio, apps, or commands.";
}

function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // Ignore storage failures (private mode, quota exceeded, etc.)
  }
}

function safeStorageRemove(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    // Ignore storage failures (private mode, quota exceeded, etc.)
  }
}

function recordCommand(commandText) {
  sessionStats.commandsExecuted += 1;
  sessionStats.lastCommand = commandText;
  safeStorageSet(STORAGE_KEYS.stats, JSON.stringify(sessionStats));
}

function loadStats() {
  const storedStats = safeStorageGet(STORAGE_KEYS.stats);
  if (!storedStats) return;
  try {
    const parsed = JSON.parse(storedStats);
    sessionStats = {
      startedAt: parsed.startedAt || Date.now(),
      commandsExecuted: parsed.commandsExecuted || 0,
      lastCommand: parsed.lastCommand || "",
      sessionDurationMs: parsed.sessionDurationMs || 0,
    };
  } catch (error) {
    sessionStats = {
      startedAt: Date.now(),
      commandsExecuted: 0,
      lastCommand: "",
      sessionDurationMs: 0,
    };
  }
}

function applyTheme(themeName) {
  terminalEl.classList.remove("theme-amber", "theme-ice");
  if (themeName !== "default") {
    terminalEl.classList.add(`theme-${themeName}`);
  }
  safeStorageSet(STORAGE_KEYS.theme, themeName);
}

function updatePrompt() {
  if (mode === "shell") {
    promptEl.textContent = getPromptText();
  } else if (mode === "flow") {
    promptEl.textContent = `flow:${currentFlow?.id || "tour"}>`;
  } else if (mode === "ai") {
    const path = formatPromptPath(shellState.cwd);
    promptEl.textContent = `ai@${shellState.host} ${path} %`;
  }
  updateTitle();
}

function updateTitle() {
  if (!sizeMeasureEl) return;
  const testWidth = sizeMeasureEl.getBoundingClientRect().width || 1;
  const charWidth = testWidth / 10;
  const lineHeight =
    parseFloat(getComputedStyle(outputEl).lineHeight) ||
    parseFloat(getComputedStyle(outputEl).fontSize) * 1.55;
  const cols = Math.max(40, Math.floor(outputEl.clientWidth / charWidth));
  const rows = Math.max(10, Math.floor(outputEl.clientHeight / lineHeight));
  document.title = `Terminal — zsh — ${cols}x${rows}`;
}

function saveOutput() {
  if (mode === "ai") {
    aiOutputHTML = outputEl.innerHTML;
  } else {
    shellOutputHTML = outputEl.innerHTML;
  }
}

function clearPersistedHistory() {
  safeStorageRemove(STORAGE_KEYS.shellOutput);
  safeStorageRemove(STORAGE_KEYS.aiOutput);
  safeStorageRemove(STORAGE_KEYS.shellHistory);
  safeStorageRemove(STORAGE_KEYS.aiHistory);
}

function loadState() {
  const storedTheme = safeStorageGet(STORAGE_KEYS.theme);

  clearPersistedHistory();
  shellOutputHTML = "";
  aiOutputHTML = "";
  shellHistory = [];
  shellHistoryIndex = 0;
  aiHistory = [];
  aiHistoryIndex = 0;
  outputEl.innerHTML = "";

  if (storedTheme) {
    applyTheme(storedTheme);
  }
  loadStats();
}

function printWelcome() {
  const now = new Date();
  const formatted = now.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  appendLine(`Last login: ${formatted.replace(",", "")} on ttys000`);
  appendLine("Type 'help' to see available commands.");
}

inputEl.addEventListener("keydown", (event) => {
  if (event.ctrlKey && !event.metaKey) {
    const key = event.key.toLowerCase();
    if (key === "a") {
      event.preventDefault();
      inputEl.setSelectionRange(0, 0);
      updateCaret();
      return;
    }
    if (key === "e") {
      event.preventDefault();
      const end = inputEl.value.length;
      inputEl.setSelectionRange(end, end);
      updateCaret();
      return;
    }
    if (key === "u") {
      event.preventDefault();
      setInputValue("");
      return;
    }
    if (key === "l") {
      event.preventDefault();
      outputEl.innerHTML = "";
      isUserAtBottom = true;
      updateJumpButton();
      saveOutput();
      return;
    }
    if (key === "c") {
      event.preventDefault();
      if (interruptRunning()) {
        appendLine("^C");
        saveOutput();
        return;
      }
      if (mode === "flow") {
        appendLine("^C");
        exitFlow();
        saveOutput();
        return;
      }
      if (mode === "ai") {
        appendLine("^C");
        exitAIMode();
        saveOutput();
        return;
      }
      appendLine("^C");
      setInputValue("");
      saveOutput();
      return;
    }
  }

  if (event.key === "Enter") {
    event.preventDefault();
    if (isRunning) return;
    const value = inputEl.value;
    inputEl.value = "";
    updateCaret();

    if (mode === "shell") {
      if (value.trim()) {
        shellHistory.push(value.trim());
        shellHistoryIndex = shellHistory.length;
      }
      runCommand(value);
      return;
    }

    if (mode === "flow") {
      appendCommandEcho(value);
      handleFlowInput(value);
      saveOutput();
      return;
    }

    if (mode === "ai") {
      if (value.trim()) {
        aiHistory.push(value.trim());
        aiHistoryIndex = aiHistory.length;
      }
      appendCommandEcho(value);
      handleAIInput(value);
      return;
    }
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    const history = mode === "ai" ? aiHistory : shellHistory;
    if (history.length === 0) return;
    if (mode === "ai") {
      aiHistoryIndex = Math.max(0, aiHistoryIndex - 1);
      setInputValue(history[aiHistoryIndex] || "");
    } else if (mode === "shell") {
      shellHistoryIndex = Math.max(0, shellHistoryIndex - 1);
      setInputValue(history[shellHistoryIndex] || "");
    }
  }

  if (event.key === "ArrowDown") {
    event.preventDefault();
    const history = mode === "ai" ? aiHistory : shellHistory;
    if (history.length === 0) return;
    if (mode === "ai") {
      aiHistoryIndex = Math.min(history.length, aiHistoryIndex + 1);
      setInputValue(history[aiHistoryIndex] || "");
    } else if (mode === "shell") {
      shellHistoryIndex = Math.min(history.length, shellHistoryIndex + 1);
      setInputValue(history[shellHistoryIndex] || "");
    }
  }

  if (event.key === "Tab" && mode === "shell") {
    event.preventDefault();
    if (isRunning) return;
    const rawValue = inputEl.value;
    const value = rawValue.trim();
    if (!value || rawValue.includes(" ")) return;
    const matches = baseCommands
      .map((cmd) => cmd.name)
      .filter((name) => name.startsWith(value));
    if (matches.length === 1) {
      setInputValue(matches[0] + " ");
      tabState = { value: "", timestamp: 0 };
    } else if (matches.length > 1) {
      const now = Date.now();
      if (tabState.value === value && now - tabState.timestamp < 800) {
        appendLine(matches.join("    "));
        saveOutput();
        tabState = { value: "", timestamp: 0 };
      } else {
        tabState = { value, timestamp: now };
      }
    }
  }
});

inputEl.addEventListener("input", () => {
  tabState = { value: "", timestamp: 0 };
  updateCaret();
});
inputEl.addEventListener("scroll", updateCaret);
inputEl.addEventListener("keyup", updateCaret);
inputEl.addEventListener("click", updateCaret);
inputEl.addEventListener("select", updateCaret);
inputEl.addEventListener("focus", () => {
  if (inputWrapEl) {
    inputWrapEl.classList.add("is-focused");
  }
  updateCaret();
});
inputEl.addEventListener("blur", () => {
  if (inputWrapEl) {
    inputWrapEl.classList.remove("is-focused");
  }
});
window.addEventListener("resize", () => {
  updateCaret();
  updateTitle();
});

outputEl.addEventListener("scroll", () => {
  isUserAtBottom = isScrolledToBottom();
  updateJumpButton();
});

outputEl.addEventListener("click", () => {
  inputEl.focus();
  updateCaret();
});

terminalEl.addEventListener("click", (event) => {
  const target = event.target;
  if (target instanceof HTMLElement && target.tagName === "BUTTON") return;
  inputEl.focus();
  updateCaret();
});

if (jumpButton) {
  jumpButton.addEventListener("click", () => {
    scrollToBottom();
    inputEl.focus();
  });
}

window.addEventListener("beforeunload", () => {
  sessionStats.sessionDurationMs = Date.now() - sessionStats.startedAt;
  safeStorageSet(STORAGE_KEYS.stats, JSON.stringify(sessionStats));
  saveOutput();
});

loadState();
if (!shellOutputHTML) {
  printWelcome();
}
updatePrompt();
scrollToBottom();
inputEl.focus();
if (inputWrapEl) {
  inputWrapEl.classList.add("is-focused");
}
updateCaret();
