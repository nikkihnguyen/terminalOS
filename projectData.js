export const rawProjectData = [
  {
    title: "HotdogOrLegs",
    date: "2024-01-16",
    platform: "ios",
    stack: ["SwiftUI", "UIKit", "OpenAI API", "Camera"],
    path: "/Users/nikkinguyen/Documents/Airdrop Folder/xCodeProjects/HotdogOrLegs",
    summary:
      "An early iOS vision experiment that mixes camera capture with an AI classification flow.",
    intent:
      "Explore whether a playful camera-first app could turn a meme-format concept into an actual on-device interaction.",
    build:
      "Built in SwiftUI with UIKit interop for image handling and a network call path into the OpenAI API.",
    unique:
      "It shows the earliest version of your interest in combining native mobile UI with generative or perception-driven behavior.",
  },
  {
    title: "BrickMe",
    date: "2024-02-19",
    platform: "ios",
    stack: ["SwiftUI", "UIKit", "OpenAI API", "Rive", "Camera"],
    path: "/Users/nikkinguyen/Documents/Airdrop Folder/xCodeProjects/BrickMe",
    summary:
      "An iOS app that transforms photos into LEGO-style imagery with a more branded, animated presentation layer.",
    intent:
      "Turn the image-restyling idea into something more playful and product-like by leaning into LEGO aesthetics and motion.",
    build:
      "Built with SwiftUI and UIKit image capture, OpenAI-backed prompt generation, camera/photo input, and Rive animations.",
    unique:
      "This is a clearer productized version of your AI image-transformation experiments, with a stronger visual identity than a raw demo.",
  },
  {
    title: "ChatwithCBT",
    date: "2024-02-19",
    platform: "ios",
    stack: ["SwiftUI", "OpenAI", "Rive", "Chat state"],
    path: "/Users/nikkinguyen/Documents/Airdrop Folder/xCodeProjects/ChatwithCBT",
    summary:
      "A therapy-style chat prototype centered on CBT-flavored conversational support.",
    intent:
      "Explore how an AI chat interface could be framed around reflective mental-health support instead of generic assistant behavior.",
    build:
      "The project uses SwiftUI, OpenAI integration, Rive-driven visual polish, and local chat history management.",
    unique:
      "It is an early sign of your recurring interest in reflective and self-improvement products, not just productivity tools.",
  },
  {
    title: "TaskTracker",
    date: "2025-03-07",
    platform: "ios",
    stack: ["SwiftUI", "Local state"],
    path: "/Users/nikkinguyen/Documents/xCode Project Files/TaskTracker",
    summary:
      "A native task-management prototype focused on building everyday product muscle in SwiftUI.",
    intent:
      "Practice turning a familiar productivity problem into a clean native workflow before layering on heavier backend complexity.",
    build:
      "Structured as a SwiftUI app with straightforward task views and local app state.",
    unique:
      "It represents the point where your iOS work starts to shift from isolated UI experiments toward utility apps.",
  },
  {
    title: "98portfolio",
    date: "2025-04-11",
    platform: "web",
    stack: ["HTML", "CSS", "98.css", "JavaScript"],
    path: "/Users/nikkinguyen/projects/98portfolio",
    summary:
      "A retro desktop-inspired portfolio concept that treats the website like an operating system.",
    intent:
      "Present personal work in a way that feels memorable and interactive instead of using a conventional template grid.",
    build:
      "Built with static web primitives, 98.css styling, and a set of custom desktop-style assets and panels.",
    unique:
      "The portfolio itself becomes the product. Navigation, mood, and nostalgia do a lot of the storytelling.",
  },
  {
    title: "cameraASCII",
    date: "2025-04-18",
    platform: "web",
    stack: ["HTML", "CSS", "JavaScript", "Webcam API"],
    path: "/Users/nikkinguyen/projects/cameraASCII",
    summary:
      "A browser experiment that turns live webcam input into ASCII art in real time.",
    intent:
      "Test how far a simple webcam + canvas pipeline could go without introducing heavy computer vision tooling.",
    build:
      "Vanilla JavaScript reads the camera stream, samples brightness, and maps pixels into fixed-width ASCII output.",
    unique:
      "The constraint is the point. It turns a raw browser capability into a stylized visual effect with almost no abstraction.",
  },
  {
    title: "ComputerVision",
    date: "2025-04-21",
    platform: "web",
    stack: ["HTML", "CSS", "JavaScript", "Webcam API"],
    path: "/Users/nikkinguyen/projects/ComputerVision",
    summary:
      "A more developed follow-up to the ASCII camera idea with camera switching, controls, and export behavior.",
    intent:
      "Push the earlier ASCII experiment into a more usable interactive tool rather than keeping it as a one-off demo.",
    build:
      "The app uses browser media APIs, multiple ASCII style mappings, mobile camera toggles, and text export functionality.",
    unique:
      "Compared with the earlier version, this feels more like a product surface with configurable output rather than only a technical toy.",
  },
  {
    title: "JournalApp",
    date: "2025-04-28",
    platform: "ios",
    stack: ["SwiftUI", "JSON persistence", "UIKit bridge"],
    path: "/Users/nikkinguyen/Documents/xCode Project Files/JournalApp",
    summary:
      "A journaling app with local persistence and a structure designed around entry management over time.",
    intent:
      "Build a calmer, writing-first utility that explores state management and local data storage in a native app.",
    build:
      "SwiftUI views are backed by a journal store that writes entries to JSON in the documents directory.",
    unique:
      "It is one of the clearer signs that your work is not just visual experimentation; it also leans into personal tooling.",
  },
  {
    title: "MetaWarpPlayground",
    date: "2025-05-16",
    platform: "ios",
    stack: ["SwiftUI", "Metal", "Shaders"],
    path: "/Users/nikkinguyen/Documents/xCode Project Files/MetaWarpPlayground",
    summary:
      "A shader playground for exploring math-driven warping effects inside a SwiftUI shell.",
    intent:
      "Understand how expressive visual effects can be embedded in native interfaces instead of living only in isolated demos.",
    build:
      "SwiftUI screens feed configuration into Metal shader code with multiple warp views and shared settings.",
    unique:
      "This is where your portfolio starts to show graphics curiosity, not just app CRUD or layout work.",
  },
  {
    title: "MetalWarpView",
    date: "2025-05-16",
    platform: "ios",
    stack: ["SwiftUI", "Metal", "Image shaders"],
    path: "/Users/nikkinguyen/Documents/xCode Project Files/MetalWarpView",
    summary:
      "A native image-warping prototype that exposes shader controls directly in the UI.",
    intent:
      "Translate graphics experimentation into something a user can actually manipulate through sliders and previews.",
    build:
      "Built with SwiftUI and Metal-powered warp shaders applied to a sample image with live parameter controls.",
    unique:
      "It bridges highly technical rendering work with a consumer-facing interaction model.",
  },
  {
    title: "Pixelator",
    date: "2025-06-04",
    platform: "ios",
    stack: ["SwiftUI", "MetalKit"],
    path: "/Users/nikkinguyen/Documents/xCode Project Files/Pixelator",
    summary:
      "An image-processing app that experiments with pixelation and GPU-backed visual transformations.",
    intent:
      "Keep exploring image effects on iOS while tightening the link between performance-oriented rendering and product interaction.",
    build:
      "Uses SwiftUI with a Metal-backed pixel view for effect rendering.",
    unique:
      "Together with the warp experiments, it gives your native work a recognizable graphics thread.",
  },
  {
    title: "PixelatorApp",
    date: "2025-10-14",
    platform: "ios",
    stack: ["SwiftUI", "MetalKit", "Image picker", "Shader effects"],
    path: "/Users/nikkinguyen/Documents/xCode Project Files/PixelatorApp",
    summary:
      "A more productized follow-up to Pixelator with user-selectable effects and image import flow.",
    intent:
      "Take the lower-level rendering experiment and package it into something that behaves more like a consumer editing tool.",
    build:
      "Built in SwiftUI with Metal-backed rendering, an image picker, configurable effect types, and live parameter sliders.",
    unique:
      "This entry matters because it shows iteration, not just experimentation. You revisited the graphics idea and made it more usable.",
  },
  {
    title: "teamTime",
    date: "2025-10-12",
    platform: "web",
    stack: ["Next.js", "React", "TypeScript", "Leaflet", "Tailwind"],
    path: "/Users/nikkinguyen/projects/teamTime",
    summary:
      "A time-zone coordination app for distributed teams with map and scheduling context.",
    intent:
      "Solve a real remote-work coordination problem by making team availability visible in one place.",
    build:
      "The repo points to a Next.js App Router build with React, TypeScript, Leaflet, date-fns-tz, and local state.",
    unique:
      "It is a productivity tool with a geographic lens, which makes it more concrete than a standard dashboard project.",
  },
  {
    title: "GSD",
    date: "2025-10-14",
    platform: "ios",
    stack: ["SwiftUI", "Task management"],
    path: "/Users/nikkinguyen/Documents/xCode Project Files/GSD",
    summary:
      "A structured task app with multiple list types like Today, Someday, and unfinished work.",
    intent:
      "Refine your take on productivity systems by modeling different task states instead of a single flat list.",
    build:
      "Implemented in SwiftUI with separate views and a task store organizing the core flows.",
    unique:
      "This shows more opinionated product thinking than a generic to-do app because the mental model is built into the IA.",
  },
  {
    title: "arcSelector",
    date: "2025-10-14",
    platform: "ios",
    stack: ["SwiftUI", "Interaction prototype"],
    path: "/Users/nikkinguyen/Documents/xCode Project Files/arcSelector",
    summary:
      "A focused SwiftUI interaction prototype centered on a radial or arc-based selection pattern.",
    intent:
      "Explore whether a non-standard input pattern could feel intuitive enough to support a real interface.",
    build:
      "The project is a lightweight native prototype in SwiftUI, positioned more as an interaction study than a full product.",
    unique:
      "This gives the portfolio a useful kind of evidence: not every project is an app, some are interface research.",
  },
  {
    title: "LoveNotes",
    date: "2025-10-22",
    platform: "ios",
    stack: ["SwiftUI", "Drawing canvas", "Local notes"],
    path: "/Users/nikkinguyen/Documents/xCode Project Files/LoveNotes",
    summary:
      "A native app concept for exchanging hand-drawn notes between two people.",
    intent:
      "Build something more intimate and expressive than a standard messaging or note-taking app by centering the drawing gesture.",
    build:
      "The project plan points to a SwiftUI-based note app with a drawing canvas, touch gestures, brush controls, and local user switching for testing.",
    unique:
      "It stands out because the emotional tone is different from your productivity apps. It shows product imagination, not just utility thinking.",
  },
  {
    title: "ParkCue",
    date: "2025-11-13",
    platform: "ios",
    stack: ["SwiftUI", "MapKit", "Local notifications", "Location"],
    path: "/Users/nikkinguyen/Documents/xCode Project Files/ParkCue",
    summary:
      "A parking reminder app aimed at helping users avoid tickets and remember where they left the car.",
    intent:
      "Turn a narrow but painful urban problem into a focused mobile tool with location and reminder logic.",
    build:
      "The project docs and source reference SwiftUI, iOS location permissions, local-only reminders, and parking session history.",
    unique:
      "It is a strong portfolio piece because the pain point is clear, the UX stakes are real, and the feature set is disciplined.",
  },
  {
    title: "FlipboardApp",
    date: "2025-11-18",
    platform: "web",
    stack: ["React", "Vite", "JavaScript"],
    path: "/Users/nikkinguyen/projects/FlipboardApp",
    summary:
      "A component-focused React experiment centered around animated flip-card or flip-board interactions.",
    intent:
      "Practice building motion-heavy UI behavior in React without hiding behind template-level complexity.",
    build:
      "The repo uses React and Vite, with custom `FlipBoard` and `FlipCard` components driving the interaction.",
    unique:
      "This is a useful motion study because the interface itself is the challenge, not just the data model.",
  },
  {
    title: "SimAI",
    date: "2025-11-25",
    platform: "web",
    stack: ["Next.js", "React", "TypeScript", "Radix UI", "Recharts"],
    path: "/Users/nikkinguyen/projects/SimAI",
    summary:
      "An AI-adjacent dashboard app that mixes control surfaces, data views, and a more system-like interface.",
    intent:
      "Explore a richer product shell for simulation or analysis workflows rather than a single-purpose landing page.",
    build:
      "The project uses Next.js with TypeScript, Radix-based UI primitives, tables, inputs, and charts.",
    unique:
      "It broadens your portfolio from playful experiments into software that looks closer to an actual working product.",
  },
  {
    title: "ParkIt",
    date: "2025-11-27",
    platform: "ios",
    stack: ["SwiftUI", "MapKit", "UserNotifications", "Location"],
    path: "/Users/nikkinguyen/Documents/xCode Project Files/ParkIt",
    summary:
      "Another parking-focused native app, this time with an explicit map-driven flow and active parking sessions.",
    intent:
      "Iterate on the parking problem space and test a more map-centric, session-oriented product direction.",
    build:
      "The source uses SwiftUI, MapKit camera positioning, local notifications, and parking state transitions.",
    unique:
      "This is useful in the timeline because it shows you revisiting the same problem with a sharper product model.",
  },
  {
    title: "ParkingReminders-LQ",
    date: "2025-11-28",
    platform: "ios",
    stack: ["SwiftUI", "Navigation", "Parking sessions"],
    path: "/Users/nikkinguyen/Documents/xCode Project Files/ParkingReminders-LQ",
    summary:
      "A design-forward parking reminder concept with tabs and a more polished product framing.",
    intent:
      "Push the parking reminder idea toward a stronger design system and a more complete everyday utility.",
    build:
      "The app uses SwiftUI tab-based navigation and a product spec focused on one-tap parking sessions and time reminders.",
    unique:
      "The repeated parking projects form a real product lineage, which is exactly the kind of story a timeline should make visible.",
  },
  {
    title: "KB-website",
    date: "2025-12-13",
    platform: "web",
    stack: ["HTML", "Vite", "CSS", "JavaScript"],
    path: "/Users/nikkinguyen/projects/KB-website",
    summary:
      "A portfolio-style landing site with a more conventional web presentation than your retro portfolio experiments.",
    intent:
      "Test a cleaner personal-site approach and compare it against more concept-driven portfolio directions.",
    build:
      "The repo is a simple Vite-based front-end with static entry points and lightweight structure.",
    unique:
      "It gives the timeline contrast by showing that you explored both expressive and minimal portfolio presentation styles.",
  },
  {
    title: "tinderforsoftwarefounders",
    date: "2025-12-13",
    platform: "web",
    stack: ["React", "TypeScript", "Tailwind", "Framer Motion", "Supabase"],
    path: "/Users/nikkinguyen/projects/tinderforsoftwarefounders",
    summary:
      "A co-founder matching MVP that borrows swipe mechanics from dating apps for startup collaboration.",
    intent:
      "Turn a familiar interaction model into a networking product for technical founders looking for collaborators.",
    build:
      "Built with React, TypeScript, React Router, Framer Motion, React Query, and an optional Supabase backend.",
    unique:
      "The concept is instantly legible and the interaction model matches the product idea, which makes it easy to discuss in interviews.",
  },
  {
    title: "ResolutionReminders",
    date: "2025-12-16",
    platform: "web",
    stack: ["Next.js", "TypeScript", "Supabase", "Tailwind", "Recharts"],
    path: "/Users/nikkinguyen/projects/ResolutionReminders",
    summary:
      "A full-stack resolution tracker focused on accountability, monthly check-ins, and progress visualization.",
    intent:
      "Build a more complete product with auth, persistence, reminders, and analytics around a seasonal habit-formation use case.",
    build:
      "The repo uses Next.js, Supabase auth and data layers, charting, and a richer component system than the earlier browser prototypes.",
    unique:
      "This is one of the clearest examples of your work moving from experiments into app-shaped product design.",
  },
  {
    title: "BreakoutGame",
    date: "2025-12-20",
    platform: "web",
    stack: ["TypeScript", "MediaPipe", "Canvas", "Webcam"],
    path: "/Users/nikkinguyen/projects/BreakoutGame",
    summary:
      "A browser-based Breakout clone controlled with webcam hand tracking instead of mouse or keyboard.",
    intent:
      "Prove that a classic arcade mechanic could be made more novel by replacing standard controls with real-time vision input.",
    build:
      "TypeScript drives the game loop while MediaPipe hand landmark detection and browser camera access power gesture input.",
    unique:
      "It is both technically legible and immediately demoable, which makes it strong portfolio material.",
  },
  {
    title: "reflection",
    date: "2026-01-03",
    platform: "ios",
    stack: ["SwiftUI", "Journaling", "Device activity", "Health-oriented flows"],
    path: "/Users/nikkinguyen/Documents/xCode Project Files/reflection",
    summary:
      "A more developed reflection app that blends journaling with device-activity-aware self-observation.",
    intent:
      "Build a personal insight tool that goes beyond writing entries and starts connecting reflection with behavioral patterns.",
    build:
      "The codebase includes SwiftUI app structure, journaling clients, shared theming, and a device activity report extension.",
    unique:
      "Compared with JournalApp, this reads like a second-generation idea with a clearer point of view about reflection as a system.",
  },
  {
    title: "BrickedUpApp",
    date: "2026-01-23",
    platform: "ios",
    stack: ["SwiftUI", "UIKit", "OpenAI API", "Camera", "Sharing"],
    path: "/Users/nikkinguyen/Documents/Airdrop Folder/xCodeProjects/BrickedUpApp",
    summary:
      "A later brick-style image app that appears to extend the earlier LEGO-photo concept with sharing flows.",
    intent:
      "Refine the brickification idea into something easier to capture, generate, browse, and share from a native iPhone experience.",
    build:
      "Built with SwiftUI plus UIKit image capture, OpenAI-based generation, carousel-style presentation, and share-sheet/controller support.",
    unique:
      "It shows you returning to a successful concept and improving the surrounding product mechanics instead of stopping at the first prototype.",
  },
  {
    title: "Brickify",
    date: "2026-01-23",
    platform: "ios",
    stack: ["SwiftUI", "OpenAI API", "Camera"],
    path: "/Users/nikkinguyen/Documents/Airdrop Folder/xCodeProjects/Brickify",
    summary:
      "Another native brick-transformation app focused on converting captured photos into stylized outputs.",
    intent:
      "Keep iterating on the photo-to-LEGO idea until the flow felt simple enough for casual use.",
    build:
      "SwiftUI handles the interface while camera access and an OpenAI-backed generation path drive the transformation workflow.",
    unique:
      "Taken together with BrickMe and BrickedUpApp, this forms a real mini-lineage in your portfolio rather than a one-off gimmick.",
  },
  {
    title: "ChatApp",
    date: "2026-01-23",
    platform: "ios",
    stack: ["SwiftUI", "UIKit", "Messaging UI"],
    path: "/Users/nikkinguyen/Documents/Airdrop Folder/xCodeProjects/ChatApp",
    summary:
      "A lightweight messaging UI prototype with a SwiftUI shell and UIKit-based chat cell implementation.",
    intent:
      "Practice the structure and presentation of a native chat experience without needing the full backend stack first.",
    build:
      "The app combines SwiftUI entry points with UIKit table-view cells and chat model presentation.",
    unique:
      "Even as a smaller prototype, it adds evidence that you explored common product patterns at the UI-system level.",
  },
  {
    title: "GPTVisionBaseCode",
    date: "2026-01-23",
    platform: "ios",
    stack: ["SwiftUI", "Camera permissions", "Vision prototype"],
    path: "/Users/nikkinguyen/Documents/Airdrop Folder/xCodeProjects/GPTVisionBaseCode",
    summary:
      "A base iOS vision project set up as a starting point for camera-driven GPT experiments.",
    intent:
      "Create reusable scaffolding for future camera-and-AI experiments instead of repeatedly starting from a blank Xcode app.",
    build:
      "The project includes a SwiftUI app target and camera permission setup intended for image-driven interaction work.",
    unique:
      "This is useful in the timeline because it shows infrastructure thinking, not only end-user app ideas.",
  },
  {
    title: "NoteApp",
    date: "2026-01-23",
    platform: "ios",
    stack: ["SwiftUI", "UIKit", "Local notes"],
    path: "/Users/nikkinguyen/Documents/Airdrop Folder/xCodeProjects/NoteApp",
    summary:
      "A note-taking app built with a hybrid SwiftUI and UIKit architecture.",
    intent:
      "Work through core native CRUD patterns like creating, editing, saving, and reopening personal content.",
    build:
      "The codebase uses SwiftUI for app structure while pushing note editing through UIKit view controllers and local persistence logic.",
    unique:
      "It sits nicely beside JournalApp because it shows another pass at personal writing tools with a different technical shape.",
  },
  {
    title: "Taskr",
    date: "2026-01-23",
    platform: "ios",
    stack: ["SwiftUI", "OpenAI", "Task generation"],
    path: "/Users/nikkinguyen/Documents/Airdrop Folder/xCodeProjects/OpenAITodoList-main",
    summary:
      "An AI-assisted to-do app that turns a goal or prompt into structured, actionable tasks.",
    intent:
      "Reduce the blank-page problem in task planning by having AI convert vague intent into concrete checklist items.",
    build:
      "Built in SwiftUI with OpenAI-backed task generation, structured todo parsing, and checklist-style rendering.",
    unique:
      "This is a strong portfolio concept because the AI is doing a narrow, useful job instead of being bolted on generically.",
  },
  {
    title: "ReflectiveUI",
    date: "2026-01-23",
    platform: "ios",
    stack: ["SwiftUI", "SwiftUICam", "Camera-reactive UI"],
    path: "/Users/nikkinguyen/Documents/Airdrop Folder/xCodeProjects/ReflectiveUI-main",
    summary:
      "A camera-reactive UI experiment where on-screen visuals respond to captured imagery.",
    intent:
      "Test whether interface styling itself could become dynamic and context-aware through live camera input.",
    build:
      "The project uses SwiftUI with the SwiftUICam package and camera permissions to drive a reflective visual treatment.",
    unique:
      "It stands out because the camera is used to influence the interface, not just capture content for another workflow.",
  },
  {
    title: "RiveTest",
    date: "2026-01-23",
    platform: "ios",
    stack: ["SwiftUI", "Rive"],
    path: "/Users/nikkinguyen/Documents/Airdrop Folder/xCodeProjects/RiveTest",
    summary:
      "A focused testbed for integrating and controlling Rive animations in a native app.",
    intent:
      "Understand how motion tools like Rive can be embedded into your product work before using them in more serious projects.",
    build:
      "Built as a small SwiftUI app around `RiveRuntime` with animation triggers and view-state experiments.",
    unique:
      "It explains where some of the motion language in your other iOS experiments came from.",
  },
  {
    title: "Runner",
    date: "2026-01-23",
    platform: "ios",
    stack: ["SwiftUI"],
    path: "/Users/nikkinguyen/Documents/Airdrop Folder/xCodeProjects/Runner",
    summary:
      "A small native app prototype that appears to be an early shell for a running or movement-related concept.",
    intent:
      "Experiment quickly with a new app idea in SwiftUI without the overhead of a larger architecture.",
    build:
      "The repo is a compact SwiftUI app scaffold with minimal surface area.",
    unique:
      "Even though it is small, it helps show the breadth of ideas you were prototyping during this period.",
  },
  {
    title: "SlidingIntroScreen",
    date: "2026-01-23",
    platform: "ios",
    stack: ["SwiftUI", "Onboarding UI"],
    path: "/Users/nikkinguyen/Documents/Airdrop Folder/xCodeProjects/SlidingIntroScreen-main",
    summary:
      "An onboarding and intro-sequence prototype built around paged SwiftUI slides.",
    intent:
      "Refine first-run experience design and get more deliberate about how products introduce themselves to users.",
    build:
      "The project includes page models, page views, and a SwiftUI app structure dedicated to a sliding intro flow.",
    unique:
      "It gives your timeline useful UX variety by showing focused work on onboarding rather than only full apps.",
  },
  {
    title: "SpeechToTextAI",
    date: "2026-01-23",
    platform: "ios",
    stack: ["SwiftUI", "OpenAI", "AVFoundation", "Audio recording"],
    path: "/Users/nikkinguyen/Documents/Airdrop Folder/xCodeProjects/SpeechToTextAI",
    summary:
      "A voice-driven prototype that records audio and runs it through an AI-assisted text workflow.",
    intent:
      "Explore whether speaking could be a faster capture interface than typing for reflection or idea generation.",
    build:
      "Built with SwiftUI, AVFoundation-based recording and playback, and OpenAI integration for language processing.",
    unique:
      "This adds another modality to the portfolio by showing interest in voice interfaces, not just text and images.",
  },
  {
    title: "subscriptionTracker",
    date: "2026-01-23",
    platform: "ios",
    stack: ["SwiftUI", "Expense tracking"],
    path: "/Users/nikkinguyen/Documents/Airdrop Folder/xCodeProjects/subscriptionTracker",
    summary:
      "A subscription management app concept aimed at making recurring costs more visible.",
    intent:
      "Tackle a practical consumer-finance problem by giving users a clearer picture of ongoing subscriptions.",
    build:
      "The repo is organized as a standard native iOS app with tests, suggesting a more product-style setup even though the code scan is limited.",
    unique:
      "It broadens the portfolio into personal finance territory and shows another everyday utility category.",
  },
  {
    title: "DailyBrief",
    date: "2026-01-27",
    platform: "ios",
    stack: ["SwiftUI", "Google Sign-In", "Content workflows"],
    path: "/Users/nikkinguyen/Documents/xCode Project Files/DailyBrief",
    summary:
      "A more substantial native app organized around daily focus, content, and task-oriented information surfaces.",
    intent:
      "Create a high-frequency personal dashboard that condenses what matters today into one mobile experience.",
    build:
      "The codebase uses SwiftUI with multiple dedicated views, richer app structure, and third-party sign-in support.",
    unique:
      "Compared with the smaller native experiments, this reads closer to a real product with feature depth.",
  },
  {
    title: "CmdCntr",
    date: "2026-01-27",
    platform: "ios",
    stack: ["SwiftUI", "Design system", "Dashboard UI"],
    path: "/Users/nikkinguyen/Documents/xCode Project Files/CmdCntr",
    summary:
      "A command-center style native UI with a more opinionated information architecture and design-token setup.",
    intent:
      "Experiment with a system-like interface where multiple streams of information can live in one coherent surface.",
    build:
      "Structured with SwiftUI, shared design tokens, an app model, item detail views, and settings surfaces.",
    unique:
      "It is a useful companion to the web dashboard work because it shows the same instincts expressed in native form.",
  },
  {
    title: "terminalOS",
    date: "2026-02-02",
    platform: "web",
    stack: ["HTML", "CSS", "JavaScript"],
    path: "/Users/nikkinguyen/projects/terminalOS",
    summary:
      "A portfolio or interface concept built around a fake terminal and command-driven navigation.",
    intent:
      "Present projects and identity through interaction design instead of static content blocks.",
    build:
      "The repo uses a custom shell state, command handlers, and content flows that mimic a command-line environment.",
    unique:
      "This continues the strong pattern in your work of turning the portfolio wrapper into the main creative statement.",
  },
  {
    title: "LP-Optimizer",
    date: "2026-02-04",
    platform: "web",
    stack: ["Next.js", "TypeScript", "OpenAI", "Playwright", "Zod"],
    path: "/Users/nikkinguyen/projects/LP-Optimizer",
    summary:
      "A landing-page analysis tool that appears to combine automation, scraping, and AI-generated feedback.",
    intent:
      "Help evaluate product or marketing pages faster by turning qualitative critique into a repeatable workflow.",
    build:
      "The repo uses Next.js on the front end and an API route that references OpenAI, Playwright, and schema validation.",
    unique:
      "It stands out because it aims at a real workflow rather than being only a visual or interaction experiment.",
  },
  {
    title: "WordFinder",
    date: "2026-02-12",
    platform: "web",
    stack: ["JavaScript", "Static front end", "API functions"],
    path: "/Users/nikkinguyen/projects/WordFinder",
    summary:
      "A word-game or puzzle-oriented app with branding, preview imagery, and a polished static shell.",
    intent:
      "Make a playful search or puzzle experience that feels packaged enough to share beyond a dev environment.",
    build:
      "The project combines a browser app, image assets for social previews, and serverless-style API support.",
    unique:
      "It has stronger packaging than many small games because the repo already includes sharing-oriented brand assets.",
  },
  {
    title: "LetterPile",
    date: "2026-02-15",
    platform: "web",
    stack: ["JavaScript", "Dictionary data", "Leaderboard API"],
    path: "/Users/nikkinguyen/projects/LetterPile",
    summary:
      "A word-focused browser game or utility backed by a large embedded dictionary and leaderboard logic.",
    intent:
      "Explore game-like mechanics around vocabulary and competitive scoring in a lightweight web format.",
    build:
      "The repo includes a large word list, front-end logic, and an API layer for leaderboard behavior.",
    unique:
      "It builds on the word-game thread in a way that suggests repeatable interest, not just a one-off concept.",
  },
  {
    title: "OscarBettingPool",
    date: "2026-02-19",
    platform: "web",
    stack: ["Next.js", "React", "Tailwind", "Framer Motion", "Playwright"],
    path: "/Users/nikkinguyen/projects/OscarBettingPool",
    summary:
      "A themed prediction-pool app for Oscar parties with ballot flows, leaderboards, and admin controls.",
    intent:
      "Ship a time-boxed event product where delight matters as much as the data model.",
    build:
      "Built in Next.js with custom UI components, Tailwind styling, motion, and scripts for capturing welcome screenshots.",
    unique:
      "It is one of the clearest event-driven products in the set and already contains portfolio-friendly screenshots in the repo.",
  },
  {
    title: "StudioOS",
    date: "2026-02-28",
    platform: "ios",
    stack: ["SwiftUI", "Camera capture", "Studio inventory", "Workflow tracking"],
    path: "/Users/nikkinguyen/Documents/xCode Project Files/StudioOS",
    summary:
      "A studio management app for tracking pieces, kiln loads, glaze applications, and related creative workflow.",
    intent:
      "Create an operating system-style tool for ceramic or studio practice where making, documenting, and tracking work all live together.",
    build:
      "The project uses SwiftUI, onboarding, image capture, dashboard views, library management, and workflow-specific sheets for studio operations.",
    unique:
      "This is one of the strongest recent entries because it combines domain-specific product thinking with a more substantial native information architecture.",
  },
];
