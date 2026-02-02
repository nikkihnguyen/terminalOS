Below is a solid V1 PRD you can actually build from. It assumes you’re making a “terminal-style” web app that supports typed commands, routed experiences (question flows), and launching external links/apps—while staying extensible so you can keep adding new commands over time.

⸻

PRD: Terminal Sandbox Web App

1) Overview

Build a personal website that looks and behaves like a terminal. Users type commands. Commands trigger:
	•	interactive “flows” (a sequence of prompts/questions with branching)
	•	opening portfolio content (inline or as a routed view)
	•	launching external apps/links
	•	an AI chat mode (terminal-native ChatGPT-like experience)

This site is a sandbox: the core value is an extensible command system that makes it easy to add new commands and flows over time without rewriting the app.

⸻

2) Goals and Non-goals

Goals
	1.	Terminal-first interaction: typing commands is the primary UI.
	2.	Command framework: add a new command in minutes (not hours).
	3.	Flows engine: support multi-step Q&A sequences (with branching).
	4.	Portfolio + external launchers: open internal pages or external URLs.
	5.	AI mode: chat in-terminal with a clean UX.
	6.	Persisted history: command history + outputs feel terminal-real.

Non-goals (V1)
	•	Full shell emulation (no need for real filesystem, pipes, etc.).
	•	Auth / user accounts (unless needed for saving user state later).
	•	Collaborative multiplayer terminal.
	•	Plugin marketplace / third-party command installs (maybe later).

⸻

3) Target Users
	•	Recruiters / hiring managers: want a fast, memorable way to explore who you are.
	•	Product/tech peers: want to poke around, discover projects, and see how you think.
	•	You (the builder): want a playground to add experiments, flows, and apps over time.

⸻

4) User Experience Principles
	•	Immediate feedback: every command returns something quickly (even if it’s “loading…”).
	•	Low friction discovery: help, ls, commands, about, portfolio should guide.
	•	Delight without gimmicks: small easter eggs, but never blocks navigation.
	•	Fail gracefully: unknown commands should be helpful (“did you mean…?”).
	•	Keyboard-first: no forced mouse usage; mouse support is secondary.

⸻

5) Core User Stories

Discovery
	•	As a user, I can type help and see available commands and examples.
	•	As a user, I can type about and get a short intro and suggested next commands.
	•	As a user, I can use arrow keys to navigate command history.

Portfolio
	•	As a user, I can type portfolio to open a list of projects.
	•	As a user, I can type open <project> to view details (inline terminal output or “full-screen terminal panel”).
	•	As a user, I can type resume to open a PDF or a formatted resume view.

Launch external apps
	•	As a user, I can type launch <app> and it opens a new tab to a hosted demo.
	•	As a user, I can type apps to see a curated list.

Interactive flows
	•	As a user, I can type quiz, onboard, tour, or choose-your-own-adventure and answer prompts.
	•	As a user, I can exit a flow with exit or ctrl+c semantics.

AI mode
	•	As a user, I can type ai (or chat) and enter an AI session.
	•	As a user, I can exit AI mode and return to the main terminal.
	•	As a user, I can copy output easily.

⸻

6) Functional Requirements

6.1 Terminal Shell UI

Must have
	•	Single input line with prompt (e.g., nikki@site:~$)
	•	Scrollable output area with timestamps optional
	•	Command history (↑/↓) + persistent in-session history
	•	Basic shortcuts:
	•	Enter runs command
	•	Ctrl+L clears screen
	•	Tab autocomplete (at least for command names)
	•	Output rendering supports:
	•	plain text
	•	hyperlinks
	•	simple formatting (bold, code blocks)
	•	optional “panels” for richer content (but still terminal-styled)

Nice-to-have
	•	Themes (theme dark, theme amber, etc.)
	•	Sound toggles or subtle cursor blink
	•	Mobile responsiveness (soft keyboard quirks)

⸻

6.2 Command Router / Registry

Commands are the product.

Must have
	•	A registry where commands are defined with:
	•	name
	•	aliases
	•	description
	•	usage
	•	handler(input, context) -> output/events
	•	Parser supports:
	•	command arg1 arg2
	•	quoted strings: open "Project Name"
	•	flags: --verbose, -v (optional in V1)
	•	Helpful errors:
	•	unknown command -> suggest closest matches
	•	invalid args -> show usage string

Nice-to-have
	•	Namespaces: app:, ai:, sys:
	•	Piping (probably V2+)

⸻

6.3 Flows Engine (Interactive Q&A Sequences)

This is where the “fun sequences of questions” live.

Must have
	•	Flow definition format (JSON or TS objects) with:
	•	flow id/name
	•	steps: prompt, input type (text/choice), validation, next step logic
	•	ability to branch based on answer
	•	Flow runtime:
	•	terminal locks into “flow mode”
	•	user input is interpreted as step answer (not as a shell command)
	•	reserved commands inside flow: exit, back, restart, help
	•	Flow output can include:
	•	generated text
	•	links
	•	summary at end

Nice-to-have
	•	Store flow results in localStorage
	•	“Share your result” permalink (if you later add server storage)

⸻

6.4 Portfolio Content + Internal Views

