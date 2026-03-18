const spinnerLibrary = {
  braille: {
    interval: 80,
    frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  },
  dots: {
    interval: 120,
    frames: ["⠁", "⠂", "⠄", "⠂"],
  },
  pulse: {
    interval: 100,
    frames: ["∙∙∙", "●∙∙", "∙●∙", "∙∙●"],
  },
  arc: {
    interval: 90,
    frames: ["◜", "◠", "◝", "◞", "◡", "◟"],
  },
  line: {
    interval: 100,
    frames: ["-", "\\", "|", "/"],
  },
};

export default spinnerLibrary;
