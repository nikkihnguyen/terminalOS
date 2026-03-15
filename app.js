import spinnerLibrary from "./node_modules/unicode-animations/dist/index.js";
import { rawProjectData } from "./projectData.js";

const outputEl = document.getElementById("output");
const inputEl = document.getElementById("command-input");
const promptEl = document.getElementById("prompt");
const jumpButton = document.getElementById("jump-to-bottom");
const sizeMeasureEl = document.getElementById("terminal-size-measure");
const terminalEl = document.getElementById("terminal");
const caretEl = document.getElementById("terminal-caret");
const measureEl = document.getElementById("terminal-measure");
const inputWrapEl = document.querySelector(".terminal__input-wrap");
const ghostEl = document.getElementById("terminal-ghost");
const helperEl = document.getElementById("terminal-helper");
const flowEl = document.getElementById("terminal-flow");

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
let activeFlowStepNode = null;
let isRunning = false;
let pendingTimers = new Set();
let activeSpinner = null;
let activeOutputCapture = null;
let activeAsyncCommandToken = 0;
let geoProfilePromise = null;
let pendingOpenTarget = null;
let tabState = { value: "", timestamp: 0 };
let isUserAtBottom = true;
let sessionStats = {
  startedAt: Date.now(),
  commandsExecuted: 0,
  lastCommand: "",
  sessionDurationMs: 0,
};

const projectUrlMap = {
  "98portfolio": "https://nikkihnguyen.com/os/",
  computervision: "https://nikkihnguyen.com/computer-vision",
  terminalos: "https://nikkihnguyen.com/os/",
};

const projectData = rawProjectData.map((project) => {
  const slug = project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return {
    ...project,
    slug,
    name: project.title,
    tech: project.stack.join(", "),
    highlights: [project.intent, project.build, project.unique],
    url: projectUrlMap[slug] || "",
  };
});

const bookmarksData = [
  {
    slug: "spline",
    name: "Spline",
    description: "Collaborative 3D design tool Nikki previously helped grow.",
    category: "work",
    url: "https://spline.design",
  },
  {
    slug: "perplexity",
    name: "Perplexity",
    description: "One of the AI tools listed in Nikki's bookmarks.",
    category: "ai",
    url: "https://www.perplexity.ai/",
  },
  {
    slug: "claude",
    name: "Claude",
    description: "AI assistant bookmark from the desktop OS page.",
    category: "ai",
    url: "https://claude.ai/",
  },
  {
    slug: "cursor",
    name: "Cursor",
    description: "AI coding tool listed in Nikki's bookmarks.",
    category: "build",
    url: "https://www.cursor.com/",
  },
  {
    slug: "bolt",
    name: "Bolt",
    description: "Fast browser app builder from the bookmarks list.",
    category: "build",
    url: "https://bolt.new/",
  },
  {
    slug: "terminal-os",
    name: "Terminal OS",
    description: "Nikki's desktop-style personal OS experiment.",
    category: "work",
    url: "https://nikkihnguyen.com/os/",
  },
];

const contactLinks = [
  {
    slug: "email",
    name: "Email",
    description: "Nikki's direct email address.",
    url: "mailto:nikki.nguyen8@gmail.com",
  },
  {
    slug: "linkedin",
    name: "LinkedIn",
    description: "Nikki's LinkedIn profile.",
    url: "https://linkedin.com/in/nikkinguyen8/",
  },
  {
    slug: "github",
    name: "GitHub",
    description: "Nikki's GitHub profile.",
    url: "https://github.com/nikkihnguyen",
  },
  {
    slug: "twitter",
    name: "Twitter",
    description: "Nikki's Twitter profile.",
    url: "https://twitter.com/nikkihnguyen",
  },
  {
    slug: "instagram",
    name: "Instagram",
    description: "Nikki's Instagram profile.",
    url: "https://instagram.com/nikkihnguyen/",
  },
  {
    slug: "website",
    name: "Website",
    description: "Nikki's main website.",
    url: "https://nikkihnguyen.com/",
  },
  {
    slug: "os",
    name: "Terminal OS",
    description: "Nikki's desktop-style personal OS experiment.",
    url: "https://nikkihnguyen.com/os/",
  },
];

const projectFilterOptions = ["featured", "recent", "web", "ios", "all"];
const bookmarkFilterOptions = ["featured", "ai", "build", "work"];
const themeOptions = ["default", "amber", "ice", "rose", "matrix"];
const featuredProjectSlugs = [
  "terminalos",
  "98portfolio",
  "computervision",
  "cameraascii",
  "tasktracker",
  "hotdogorlegs",
];
const featuredBookmarkSlugs = ["terminal-os", "spline", "cursor", "claude"];
const FLOW_BACK_VALUE = "back";
const FLOW_EXIT_VALUE = "exit";
const CLI_BOX_WIDTH = 68;
const BOOT_STREAM_DELAY = 42;
const BOOT_INIT_DELAY = 950;
const MAX_OUTPUT_NODES = 220;
const GEO_FETCH_TIMEOUT_MS = 2500;