Must have
	•	portfolio lists projects
	•	open <slug> shows a project view:
	•	lightweight view (render markdown or structured data)
	•	contact prints email/linkedin/github
	•	resume opens PDF in new tab

Nice-to-have
	•	search <keyword> searches projects and commands
	•	random picks a project/story

⸻

6.5 External Launchers

Must have
	•	apps lists external demos with short descriptions
	•	launch <app> opens URL in new tab
	•	allow “safe list” only (avoid open redirect)

⸻

6.6 AI Mode

Must have
	•	ai enters chat session
	•	Separate transcript inside AI mode
	•	Commands in AI mode:
	•	exit returns to shell
	•	clear clears AI transcript
	•	Support streaming responses (strongly preferred if using an API)

Implementation note
	•	If using OpenAI API, you’ll want a minimal backend (or edge function) to keep keys private.

Nice-to-have
	•	ai --context portfolio to preload your project summaries
	•	“personality modes” (serious/fun)

⸻

6.7 State & Persistence

Must have
	•	Store:
	•	command history for current session
	•	optionally last N outputs in localStorage so refresh doesn’t wipe everything
	•	Track:
	•	last command run
	•	time spent / commands executed (analytics)

⸻

7) Non-Functional Requirements

Performance
	•	First load fast (target < 2s on decent connection)
	•	Terminal interactions should feel instant (<50ms UI response)

Reliability
	•	Unknown commands never break UI
	•	AI failures show clean error + retry suggestion

Security
	•	No exposed API keys
	•	Whitelist external launch URLs
	•	Prevent XSS in terminal output rendering (sanitize if rendering markdown/HTML)

Accessibility
	•	Contrast-friendly themes
	•	Screen-reader reasonable output order
	•	Keyboard-only fully usable

⸻

8) Command Set (Proposed V1)

System
	•	help — list commands + examples
	•	clear — clear terminal output
	•	theme — list/set themes (optional)
	•	about — intro + suggested commands

Portfolio
	•	portfolio — list projects
	•	open <project> — open a project
	•	resume — open resume PDF
	•	contact — email + links

Apps
	•	apps — list apps
	•	launch <app> — open external link

Flows
	•	tour — guided tour of the site
	•	quiz — fun flow (e.g., “what should you explore next?”)
	•	story — choose-your-own adventure

AI
	•	ai or chat — AI terminal mode

Easter eggs
	•	sudo — joke response
	•	rm -rf / — joke response

⸻

9) Data Model (Simple)

Command definition
	•	name: string
	•	aliases: string[]
	•	description: string
	•	usage: string
	•	handler: (args, context) -> TerminalEvent[]

Terminal events
	•	print(text, style?)
	•	link(text, url)
	•	panel(title, content) (optional)
	•	enterFlow(flowId)
	•	enterAIMode()
	•	openUrl(url)

Flow definition
	•	id: string
	•	name: string
	•	steps: Step[]
	•	startStepId: string

Step:
	•	id: string
	•	prompt: string
	•	type: "text" | "choice"
	•	choices?: {label, value}[]
	•	validate?: (input) -> error?
	•	next: (input, state) -> stepId | "end"

⸻

10) Success Metrics

V1 metrics (simple, practical):
	•	% of sessions that run at least 2 commands
	•	help → follow-on command rate (did users do something after help?)
	•	Portfolio engagement:
	•	portfolio usage rate
	•	open <project> usage rate
	•	App launch clicks (launch)
	•	AI mode entry rate + average message count
	•	Drop-off points: unknown command frequency, flow exits

⸻

11) MVP Scope (2–3 week build)

MVP must ship with
	•	Terminal UI + history + clear
	•	Command registry + parser + autocomplete for command names
	•	Portfolio commands: about, portfolio, open, contact, resume
	•	External launcher: apps, launch
	•	One flow: tour (short, guided)
	•	AI mode basic (even if it’s stubbed to a simple backend)

Out of scope for MVP
	•	complex markdown rendering
	•	multiple flows with branching (keep it simple: linear tour)
	•	theming system (unless trivial)
	•	shareable permalinks

⸻

12) Risks + Mitigations
	•	Risk: terminal novelty hurts discoverability
	•	Mitigation: On load, print a welcome banner with “Type help”.
	•	Risk: flows feel clunky
	•	Mitigation: keep flows short; add exit/back commands.
	•	Risk: AI costs / abuse
	•	Mitigation: rate limiting + usage caps; start with low token limits.
	•	Risk: adding commands becomes messy
	•	Mitigation: strict command schema + folder structure + tests for parser.

⸻

13) Milestones
	1.	Week 1
	•	Terminal UI, command parsing, command registry, core system commands
	2.	Week 2
	•	Portfolio content + internal project viewer + apps launcher
	3.	Week 3
	•	Flows engine + tour flow + AI mode integration + polish

⸻

14) Open Questions (Decide Later, but you should know they exist)
	•	Should project views render as terminal text only, or allow a richer “terminal panel” layout?
	•	Do you want URLs to encode state (e.g., /?cmd=portfolio) for shareability?
	•	AI: do you want it to be “about you” (RAG over portfolio), or generic chat?
	•	Do you want this to be your main personal site, or a “side entrance” to a normal site?

⸻