const flows = {
  "help-picker": {
    id: "help-picker",
    name: "Help Browser",
    startStepId: "command",
    steps: {
      command: {
        id: "command",
        prompt: "Help topic. Use arrows or type.",
        type: "choice",
        choices: () => [
          ...getUniqueCommandNames().map((value) => ({ label: value, value })),
          { label: "exit", value: FLOW_EXIT_VALUE },
        ],
        next: (input) => (input === FLOW_EXIT_VALUE ? "exit" : "show"),
      },
      show: {
        id: "show",
        events: (answers) => buildCommandHelp(answers.command),
        autoExit: true,
      },
    },
  },
  "portfolio-picker": {
    id: "portfolio-picker",
    name: "Portfolio Filter",
    startStepId: "filter",
    steps: {
      filter: {
        id: "filter",
        prompt: "Portfolio view. Use arrows or type. (featured/recent/web/ios/all)",
        type: "choice",
        choices: [
          ...projectFilterOptions.map((value) => ({ label: value, value })),
          { label: "exit", value: FLOW_EXIT_VALUE },
        ],
        next: (input) => (input === FLOW_EXIT_VALUE ? "exit" : "project"),
      },
      project: {
        id: "project",
        prompt: (answers) => `Projects (${answers.filter || "featured"}). Use arrows or type.`,
        type: "choice",
        choices: (answers) => [
          ...getProjectList(answers.filter || "featured").map((project) => ({
            label: project.name,
            value: project.slug,
          })),
          { label: "↩ back", value: FLOW_BACK_VALUE },
          { label: "exit", value: FLOW_EXIT_VALUE },
        ],
        next: (input) => {
          if (input === FLOW_BACK_VALUE) return "filter";
          if (input === FLOW_EXIT_VALUE) return "exit";
          return "show";
        },
      },
      show: {
        id: "show",
        events: (answers) => previewTarget(answers.project),
        autoExit: true,
      },
    },
  },
  "bookmarks-picker": {
    id: "bookmarks-picker",
    name: "Bookmarks Filter",
    startStepId: "filter",
    steps: {
      filter: {
        id: "filter",
        prompt: "Bookmarks view. Use arrows or type. (featured/ai/build/work)",
        type: "choice",
        choices: [
          ...bookmarkFilterOptions.map((value) => ({ label: value, value })),
          { label: "exit", value: FLOW_EXIT_VALUE },
        ],
        next: (input) => (input === FLOW_EXIT_VALUE ? "exit" : "bookmark"),
      },
      bookmark: {
        id: "bookmark",
        prompt: (answers) => `Bookmarks (${answers.filter || "featured"}). Use arrows or type.`,
        type: "choice",
        choices: (answers) => [
          ...getBookmarkList(answers.filter || "featured").map((bookmark) => ({
            label: bookmark.name,
            value: bookmark.slug,
          })),
          { label: "↩ back", value: FLOW_BACK_VALUE },
          { label: "exit", value: FLOW_EXIT_VALUE },
        ],
        next: (input) => {
          if (input === FLOW_BACK_VALUE) return "filter";
          if (input === FLOW_EXIT_VALUE) return "exit";
          return "show";
        },
      },
      show: {
        id: "show",
        events: (answers) => previewTarget(answers.bookmark),
        autoExit: true,
      },
    },
  },
  "contact-browser": {
    id: "contact-browser",
    name: "Contact Browser",
    startStepId: "link",
    steps: {
      link: {
        id: "link",
        prompt: "Contact. Use arrows or type.",
        type: "choice",
        choices: [
          ...contactLinks.map((item) => ({ label: item.name, value: item.slug })),
          { label: "exit", value: FLOW_EXIT_VALUE },
        ],
        next: (input) => (input === FLOW_EXIT_VALUE ? "exit" : "show"),
      },
      show: {
        id: "show",
        events: (answers) => previewTarget(answers.link),
        autoExit: true,
      },
    },
  },
  "os-browser": {
    id: "os-browser",
    name: "OS Browser",
    startStepId: "action",
    steps: {
      action: {
        id: "action",
        prompt: "OS. Use arrows or type.",
        type: "choice",
        choices: [
          { label: "preview", value: "preview" },
          { label: "open", value: "open" },
          { label: "exit", value: FLOW_EXIT_VALUE },
        ],
        next: (input) => (input === FLOW_EXIT_VALUE ? "exit" : "show"),
      },
      show: {
        id: "show",
        events: (answers) =>
          answers.action === "open" ? openTargetDirectly("os") : previewTarget("os"),
        autoExit: true,
      },
    },
  },
  "about-browser": {
    id: "about-browser",
    name: "About Browser",
    startStepId: "section",
    steps: {
      section: {
        id: "section",
        prompt: "About. Use arrows or type.",
        type: "choice",
        choices: [
          { label: "bio", value: "bio" },
          { label: "current", value: "current" },
          { label: "interests", value: "interests" },
          { label: "contact", value: "contact" },
          { label: "os", value: "os" },
          { label: "exit", value: FLOW_EXIT_VALUE },
        ],
        next: (input) => {
          if (input === FLOW_EXIT_VALUE) return "exit";
          if (input === "contact") return "contact";
          if (input === "os") return "os";
          return "show";
        },
      },
      show: {
        id: "show",
        events: (answers) => buildAboutSectionEvents(answers.section),
        autoExit: true,
      },
      contact: {
        id: "contact",
        events: () => [enterFlow("contact-browser")],
        autoExit: true,
      },
      os: {
        id: "os",
        events: () => [enterFlow("os-browser")],
        autoExit: true,
      },
    },
  },
  "theme-picker": {
    id: "theme-picker",
    name: "Theme Picker",
    startStepId: "theme",
    steps: {
      theme: {
        id: "theme",
        prompt: "Theme. Use arrows or type. (default/amber/ice/rose/matrix)",
        type: "choice",
        choices: [
          ...themeOptions.map((value) => ({ label: value, value })),
          { label: "exit", value: FLOW_EXIT_VALUE },
        ],
        next: (input) => (input === FLOW_EXIT_VALUE ? "exit" : "apply"),
      },
      apply: {
        id: "apply",
        events: (answers) => {
          applyTheme(answers.theme || "default");
          return [printLine(`Theme: ${answers.theme || "default"}`, "success")];
        },
        autoExit: true,
      },
    },
  },
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
        prompt: "What do you want to explore? (about/portfolio/bookmarks)",
        type: "choice",
        choices: [
          { label: "about", value: "about" },
          { label: "portfolio", value: "portfolio" },
          { label: "bookmarks", value: "bookmarks" },
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
        prompt: "Type 'portfolio' to list projects. Want to keep exploring after that? (yes/no)",
        type: "choice",
        choices: [
          { label: "yes", value: "yes" },
          { label: "no", value: "no" },
        ],
        next: () => "closing",
      },
      "show-bookmarks": {
        id: "show-bookmarks",
        prompt: "Type 'bookmarks' to browse saved links. Want to open them now? (yes/no)",
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
                entries: {},
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
                          "terminalOS\n- a terminal-inspired portfolio sandbox\n- try: portfolio, bookmarks, tour",
                      },
                    },
                  },
                },
              },
              "about.txt": {
                type: "file",
                content: () =>
                  [
                    "Hi there - I'm Nikki, a product manager based in NYC.",
                    "I'm currently a Product Manager at EliseAI.",
                    "Previously: Growth at Spline, patient experience at Clearing Health, home financing at Better.com, user growth at Dropbox, and new product work at Atlassian.",
                    "I'm drawn to the intersection of product, storytelling, and creative tech.",
                    "I like shipping experiments, testing creator tools, and vibe-coding small apps with AI.",
                    "Try: portfolio, bookmarks, contact, ai",
                  ].join("\n"),
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
              "bookmarks.txt": {
                type: "file",
                content: () =>
                  [
                    "Bookmarks:",
                    ...bookmarksData.map(
                      (app) => `- ${app.name} (${app.slug}): ${app.description}`
                    ),
                  ].join("\n"),
              },
              "links.txt": {
                type: "file",
                content:
                  "Website: https://nikkihnguyen.com/\nTerminal OS: https://nikkihnguyen.com/os/\nEmail: mailto:nikki.nguyen8@gmail.com\nLinkedIn: https://linkedin.com/in/nikkinguyen8/\nGitHub: https://github.com/nikkihnguyen\nTwitter: https://twitter.com/nikkihnguyen\nInstagram: https://instagram.com/nikkihnguyen/",
              },
            },
          },
        },
      },
    },
  };
}

const spinnerNames = Object.keys(spinnerLibrary).filter((name) => {
  const spinner = spinnerLibrary[name];
  return spinner && Array.isArray(spinner.frames) && spinner.frames.length > 0;
});
const thinkingSpinnerName =
  spinnerNames[Math.floor(Math.random() * spinnerNames.length)] || "braille";
const thinkingSpinner =
  spinnerLibrary[thinkingSpinnerName] ||
  spinnerLibrary.braille ||
  spinnerLibrary.helix;
const DEFAULT_COMMAND_DELAY = 900;
const DEFAULT_STEP_DELAY = 85;
const FLOW_COMMAND_DELAY = 650;

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
      return [enterFlow("help-picker")];
    },
  },
  {
    name: "man",
    aliases: [],
    description: "Show command manual.",
    usage: "man <command>",
    handler: (args) => {
      if (!args.length) {
        return [enterFlow("help-picker")];
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
    description: "Inspect the current session.",
    usage: "whoami",
    thinkingLabel: "Profiling session...",
    handler: async () => getSessionSnapshot(),
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
    name: "preview",
    aliases: [],
    description: "Preview a project, bookmark, contact link, or file.",
    usage: "preview <file|url|project|bookmark|contact>",
    runDelay: 150,
    stepDelay: 20,
    thinkingLabel: "Working...",
    handler: (args) => {
      if (!args.length) {
        return [printLine("preview: missing target. Usage: preview <target>", "error")];
      }
      return previewTarget(args.join(" "));
    },
  },
  {
    name: "open",
    aliases: [],
    description: "Open a target directly, or open the last previewed target.",
    usage: "open [file|url|project|bookmark|contact]",
    runDelay: 150,
    stepDelay: 20,
    thinkingLabel: "Working...",
    handler: (args) => {
      if (!args.length) {
        if (!pendingOpenTarget) {
          return [printLine("open: no queued link. Try `preview <target>` first.", "error")];
        }
        const { url } = pendingOpenTarget;
        pendingOpenTarget = null;
        return [openUrl(url)];
      }
      return openTargetDirectly(args.join(" "));
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
    description: "Browse intro sections.",
    usage: "about",
    handler: () => [enterFlow("about-browser")],
  },
  {
    name: "portfolio",
    aliases: [],
    description: "Browse projects by filter.",
    usage: "portfolio [featured|recent|web|ios|all]",
    runDelay: 80,
    stepDelay: 25,
    thinkingLabel: "Working...",
    handler: (args) => {
      if (!args.length) {
        return [enterFlow("portfolio-picker")];
      }
      const filter = args[0].toLowerCase();
      if (!projectFilterOptions.includes(filter)) {
        return buildPortfolioEvents(args[0]);
      }
      return [enterFlow("portfolio-picker", { stepId: "project", answers: { filter } })];
    },
  },
  {
    name: "bookmarks",
    aliases: [],
    description: "Browse saved links by filter.",
    usage: "bookmarks [featured|ai|build|work]",
    runDelay: 80,
    stepDelay: 25,
    thinkingLabel: "Working...",
    handler: (args) => {
      if (!args.length) {
        return [enterFlow("bookmarks-picker")];
      }
      const filter = args[0].toLowerCase();
      if (!bookmarkFilterOptions.includes(filter)) {
        return buildBookmarksEvents(args[0]);
      }
      return [enterFlow("bookmarks-picker", { stepId: "bookmark", answers: { filter } })];
    },
  },
  {
    name: "os",
    aliases: [],
    description: "Browse Nikki's desktop OS project.",
    usage: "os",
    handler: () => [enterFlow("os-browser")],
  },
  {
    name: "contact",
    aliases: [],
    description: "Browse contact links.",
    usage: "contact",
    handler: () => [enterFlow("contact-browser")],
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
        return [enterFlow("theme-picker")];
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

function enterFlow(flowId, initialState = {}) {
  return { type: "enterFlow", flowId, initialState };
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

function wrapArtText(text, width) {
  const paragraphs = String(text || "").split("\n");
  const lines = [];

  paragraphs.forEach((paragraph) => {
    const normalized = paragraph.replace(/\s+/g, " ").trim();
    if (!normalized) {
      lines.push("");
      return;
    }

    const words = normalized.split(" ");
    let current = "";

    words.forEach((word) => {
      if (!current) {
        current = word;
        return;
      }
      const next = `${current} ${word}`;
      if (next.length <= width) {
        current = next;
      } else {
        lines.push(current);
        current = word;
      }
    });

    if (current) {
      lines.push(current);
    }
  });

  return lines.length ? lines : [""];
}

function padArtText(text, width) {
  const value = String(text || "");
  if (value.length >= width) return value.slice(0, width);
  return `${value}${" ".repeat(width - value.length)}`;
}

function formatArtRows(rows = [], width = CLI_BOX_WIDTH) {
  const formatted = [];

  rows.forEach((row) => {
    if (row === null || row === undefined) return;

    if (typeof row === "string") {
      formatted.push(...wrapArtText(row, width));
      return;
    }

    if (row.divider) {
      formatted.push("__DIVIDER__");
      return;
    }

    if (typeof row.raw === "string") {
      row.raw.split("\n").forEach((line) => {
        formatted.push(line);
      });
      return;
    }

    if ("label" in row) {
      const label = `${String(row.label).toUpperCase().padEnd(11)} `;
      const wrapped = wrapArtText(String(row.value || ""), Math.max(10, width - label.length));
      wrapped.forEach((line, index) => {
        formatted.push(`${index === 0 ? label : " ".repeat(label.length)}${line}`);
      });
    }
  });

  return formatted;
}

function createArtBox({ title = "", rows = [], width = CLI_BOX_WIDTH }) {
  const topLabel = title ? ` ${title} ` : "";
  const top =
    topLabel.length && topLabel.length < width
      ? `╭${topLabel}${"─".repeat(width + 2 - topLabel.length)}╮`
      : `╭${"─".repeat(width + 2)}╮`;
  const bottom = `╰${"─".repeat(width + 2)}╯`;
  const lines = [top];

  formatArtRows(rows, width).forEach((row) => {
    if (row === "__DIVIDER__") {
      lines.push(`├${"─".repeat(width + 2)}┤`);
      return;
    }
    lines.push(`│ ${padArtText(row, width)} │`);
  });

  lines.push(bottom);
  return lines.join("\n");
}

function artLine(text, tone = "") {
  return htmlLine(`<pre class="terminal-art">${escapeHTML(text)}</pre>`, tone);
}

function createArtOutputNode(className = "") {
  const line = createOutputLine("success");
  const art = document.createElement("pre");
  art.className = className ? `terminal-art ${className}` : "terminal-art";
  line.appendChild(art);
  return { line, art };
}

function createWelcomeArt() {
  return createArtBox({
    title: "terminalOS",
    rows: [
      {
        raw: [
          " _                          _             _  ___   ____ ",
          "| |_ ___ _ __ _ __ ___  _ __(_)_ __   __ _| |/ _ \\ / ___|",
          "| __/ _ \\ '__| '_ ` _ \\| '__| | '_ \\ / _` | | | | | |    ",
          "| ||  __/ |  | | | | | | |  | | | | | (_| | | |_| | |___ ",
          " \\__\\___|_|  |_| |_| |_|_|  |_|_| |_|\\__,_|_|\\___/ \\____|",
        ].join("\n"),
      },
      { divider: true },
      "Nikki Nguyen's terminal portfolio.",
      "Product, experiments, links, and a few playful tools.",
      { divider: true },
      { label: "surfaces", value: "about · portfolio · bookmarks · contact · os · whoami" },
      { label: "hint", value: "Use arrows in menus. Tab completes. preview <target> shows detail." },
    ],
  });
}

function formatCollectionLine(index, total, slug, label, summary) {
  const branch = index === total - 1 ? "└─" : "├─";
  return `${branch} ${String(slug).padEnd(18)} ${label} — ${summary}`;
}

function buildAboutEvents() {
  return [
    artLine(
      createArtBox({
        title: "ABOUT",
        rows: [
          "Nikki Nguyen is a product manager based in NYC.",
          "Currently at EliseAI. Previously at Spline, Clearing Health, Better.com, Dropbox, and Atlassian.",
          { divider: true },
          { label: "focus", value: "product, storytelling, creative tech, small AI-powered experiments" },
        ],
      }),
      "success"
    ),
  ];
}

function buildAboutSectionEvents(section) {
  switch (section) {
    case "current":
      return [
        artLine(
          createArtBox({
            title: "ABOUT / CURRENT",
            rows: [
              { label: "role", value: "Product Manager at EliseAI" },
              { label: "base", value: "New York City" },
              { label: "before", value: "Spline, Clearing Health, Better.com, Dropbox, Atlassian" },
            ],
          }),
          "success"
        ),
      ];
    case "interests":
      return [
        artLine(
          createArtBox({
            title: "ABOUT / INTERESTS",
            rows: [
              "• product systems",
              "• storytelling through interfaces",
              "• creative technology",
              "• small AI-powered experiments",
            ],
          }),
          "success"
        ),
      ];
    case "bio":
    default:
      return [
        artLine(
          createArtBox({
            title: "ABOUT / BIO",
            rows: [
              "Nikki Nguyen is a product manager based in NYC.",
              "She works across product, creative tooling, and fast interactive experiments.",
            ],
          }),
          "success"
        ),
      ];
  }
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
  return bookmarksData.find(
    (item) =>
      item.slug.toLowerCase() === normalized ||
      item.name.toLowerCase() === normalized
  );
}

function findContactLink(target) {
  const normalized = target.toLowerCase();
  return contactLinks.find(
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

function getProjectList(filter = "featured") {
  const normalized = (filter || "featured").toLowerCase();
  if (normalized === "all") return projectData;
  if (normalized === "recent") {
    return [...projectData]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  }
  if (normalized === "web" || normalized === "ios") {
    return projectData.filter((item) => item.platform === normalized);
  }
  if (normalized === "featured") {
    return featuredProjectSlugs
      .map((slug) => projectData.find((item) => item.slug === slug))
      .filter(Boolean);
  }
  return null;
}

function getBookmarkList(filter = "featured") {
  const normalized = (filter || "featured").toLowerCase();
  if (normalized === "featured") {
    return featuredBookmarkSlugs
      .map((slug) => bookmarksData.find((item) => item.slug === slug))
      .filter(Boolean);
  }
  if (bookmarkFilterOptions.includes(normalized)) {
    return bookmarksData.filter((item) => item.category === normalized);
  }
  return null;
}

function formatProjectLine(project) {
  return `${project.name} (${project.slug}): ${project.summary}`;
}

function formatBookmarkLine(bookmark) {
  return `${bookmark.name} (${bookmark.slug}): ${bookmark.description}`;
}

function buildPortfolioEvents(filter = "featured", options = {}) {
  const normalized = (filter || "featured").toLowerCase();
  const projects = getProjectList(normalized);
  if (!projects) {
    return [printLine(`Unknown portfolio filter: ${filter}. Try: ${projectFilterOptions.join(", ")}`, "error")];
  }
  const limit = options.limit || projects.length;
  const slicedProjects = projects.slice(0, limit);
  const events = [
    artLine(
      createArtBox({
        title: `PROJECTS / ${normalized.toUpperCase()}`,
        rows: [
          { label: "items", value: String(slicedProjects.length) },
          { label: "hint", value: "preview <slug> for details, open <slug> to launch" },
        ],
      }),
      "success"
    ),
  ];
  slicedProjects.forEach((project, index) =>
    events.push(printLine(formatCollectionLine(index, slicedProjects.length, project.slug, project.name, project.summary)))
  );
  return events;
}

function buildBookmarksEvents(filter = "featured", options = {}) {
  const normalized = (filter || "featured").toLowerCase();
  const bookmarks = getBookmarkList(normalized);
  if (!bookmarks) {
    return [printLine(`Unknown bookmarks filter: ${filter}. Try: ${bookmarkFilterOptions.join(", ")}`, "error")];
  }
  const limit = options.limit || bookmarks.length;
  const slicedBookmarks = bookmarks.slice(0, limit);
  const events = [
    artLine(
      createArtBox({
        title: `BOOKMARKS / ${normalized.toUpperCase()}`,
        rows: [
          { label: "items", value: String(slicedBookmarks.length) },
          { label: "hint", value: "preview <slug> for details, open <slug> to launch" },
        ],
      }),
      "success"
    ),
  ];
  slicedBookmarks.forEach((bookmark, index) =>
    events.push(printLine(formatCollectionLine(index, slicedBookmarks.length, bookmark.slug, bookmark.name, bookmark.description)))
  );
  return events;
}

function buildContactEvents() {
  return contactLinks.map((item) => linkLine(item.name, item.url));
}

function queueOpenTarget(label, url, events = []) {
  pendingOpenTarget = { label, url };
  return [...events];
}

function describeBookmark(bookmark) {
  return queueOpenTarget(bookmark.name, bookmark.url, [
    artLine(
      createArtBox({
        title: `BOOKMARK / ${bookmark.name.toUpperCase()}`,
        rows: [
          bookmark.description,
          { divider: true },
          { label: "slug", value: bookmark.slug },
          { label: "open", value: bookmark.url },
        ],
      }),
      "success"
    ),
  ]);
}

function describeContactLink(contactLink) {
  return queueOpenTarget(contactLink.name, contactLink.url, [
    artLine(
      createArtBox({
        title: `CONTACT / ${contactLink.name.toUpperCase()}`,
        rows: [
          contactLink.description,
          { divider: true },
          { label: "slug", value: contactLink.slug },
          { label: "open", value: contactLink.url },
        ],
      }),
      "success"
    ),
  ]);
}

function describeProject(project) {
  const events = [
    artLine(
      createArtBox({
        title: `PROJECT / ${project.name.toUpperCase()}`,
        rows: [
          project.summary,
          { divider: true },
          { label: "slug", value: project.slug },
          { label: "date", value: project.date },
          { label: "platform", value: project.platform },
          { label: "stack", value: project.tech },
          { label: "intent", value: project.intent },
          { label: "build", value: project.build },
          { label: "highlight", value: project.unique },
        ],
      }),
      "success"
    ),
  ];

  if (project.url) {
    return queueOpenTarget(project.name, project.url, [
      ...events,
      artLine(
        createArtBox({
          title: "ACTION",
          rows: [
            { label: "open", value: project.url },
            { label: "next", value: "Type open to launch the queued target." },
          ],
        }),
        "success"
      ),
    ]);
  }

  pendingOpenTarget = null;
  events.push(
    artLine(
      createArtBox({
        title: "ACTION",
        rows: ["No public link yet."],
      }),
      "success"
    )
  );
  return events;
}

function previewTarget(target) {
  const url = normalizeUrl(target);
  if (url) {
    return queueOpenTarget(`URL: ${url}`, url, [printLine(`URL: ${url}`)]);
  }

  const contact = findContactLink(target);
  if (contact) return describeContactLink(contact);

  const app = findApp(target);
  if (app) return describeBookmark(app);

  const project = findProject(target);
  if (project) return describeProject(project);

  const resolved = resolvePath(target);
  const node = getNode(resolved);
  if (node && node.type === "file") {
    if (node.openUrl) {
      return queueOpenTarget(target, node.openUrl, [
        printLine(`File: ${target}`, "success"),
        printLine(`Open: ${node.openUrl}`),
      ]);
    }
    if (isOpenableFile(target)) {
      return queueOpenTarget(target, target, [
        printLine(`File: ${target}`, "success"),
        printLine(`Open: ${target}`),
      ]);
    }
    return [printLine(`preview: ${target}: not a supported file type`, "error")];
  }

  return [printLine(`preview: ${target}: no matching project, bookmark, contact, or file`, "error")];
}

function openTargetDirectly(target) {
  const url = normalizeUrl(target);
  if (url) {
    pendingOpenTarget = null;
    return [openUrl(url)];
  }

  const contact = findContactLink(target);
  if (contact) {
    pendingOpenTarget = null;
    return [openUrl(contact.url)];
  }

  const app = findApp(target);
  if (app) {
    pendingOpenTarget = null;
    return [openUrl(app.url)];
  }

  const project = findProject(target);
  if (project) {
    if (project.url) {
      pendingOpenTarget = null;
      return [openUrl(project.url)];
    }
    return [printLine(`open: ${target}: no public link yet. Try \`preview ${project.slug}\` for details.`, "error")];
  }

  const resolved = resolvePath(target);
  const node = getNode(resolved);
  if (node && node.type === "file") {
    if (node.openUrl) {
      pendingOpenTarget = null;
      return [openUrl(node.openUrl)];
    }
    if (isOpenableFile(target)) {
      pendingOpenTarget = null;
      return [openUrl(target)];
    }
    return [printLine(`open: ${target}: not a supported file type`, "error")];
  }

  return [printLine(`open: ${target}: no matching project, bookmark, contact, or file`, "error")];
}

function buildCommandHelp(commandName) {
  const entry = commandRegistry.get(commandName);
  if (!entry) {
    return [printLine(`help: no help topics match '${commandName}'`, "error")];
  }
  const aliases = entry.aliases.length ? entry.aliases.join(", ") : "none";
  const examples = {
    portfolio: "Examples: `portfolio featured`, `portfolio web`, `preview computervision`",
    bookmarks: "Examples: `bookmarks ai`, `bookmarks work`, `preview cursor`",
    preview: "Examples: `preview computervision`, `preview github`, `preview about.txt`",
    open: "Examples: `open github`, `open computervision`, `open` after a preview",
    contact: "Examples: `contact`, `preview github`, `open linkedin`",
  };
  return [
    artLine(
      createArtBox({
        title: `HELP / ${entry.name.toUpperCase()}`,
        rows: [
          entry.description,
          { divider: true },
          { label: "usage", value: entry.usage },
          { label: "aliases", value: aliases },
          ...(examples[entry.name] ? [{ label: "example", value: examples[entry.name].replace(/^Examples:\s*/i, "") }] : []),
          { label: "input", value: "Tab completes arguments too." },
        ],
      }),
      "success"
    ),
  ];
}

function isPromiseLike(value) {
  return !!value && typeof value.then === "function";
}

function levenshteinDistance(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) dp[i][0] = i;
  for (let j = 0; j < cols; j += 1) dp[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[a.length][b.length];
}

function getCommandSuggestions(input) {
  const normalized = input.toLowerCase();
  return getUniqueCommandNames()
    .map((name) => ({
      name,
      distance: levenshteinDistance(normalized, name),
      startsWith: name.startsWith(normalized) || normalized.startsWith(name),
      includes: name.includes(normalized) || normalized.includes(name),
    }))
    .filter((item) => item.distance <= 3 || item.startsWith || item.includes)
    .sort((a, b) => {
      if (a.startsWith !== b.startsWith) return a.startsWith ? -1 : 1;
      if (a.includes !== b.includes) return a.includes ? -1 : 1;
      if (a.distance !== b.distance) return a.distance - b.distance;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 3)
    .map((item) => item.name);
}

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  if (minutes < 60) return `${minutes}m ${seconds}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

function getApproxLocationLabel(locationData) {
  if (!locationData) return "Unavailable";
  const parts = [
    locationData.city,
    locationData.region,
    locationData.country_name || locationData.country,
  ]
    .filter(Boolean);
  return parts.length ? parts.join(", ") : "Unavailable";
}

async function fetchJsonWithTimeout(url) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), GEO_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: "GET",
      mode: "cors",
      cache: "no-store",
      credentials: "omit",
      referrerPolicy: "no-referrer",
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`request failed: ${response.status}`);
    }
    return await response.json();
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function getGeoProfile() {
  if (!geoProfilePromise) {
    geoProfilePromise = (async () => {
      const emptyProfile = {
        ip: "Unavailable",
        location: "Unavailable",
        network: "Unavailable",
        postal: "Unavailable",
        timezone: "Unavailable",
      };

      try {
        const primary = await fetchJsonWithTimeout("https://ipwho.is/");
        if (primary?.success !== false) {
          return {
            ip: primary.ip || "Unavailable",
            location: getApproxLocationLabel(primary),
            network: primary.connection?.org || primary.connection?.isp || "Unavailable",
            postal: primary.postal || "Unavailable",
            timezone: primary.timezone?.id || "Unavailable",
          };
        }
      } catch (error) {
        // Fall through to the next provider.
      }

      try {
        const secondary = await fetchJsonWithTimeout("https://ipapi.co/json/");
        return {
          ip: secondary.ip || "Unavailable",
          location: getApproxLocationLabel(secondary),
          network: secondary.org || secondary.asn || "Unavailable",
          postal: secondary.postal || "Unavailable",
          timezone: secondary.timezone || "Unavailable",
        };
      } catch (error) {
        // Fall through to the last provider.
      }

      try {
        const tertiary = await fetchJsonWithTimeout("https://api.ipify.org?format=json");
        return {
          ...emptyProfile,
          ip: tertiary.ip || "Unavailable",
        };
      } catch (error) {
        return emptyProfile;
      }
    })();
  }

  const profile = await geoProfilePromise;
  if (profile.ip === "Unavailable" && profile.location === "Unavailable") {
    geoProfilePromise = null;
  }
  return profile;
}

async function getSessionSnapshot() {
  const geo = await getGeoProfile();
  const sessionUptime = Date.now() - sessionStats.startedAt;
  const nav = window.navigator;
  const userAgent =
    nav.userAgentData?.brands
      ?.map((brand) => `${brand.brand} ${brand.version}`)
      .join(", ") || nav.userAgent;
  const languages = Array.isArray(nav.languages) && nav.languages.length
    ? nav.languages.join(", ")
    : nav.language || "Unavailable";
  const localTime = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "medium",
  });
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Unavailable";

  return [
    artLine(
      createArtBox({
        title: "SESSION",
        rows: [
          { label: "user", value: shellState.user },
          { label: "host", value: shellState.host },
          { label: "local time", value: localTime },
          { label: "timezone", value: timezone },
          { label: "spinner", value: thinkingSpinnerName },
          { label: "commands", value: String(sessionStats.commandsExecuted) },
          { label: "uptime", value: formatDuration(sessionUptime) },
          { label: "cwd", value: shellState.cwd },
        ],
      }),
      "success"
    ),
    artLine(
      createArtBox({
        title: "NETWORK",
        rows: [
          { label: "public ip", value: geo.ip },
          { label: "location", value: geo.location },
          { label: "network", value: geo.network },
          { label: "online", value: nav.onLine ? "yes" : "no" },
          { label: "cookies", value: nav.cookieEnabled ? "enabled" : "disabled" },
          { label: "language", value: languages },
        ],
      }),
      "success"
    ),
    artLine(
      createArtBox({
        title: "DEVICE",
        rows: [
          { label: "browser", value: userAgent },
          { label: "platform", value: nav.userAgentData?.platform || nav.platform || "Unavailable" },
          { label: "screen", value: `${window.screen.width}x${window.screen.height} @ ${window.devicePixelRatio || 1}x` },
          { label: "viewport", value: `${window.innerWidth}x${window.innerHeight}` },
          { label: "cpu", value: `${nav.hardwareConcurrency || "Unavailable"} threads` },
          { label: "memory", value: nav.deviceMemory ? `${nav.deviceMemory} GB` : "Unavailable" },
          { label: "touch", value: String(nav.maxTouchPoints || 0) },
          {
            label: "appearance",
            value: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
          },
        ],
      }),
      "success"
    ),
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

function createOutputLine(tone = "") {
  const line = document.createElement("div");
  line.className = "output-line";
  if (tone) line.classList.add(tone);
  return line;
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

function pruneOutputNodes() {
  while (outputEl.childElementCount > MAX_OUTPUT_NODES) {
    const first = outputEl.firstElementChild;
    if (!first) break;

    const next = first.nextElementSibling;
    if (activeOutputCapture) {
      if (activeOutputCapture.start === first) {
        activeOutputCapture.start = next;
      }
      if (activeOutputCapture.end === first) {
        activeOutputCapture.end = next;
      }
    }

    first.remove();
  }
}

function beginOutputCapture() {
  activeOutputCapture = {
    start: null,
    end: null,
  };
}

function captureOutputNode(node) {
  if (!activeOutputCapture || !node || node.parentElement !== outputEl) return;
  if (node.classList?.contains("output-line--spinner")) return;
  if (!activeOutputCapture.start) {
    activeOutputCapture.start = node;
  }
  activeOutputCapture.end = node;
}

function revealOutputRange(startNode, endNode = startNode) {
  if (!startNode || !endNode) return;
  if (startNode.parentElement !== outputEl || endNode.parentElement !== outputEl) return;

  const padding = 12;
  const top = Math.max(0, startNode.offsetTop - padding);
  const bottom = endNode.offsetTop + endNode.offsetHeight + padding;
  const viewportHeight = outputEl.clientHeight;
  const maxScrollTop = Math.max(0, outputEl.scrollHeight - viewportHeight);
  let nextScrollTop = top;

  if (bottom - top <= viewportHeight) {
    nextScrollTop = Math.max(0, Math.min(top, bottom - viewportHeight));
  }

  outputEl.scrollTop = Math.min(nextScrollTop, maxScrollTop);
  isUserAtBottom = isScrolledToBottom();
  updateJumpButton();
}

function finishOutputCapture() {
  if (!activeOutputCapture) return;
  const { start, end } = activeOutputCapture;
  activeOutputCapture = null;
  revealOutputRange(start, end);
}

function addOutputNode(node) {
  const wasAtBottom = isScrolledToBottom();
  outputEl.appendChild(node);
  captureOutputNode(node);
  pruneOutputNodes();
  if (wasAtBottom) {
    scrollToBottom();
  } else {
    isUserAtBottom = false;
    updateJumpButton();
  }
}

function getFlowStepPrompt(step, answers = {}) {
  if (!step) return "";
  return typeof step.prompt === "function" ? step.prompt(answers) : step.prompt || "";
}

function getFlowStepChoices(step, answers = {}) {
  if (!step) return [];
  const choices = typeof step.choices === "function" ? step.choices(answers) : step.choices;
  return Array.isArray(choices) ? choices : [];
}

function renderFlowStepContent(node, step, answers = {}, selectedIndex = 0) {
  node.innerHTML = "";
  if (node === flowEl) {
    node.className = "terminal__flow flow-step";
  } else {
    node.className = "flow-step";
  }
  const prompt = document.createElement("div");
  prompt.className = "flow-step__prompt";
  prompt.textContent = getFlowStepPrompt(step, answers);
  node.appendChild(prompt);

  const choices = getFlowStepChoices(step, answers);
  if (step.type === "choice" && choices.length) {
    choices.forEach((choice, index) => {
      const isSelected = index === selectedIndex;
      const choiceNode = document.createElement("div");
      choiceNode.className = isSelected ? "flow-step__choice is-selected" : "flow-step__choice";
      choiceNode.dataset.choiceIndex = String(index);

      const marker = document.createElement("span");
      marker.className = "flow-step__marker";
      marker.textContent = isSelected ? "→" : "·";

      const label = document.createElement("span");
      label.className = "flow-step__label";
      label.textContent = choice.label;

      choiceNode.appendChild(marker);
      choiceNode.appendChild(label);
      node.appendChild(choiceNode);
    });
  }
}

function renderFlowStepNode(step) {
  if (!flowEl) return;
  flowEl.hidden = false;
  renderFlowStepContent(flowEl, step, flowState?.answers || {}, flowState?.selectedChoiceIndex || 0);
  activeFlowStepNode = flowEl;
}

function updateFlowStepNode() {
  if (!activeFlowStepNode || !currentFlow || !flowState) return;
  const step = currentFlow.steps[flowState.stepId];
  if (!step) return;
  const choices = getFlowStepChoices(step, flowState.answers);
  const renderedChoices = activeFlowStepNode.querySelectorAll(".flow-step__choice");

  if (
    step.type !== "choice" ||
    !choices.length ||
    renderedChoices.length !== choices.length
  ) {
    renderFlowStepContent(
      activeFlowStepNode,
      step,
      flowState.answers,
      flowState.selectedChoiceIndex || 0
    );
    return;
  }

  const promptNode = activeFlowStepNode.querySelector(".flow-step__prompt");
  if (promptNode) {
    promptNode.textContent = getFlowStepPrompt(step, flowState.answers);
  }

  renderedChoices.forEach((choiceNode, index) => {
    const isSelected = index === (flowState.selectedChoiceIndex || 0);
    choiceNode.classList.toggle("is-selected", isSelected);

    const markerNode = choiceNode.querySelector(".flow-step__marker");
    if (markerNode) {
      markerNode.textContent = isSelected ? "→" : "·";
    }

    const labelNode = choiceNode.querySelector(".flow-step__label");
    if (labelNode) {
      labelNode.textContent = choices[index]?.label || "";
    }
  });
}

function moveFlowSelection(delta) {
  if (mode !== "flow" || !currentFlow || !flowState) return false;
  const step = currentFlow.steps[flowState.stepId];
  const choices = getFlowStepChoices(step, flowState.answers);
  if (!step || step.type !== "choice" || !choices.length) return false;
  const count = choices.length;
  const currentIndex = typeof flowState.selectedChoiceIndex === "number" ? flowState.selectedChoiceIndex : 0;
  flowState.selectedChoiceIndex = (currentIndex + delta + count) % count;
  inputEl.value = choices[flowState.selectedChoiceIndex]?.value || "";
  updateFlowStepNode();
  updateCaret();
  updateInputAssist();
  return true;
}

function getSelectedFlowChoiceValue() {
  if (mode !== "flow" || !currentFlow || !flowState) return "";
  const step = currentFlow.steps[flowState.stepId];
  const choices = getFlowStepChoices(step, flowState.answers);
  if (!step || step.type !== "choice" || !choices.length) return "";
  return choices[flowState.selectedChoiceIndex || 0]?.value || "";
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

function getCursorOffset() {
  if (!measureEl) return 0;
  const caretIndex =
    typeof inputEl.selectionStart === "number"
      ? inputEl.selectionStart
      : inputEl.value.length;
  measureEl.textContent = inputEl.value.slice(0, caretIndex) || "";
  const width = measureEl.getBoundingClientRect().width;
  return Math.max(0, width - inputEl.scrollLeft);
}

function setInputValue(value) {
  inputEl.value = value;
  tabState = { value: "", timestamp: 0 };
  const end = value.length;
  inputEl.setSelectionRange(end, end);
  updateCaret();
  updateInputAssist();
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

function getDirectoryCompletionEntries(path) {
  const node = getNode(path);
  if (!node || node.type !== "dir" || !node.entries) return [];
  return Object.keys(node.entries)
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({
      name,
      node: node.entries[name],
    }));
}

function pushHistoryEntry(history, value) {
  history.push(value);
  if (history.length > settings.maxHistory) {
    history.splice(0, history.length - settings.maxHistory);
  }
  return history.length;
}

function getUniqueCommandNames() {
  return [...new Set(baseCommands.map((command) => command.name))].sort();
}

function getPathCompletionCandidates(token, directoriesOnly = false) {
  const rawToken = token || "";
  const slashIndex = rawToken.lastIndexOf("/");
  const dirToken = slashIndex >= 0 ? rawToken.slice(0, slashIndex + 1) : "";
  const baseToken = slashIndex >= 0 ? rawToken.slice(slashIndex + 1) : rawToken;
  const dirPath = dirToken
    ? resolvePath(dirToken.endsWith("/") ? dirToken.slice(0, -1) : dirToken)
    : shellState.cwd;

  return getDirectoryCompletionEntries(dirPath)
    .filter(({ name, node }) => {
      if (directoriesOnly && node.type !== "dir") return false;
      return name.toLowerCase().startsWith(baseToken.toLowerCase());
    })
    .map(({ name, node }) => `${dirToken}${name}${node.type === "dir" ? "/" : ""}`);
}

function getCompletionCandidates(command, args, currentToken) {
  if (!command) {
    return getUniqueCommandNames();
  }

  switch (command) {
    case "preview":
    case "open":
      if (args.length > 1) return [];
      return [
        ...projectData.map((item) => item.slug),
        ...bookmarksData.map((item) => item.slug),
        ...contactLinks.map((item) => item.slug),
        "about.txt",
        "portfolio.txt",
        "bookmarks.txt",
        "links.txt",
      ];
    case "cat":
      if (args.length > 1) return [];
      return ["about.txt", "portfolio.txt", "bookmarks.txt", "links.txt", "welcome.txt"];
    case "cd":
      if (args.length > 1) return [];
      return getPathCompletionCandidates(currentToken, true);
    case "ls":
      if (args.length > 1) return [];
      return getPathCompletionCandidates(currentToken, false);
    case "theme":
      if (args.length > 1) return [];
      return themeOptions;
    case "portfolio":
      if (args.length > 1) return [];
      return projectFilterOptions;
    case "bookmarks":
      if (args.length > 1) return [];
      return bookmarkFilterOptions;
    case "help":
    case "man":
      if (args.length > 1) return [];
      return getUniqueCommandNames();
    default:
      return [];
  }
}

function getCompletionHint(command) {
  switch (command) {
    case "preview":
    case "open":
      return "project, bookmark, contact, file, or url";
    case "portfolio":
      return "portfolio filter";
    case "bookmarks":
      return "bookmarks filter";
    case "cat":
      return "file name";
    case "cd":
    case "ls":
      return "path";
    case "theme":
      return "theme";
    case "help":
    case "man":
      return "command";
    default:
      return "target";
  }
}

function findFlowChoiceMatchIndex(rawValue) {
  if (mode !== "flow" || !currentFlow || !flowState) return -1;
  const step = currentFlow.steps[flowState.stepId];
  const choices = getFlowStepChoices(step, flowState.answers);
  const normalized = (rawValue || "").trim().toLowerCase();
  if (!normalized) return -1;
  return choices.findIndex((choice) => {
    const value = String(choice.value || "").toLowerCase();
    const label = String(choice.label || "").replace(/^↩\s*/u, "").toLowerCase();
    return value.startsWith(normalized) || label.startsWith(normalized);
  });
}

function getFlowCompletionState(rawValue) {
  const step = currentFlow?.steps?.[flowState?.stepId];
  const choices = getFlowStepChoices(step, flowState?.answers || {});
  const selectedValue =
    choices[typeof flowState?.selectedChoiceIndex === "number" ? flowState.selectedChoiceIndex : 0]?.value || "";
  if (!step || step.type !== "choice" || !choices.length) {
    return {
      matches: [],
      listMatches: [],
      bestMatch: "",
      completedValue: "",
      helperText: "Flow mode: answer the current prompt, or type exit to leave.",
    };
  }

  const normalized = (rawValue || "").trim().toLowerCase();
  if (!normalized) {
    return {
      matches: [],
      listMatches: choices.map((choice) => String(choice.value)),
      bestMatch: "",
      completedValue: "",
      helperText: selectedValue ? `Selected: ${selectedValue}  ·  Arrow keys move  ·  Tab cycles.` : "Arrow keys move. Tab cycles.",
    };
  }

  const choiceMatches = choices.filter((choice) => {
    const value = String(choice.value || "").toLowerCase();
    const label = String(choice.label || "").replace(/^↩\s*/u, "").toLowerCase();
    return value.startsWith(normalized) || label.startsWith(normalized);
  });
  const bestChoice = choiceMatches[0] || null;
  const bestMatch = bestChoice ? String(bestChoice.value) : "";
  let helperText = "No matches.";
  if (choiceMatches.length === 1) {
    helperText = `Tab completes to ${bestMatch}`;
  } else if (choiceMatches.length > 1) {
    helperText = `Tab completes to ${bestMatch}. ${choiceMatches.length} matches.`;
  }

  return {
    matches: choiceMatches.map((choice) => String(choice.value)),
    listMatches: choiceMatches.map((choice) => String(choice.value)),
    bestMatch,
    completedValue: bestMatch,
    helperText,
  };
}

function getCompletionState(rawValue) {
  if (mode === "flow") {
    return getFlowCompletionState(rawValue);
  }

  if (mode !== "shell") {
    return {
      matches: [],
      bestMatch: "",
      completedValue: "",
      helperText: mode === "ai"
        ? "AI mode: ask a question, or type exit to return."
        : "Flow mode: answer the current prompt, or type exit to leave.",
    };
  }

  const value = rawValue || "";
  const endsWithSpace = /\s$/.test(value);
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      matches: [],
      bestMatch: "",
      completedValue: "",
      helperText: pendingOpenTarget
        ? "Queued target ready. Type open."
        : "Try about, portfolio, bookmarks, contact, or whoami.",
    };
  }

  const parts = value.split(/\s+/).filter(Boolean);
  const command = parts[0]?.toLowerCase() || "";
  const args = parts.slice(1);
  const currentToken = endsWithSpace ? "" : parts[parts.length - 1] || "";
  const tokenPrefix =
    value.lastIndexOf(" ") >= 0 ? value.slice(0, value.lastIndexOf(" ") + 1) : "";
  const isCommandPosition = parts.length <= 1 && !value.includes(" ");

  const candidates =
    isCommandPosition
      ? getUniqueCommandNames()
      : getCompletionCandidates(command, args, currentToken);

  const listMatches = currentToken
    ? candidates.filter((candidate) =>
        candidate.toLowerCase().startsWith(currentToken.toLowerCase())
      )
    : candidates;
  const matches = currentToken
    ? candidates.filter((candidate) =>
        candidate.toLowerCase().startsWith(currentToken.toLowerCase())
      )
    : [];
  const bestMatch = matches[0] || "";

  let completedValue = "";
  if (bestMatch) {
    if (isCommandPosition) {
      completedValue = `${bestMatch} `;
    } else {
      completedValue = `${tokenPrefix}${bestMatch}`;
      if (matches.length === 1 && bestMatch === currentToken) {
        completedValue = `${tokenPrefix}${bestMatch} `;
      }
    }
  }

  let helperText = "Tab to complete.";
  if (!isCommandPosition && !currentToken) {
    helperText = `${getCompletionHint(command)}. Tab twice lists.`;
  } else if (matches.length === 1) {
    helperText = `Tab completes to ${bestMatch}`;
  } else if (matches.length > 1) {
    helperText = `Tab completes to ${bestMatch}. ${matches.length} matches.`;
  } else {
    helperText = "No autocomplete matches.";
  }

  return { matches, listMatches, bestMatch, completedValue, helperText };
}

function updateInputAssist() {
  if (!helperEl || !ghostEl) return;

  const { completedValue, helperText } = getCompletionState(inputEl.value);
  helperEl.textContent = helperText;

  const selectionAtEnd =
    typeof inputEl.selectionStart === "number" &&
    typeof inputEl.selectionEnd === "number" &&
    inputEl.selectionStart === inputEl.selectionEnd &&
    inputEl.selectionEnd === inputEl.value.length;
  const suffix =
    completedValue && completedValue.startsWith(inputEl.value)
      ? completedValue.slice(inputEl.value.length)
      : "";

  const shouldShowGhost =
    (mode === "shell" || mode === "flow") &&
    !!inputEl.value &&
    !!suffix &&
    selectionAtEnd &&
    document.activeElement === inputEl;

  if (!shouldShowGhost) {
    ghostEl.textContent = "";
    ghostEl.style.transform = "translateX(0)";
    return;
  }

  ghostEl.textContent = suffix;
  ghostEl.style.transform = `translateX(${getCursorOffset()}px)`;
}

function setRunning(next) {
  isRunning = next;
  inputEl.disabled = next;
  if (!next) {
    focusInput();
  }
  updateInputAssist();
}

function focusInput() {
  inputEl.focus({ preventScroll: true });
  updateCaret();
  updateInputAssist();
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
  const takesOver = queuedEvents.some(
    (event) => event?.type === "clear" || event?.type === "reset"
  );
  const initialDelay =
    typeof options.initialDelay === "number" ? options.initialDelay : 0;
  const stepDelay =
    typeof options.stepDelay === "number" ? options.stepDelay : DEFAULT_STEP_DELAY;
  const thinkingLabel = options.thinkingLabel || "Thinking...";
  const showThinking = options.showThinking !== false;
  setRunning(true);
  if (showThinking) {
    startThinkingIndicator(thinkingLabel);
  }
  let totalDelay = initialDelay;
  queuedEvents.forEach((event, index) => {
    scheduleEvent(() => {
      renderEvent(event);
    }, totalDelay);
    totalDelay += stepDelay;
  });
  if (!takesOver) {
    scheduleEvent(() => {
      if (showThinking) {
        stopThinkingIndicator();
      }
      setRunning(false);
      finishOutputCapture();
      saveOutput();
    }, totalDelay);
  }
}

async function queueAsyncEvents(eventsPromise, options = {}) {
  const token = ++activeAsyncCommandToken;
  const thinkingLabel = options.thinkingLabel || "Thinking...";
  const stepDelay =
    typeof options.stepDelay === "number" ? options.stepDelay : DEFAULT_STEP_DELAY;

  setRunning(true);
  startThinkingIndicator(thinkingLabel);

  try {
    const events = await eventsPromise;
    if (token !== activeAsyncCommandToken) return;
    stopThinkingIndicator();
    queueEvents(events, {
      initialDelay: 0,
      stepDelay,
      showThinking: false,
    });
  } catch (error) {
    if (token !== activeAsyncCommandToken) return;
    stopThinkingIndicator();
    queueEvents(
      [printLine("whoami: unable to inspect this session right now", "error")],
      {
        initialDelay: 0,
        stepDelay: 0,
        showThinking: false,
      }
    );
  }
}

function interruptRunning() {
  if (!isRunning) return false;
  activeAsyncCommandToken += 1;
  clearPendingTimers();
  setRunning(false);
  return true;
}

function queueFlowSubmission(value) {
  setRunning(true);
  startThinkingIndicator("Working...");
  scheduleEvent(() => {
    stopThinkingIndicator();
    handleFlowInput(value);
  }, FLOW_COMMAND_DELAY);
  scheduleEvent(() => {
    setRunning(false);
    if (mode === "flow") {
      focusInput();
    }
    finishOutputCapture();
    saveOutput();
  }, FLOW_COMMAND_DELAY);
}

function runCommand(input) {
  const trimmed = input.trim();
  if (!trimmed) return;
  if (isRunning) return;

  beginOutputCapture();
  appendCommandEcho(trimmed);
  recordCommand(trimmed);

  const { command, args } = parseInput(trimmed);
  const entry = commandRegistry.get(command);
  if (!entry) {
    const suggestions = getCommandSuggestions(command);
    const events = [printLine(`zsh: command not found: ${command}`, "error")];
    if (suggestions.length > 0) {
      events.push(printLine(`Did you mean: ${suggestions.join(", ")}?`, "success"));
    } else {
      events.push(printLine("Try: help", "success"));
    }
    queueEvents(events, {
      initialDelay: DEFAULT_COMMAND_DELAY,
      stepDelay: 0,
      thinkingLabel: "Thinking...",
    });
    return;
  }

  const result = entry.handler(args);
  if (isPromiseLike(result)) {
    queueAsyncEvents(result, {
      thinkingLabel: entry.thinkingLabel,
      stepDelay: entry.stepDelay || DEFAULT_STEP_DELAY,
    });
    return;
  }

  const events = result || [];
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
      softRebootTerminal();
      break;
    case "reset":
      softRebootTerminal();
      break;
    case "openUrl":
      window.open(event.url, "_blank", "noopener,noreferrer");
      appendLine(`Opening ${event.url}...`, "success");
      break;
    case "enterFlow":
      startFlow(event.flowId, event.initialState || {});
      break;
    case "enterAIMode":
      startAIMode();
      break;
    default:
      appendLine("Unknown event.", "error");
  }
}

function startFlow(flowId, initialState = {}) {
  const flow = flows[flowId];
  if (!flow) {
    appendLine(`Flow not found: ${flowId}`, "error");
    return;
  }
  mode = "flow";
  currentFlow = flow;
  flowState = {
    id: flowId,
    stepId: initialState.stepId || flow.startStepId,
    answers: initialState.answers || {},
    stack: initialState.stack || [],
    selectedChoiceIndex: 0,
  };
  updatePrompt();
  appendLine(`Entering flow: ${flow.name}`, "success");
  printFlowStep();
  focusInput();
}

function printFlowStep() {
  if (!currentFlow || !flowState) return;
  const step = currentFlow.steps[flowState.stepId];
  if (!step) {
    appendLine("Flow step missing.", "error");
    exitFlow();
    return;
  }
  const flowIdBeforeEvents = currentFlow.id;
  const stepEvents =
    typeof step.events === "function" ? step.events(flowState.answers) : step.events;
  if (Array.isArray(stepEvents)) {
    stepEvents.forEach((event) => renderEvent(event));
  }
  if (!currentFlow || currentFlow.id !== flowIdBeforeEvents) {
    return;
  }
  if (step.autoExit) {
    exitFlow();
    return;
  }
  flowState.selectedChoiceIndex = 0;
  if (step.type === "choice") {
    const choices = getFlowStepChoices(step, flowState.answers);
    inputEl.value = choices[0]?.value || "";
  } else {
    inputEl.value = "";
  }
  renderFlowStepNode(step);
  if (step.links && Array.isArray(step.links)) {
    step.links.forEach((item) => {
      appendLink(item.text, item.url);
    });
  }
  if (mode === "flow") {
    focusInput();
  }
}

function handleFlowInput(input) {
  const currentStep = currentFlow?.steps?.[flowState?.stepId];
  let trimmed = input.trim();
  if (!trimmed && currentStep?.type === "choice") {
    trimmed = getSelectedFlowChoiceValue();
  }
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
    flowState.selectedChoiceIndex = 0;
    inputEl.value = "";
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
  const choices = getFlowStepChoices(step, flowState.answers);
  if (step.type === "choice" && choices.length) {
    const index = Number.parseInt(trimmed, 10);
    if (!Number.isNaN(index) && choices[index - 1]) {
      answer = choices[index - 1].value;
    } else {
      const match = choices.find(
        (choice) => choice.value === trimmed || choice.label === trimmed
      );
      if (match) {
        answer = match.value;
        flowState.selectedChoiceIndex = choices.findIndex((choice) => choice.value === match.value);
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

  if (nextStep === "exit") {
    exitFlow();
    return;
  }

  flowState.stepId = nextStep;
  flowState.selectedChoiceIndex = 0;
  printFlowStep();
}

function exitFlow() {
  mode = "shell";
  currentFlow = null;
  flowState = null;
  activeFlowStepNode = null;
  if (flowEl) {
    flowEl.innerHTML = "";
    flowEl.hidden = true;
  }
  updatePrompt();
  appendLine("Returned to shell.", "success");
  saveOutput();
  focusInput();
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
    initialDelay: 1600,
    stepDelay: 0,
    thinkingLabel: "Thinking...",
  });
}

function generateAIReply(input) {
  const lower = input.toLowerCase();
  if (lower.includes("portfolio")) {
    return "Try `portfolio` to list projects from the desktop OS portfolio, then `open <slug>` for details.";
  }
  if (lower.includes("bookmark") || lower.includes("tool")) {
    return "Use `bookmarks` to browse Nikki's saved links and tools, then `preview <bookmark>` or `open <bookmark>`.";
  }
  if (lower.includes("contact") || lower.includes("email")) {
    return "Use `contact` for Nikki's email and social links.";
  }
  if (lower.includes("work") || lower.includes("experience")) {
    return "Nikki is currently a Product Manager at EliseAI, after roles at Spline, Clearing Health, Better.com, Dropbox, and Atlassian.";
  }
  if (lower.includes("help")) {
    return "Type `help` for the command list. I can guide you too.";
  }
  return "Ask about Nikki's work, portfolio, bookmarks, or contact links.";
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
  terminalEl.classList.remove(
    ...themeOptions
      .filter((name) => name !== "default")
      .map((name) => `theme-${name}`)
  );
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
  updateInputAssist();
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

function appendReadyLines() {
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

function printWelcome() {
  appendHTMLLine(`<pre class="terminal-art terminal-art--hero">${escapeHTML(createWelcomeArt())}</pre>`, "success");
  appendReadyLines();
}

function resetInteractiveState() {
  pendingOpenTarget = null;
  shellState.cwd = shellState.home;
  mode = "shell";
  currentFlow = null;
  flowState = null;
  activeFlowStepNode = null;
  shellOutputHTML = "";
  aiOutputHTML = "";
  shellHistory = [];
  shellHistoryIndex = 0;
  aiHistory = [];
  aiHistoryIndex = 0;
  tabState = { value: "", timestamp: 0 };
  inputEl.value = "";
  ghostEl.textContent = "";
  if (flowEl) {
    flowEl.innerHTML = "";
    flowEl.hidden = true;
  }
  clearPersistedHistory();
  updatePrompt();
  updateTitle();
  isUserAtBottom = true;
  updateJumpButton();
}

function queueShellInitialization() {
  beginOutputCapture();
  startThinkingIndicator("Initializing terminal shell...");
  scheduleEvent(() => {
    stopThinkingIndicator();
    appendReadyLines();
    setRunning(false);
    finishOutputCapture();
    saveOutput();
  }, BOOT_INIT_DELAY);
}

function softRebootTerminal() {
  activeAsyncCommandToken += 1;
  clearPendingTimers();
  setRunning(true);
  outputEl.innerHTML = "";
  resetInteractiveState();
  queueShellInitialization();
}

function queueBootSequence() {
  clearPendingTimers();
  setRunning(true);
  beginOutputCapture();

  const heroLines = createWelcomeArt().split("\n");
  const { line, art } = createArtOutputNode("terminal-art--hero");
  addOutputNode(line);

  let totalDelay = 0;

  heroLines.forEach((heroLine, index) => {
    scheduleEvent(() => {
      art.textContent += `${index === 0 ? "" : "\n"}${heroLine}`;
      scrollToBottom();
    }, totalDelay);
    totalDelay += BOOT_STREAM_DELAY;
  });

  scheduleEvent(() => {
    startThinkingIndicator("Initializing terminal shell...");
  }, totalDelay);

  totalDelay += BOOT_INIT_DELAY;

  scheduleEvent(() => {
    stopThinkingIndicator();
    appendReadyLines();
    setRunning(false);
    finishOutputCapture();
    saveOutput();
  }, totalDelay);
}

function handleFlowArrowKey(event) {
  if (mode === "flow") {
    const flowDirection = {
      ArrowUp: -1,
      ArrowLeft: -1,
      ArrowDown: 1,
      ArrowRight: 1,
    }[event.key];

    if (typeof flowDirection === "number") {
      event.preventDefault();
      event.stopPropagation();
      focusInput();
      moveFlowSelection(flowDirection);
      return true;
    }
  }
  return false;
}

document.addEventListener("keydown", (event) => {
  if (handleFlowArrowKey(event)) {
    return;
  }
}, true);

inputEl.addEventListener("keydown", (event) => {
  if (handleFlowArrowKey(event)) {
    return;
  }

  if (event.key === "Escape" && mode === "flow") {
    event.preventDefault();
    if (isRunning) {
      interruptRunning();
    }
    appendLine("Flow cancelled.", "error");
    exitFlow();
    saveOutput();
    return;
  }

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
    const value =
      mode === "flow" && !inputEl.value.trim()
        ? getSelectedFlowChoiceValue()
        : inputEl.value;
    inputEl.value = "";
    updateCaret();

    if (mode === "shell") {
      if (value.trim()) {
        shellHistoryIndex = pushHistoryEntry(shellHistory, value.trim());
        runCommand(value);
      } else {
        appendCommandEcho("");
        saveOutput();
        scrollToBottom();
      }
      return;
    }

    if (mode === "flow") {
      beginOutputCapture();
      appendCommandEcho(value);
      queueFlowSubmission(value);
      return;
    }

    if (mode === "ai") {
      if (value.trim()) {
        aiHistoryIndex = pushHistoryEntry(aiHistory, value.trim());
      }
      appendCommandEcho(value);
      handleAIInput(value);
      return;
    }
  }

  if (event.key === "ArrowUp") {
    if (mode === "flow" && moveFlowSelection(-1)) {
      event.preventDefault();
      return;
    }
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
    if (mode === "flow" && moveFlowSelection(1)) {
      event.preventDefault();
      return;
    }
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

  if (event.key === "ArrowLeft") {
    if (mode === "flow" && moveFlowSelection(-1)) {
      event.preventDefault();
      return;
    }
  }

  if (event.key === "ArrowRight") {
    if (mode === "flow" && moveFlowSelection(1)) {
      event.preventDefault();
      return;
    }
  }

  if (event.key === "Tab" && (mode === "shell" || mode === "flow")) {
    event.preventDefault();
    if (isRunning) return;
    const rawValue = inputEl.value;
    if (mode === "flow" && !rawValue.trim()) {
      moveFlowSelection(1);
      return;
    }
    const { matches, listMatches, completedValue } = getCompletionState(rawValue);
    if (!rawValue.trim()) return;
    if (matches.length === 1) {
      setInputValue(completedValue);
      tabState = { value: "", timestamp: 0 };
    } else if (listMatches.length > 0) {
      const now = Date.now();
      if (tabState.value === rawValue && now - tabState.timestamp < 800) {
        appendLine(listMatches.join("    "));
        saveOutput();
        tabState = { value: "", timestamp: 0 };
      } else {
        setInputValue(completedValue || rawValue);
        tabState = { value: completedValue || rawValue, timestamp: now };
      }
    }
  }
});

inputEl.addEventListener("input", () => {
  tabState = { value: "", timestamp: 0 };
  if (mode === "flow") {
    const matchIndex = findFlowChoiceMatchIndex(inputEl.value);
    if (matchIndex >= 0) {
      flowState.selectedChoiceIndex = matchIndex;
      updateFlowStepNode();
    }
  }
  updateCaret();
  updateInputAssist();
});
inputEl.addEventListener("scroll", updateCaret);
inputEl.addEventListener("keyup", () => {
  updateCaret();
  updateInputAssist();
});
inputEl.addEventListener("click", updateCaret);
inputEl.addEventListener("select", updateCaret);
inputEl.addEventListener("focus", () => {
  if (inputWrapEl) {
    inputWrapEl.classList.add("is-focused");
  }
  updateCaret();
  updateInputAssist();
});
inputEl.addEventListener("blur", () => {
  if (inputWrapEl) {
    inputWrapEl.classList.remove("is-focused");
  }
  updateInputAssist();
});
window.addEventListener("resize", () => {
  updateCaret();
  updateTitle();
  updateInputAssist();
});

outputEl.addEventListener("scroll", () => {
  isUserAtBottom = isScrolledToBottom();
  updateJumpButton();
});

outputEl.addEventListener("click", () => {
  focusInput();
});

terminalEl.addEventListener("click", (event) => {
  const target = event.target;
  if (target instanceof HTMLElement && target.tagName === "BUTTON") return;
  focusInput();
});

if (jumpButton) {
  jumpButton.addEventListener("click", () => {
    scrollToBottom();
    focusInput();
  });
}

window.addEventListener("beforeunload", () => {
  sessionStats.sessionDurationMs = Date.now() - sessionStats.startedAt;
  safeStorageSet(STORAGE_KEYS.stats, JSON.stringify(sessionStats));
  saveOutput();
});

loadState();
if (!shellOutputHTML) {
  queueBootSequence();
}
updatePrompt();
scrollToBottom();
focusInput();
if (inputWrapEl) {
  inputWrapEl.classList.add("is-focused");
}
