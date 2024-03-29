import { createStyles, styles } from "@dash-ui/styles";
import transition from "./index";

afterEach(() => {
  styles.dash.sheet.flush();
  document.getElementsByTagName("html")[0].innerHTML = "";
});

describe("transition()", () => {
  it("should write styles to the DOM", () => {
    const fade = transition(styles, {
      in: {
        opacity: 0,
        duration: 300,
      },
    });

    fade("in");
    expect(document.querySelectorAll(`style[data-dash]`).length).toBe(1);
    expect(document.querySelectorAll(`style[data-dash]`)[0]).toMatchSnapshot();
  });

  it("should return class name", () => {
    const fade = transition(styles, {
      in: {
        opacity: 0,
        duration: 300,
      },
    });

    expect(fade("in")).toMatchSnapshot();
  });

  it("should override default duration", () => {
    const fade = transition(styles, {
      default: {
        duration: 100,
      },
      in: {
        opacity: 0,
        duration: 300,
      },
    });

    expect(fade.css("in")).toMatchSnapshot();
  });

  it("should override default timing", () => {
    const fade = transition(styles, {
      default: {
        timing: "linear",
        duration: 100,
      },
      in: {
        opacity: 0,
        timing: "ease-in",
      },
    });

    expect(fade.css("in")).toMatchSnapshot();
  });

  it("should allow cubic-bezier arrays for timing", () => {
    const fade = transition(styles, {
      default: {
        opacity: 1,
        timing: [0.4, 0.0, 1, 1],
        duration: 100,
      },
      in: {
        opacity: 0,
        timing: [0.1, 0.0, 1, 1],
      },
    });

    expect(fade.css("in")).toMatchSnapshot("0.1, 0.0, 1, 1");
    expect(fade.css()).toMatchSnapshot("0.4, 0.0, 1, 1");
  });

  it("should override default delay", () => {
    const fade = transition(styles, {
      default: {
        delay: 100,
        duration: 100,
      },
      in: {
        opacity: 0,
        delay: 300,
      },
    });

    expect(fade.css("in")).toMatchSnapshot();
  });

  it("should ignore null values", () => {
    const fade = transition(styles, {
      default: {
        delay: 100,
        duration: 100,
      },
      in: {
        opacity: null,
        y: 0,
        delay: 300,
      },
    });

    expect(fade.css("in")).toMatchSnapshot();
  });

  it("should have special handling for transforms", () => {
    const transforms = {
      matrix: [1, 1],
      matrix3d: [1, 1, 1],
      perspective: 1,
      rotate: 1,
      rotateX: 1,
      rotateY: 1,
      rotateZ: 1,
      scale: [1, 1],
      scaleX: 1,
      scaleY: 1,
      scaleZ: 1,
      scale3d: [1, 1, 1],
      skew: [1, 1],
      skewX: 1,
      skewY: 1,
      translate3d: [1, 1, 1],
      translate: [1, 1],
      x: 1,
      y: 1,
      z: 1,
    };

    for (const [key, value] of Object.entries(transforms)) {
      const t = transition(styles, {
        default: {
          duration: 100,
        },
        in: {
          [key]: value,
        },
      });

      expect(t.css("in")).toMatchSnapshot();
    }
  });

  it("should concat multiple transforms", () => {
    const t = transition(styles, {
      default: {
        duration: 100,
      },
      in: {
        x: 12,
        y: 13,
        matrix: [1, 1],
      },
    });

    expect(t.css("in")).toMatchSnapshot();
  });

  it("should concat multiple transitions", () => {
    const t = transition(styles, {
      default: {
        duration: 100,
      },
      slide: {
        x: 12,
        y: 13,
        matrix: [1, 1],
      },
      fadeIn: {
        opacity: 1,
        duration: 50,
      },
      fadeOut: {
        opacity: 0,
        duration: 30,
      },
    });

    expect(t.css("slide", "fadeOut", "fadeIn")).toMatchSnapshot();
  });

  it("should create transitions from object arguments", () => {
    const t = transition(styles, {
      default: {
        duration: 100,
      },
      slide: {
        x: 12,
        y: 13,
        matrix: [1, 1],
      },
      fadeIn: {
        opacity: 1,
        duration: 50,
      },
      fadeOut: {
        opacity: 0,
        duration: 30,
      },
    });

    expect(
      t.css({ slide: true, fadeIn: true }, { fadeOut: false })
    ).toMatchSnapshot();
  });

  it("should compose transitions", () => {
    const slow = transition(styles, {
      default: {
        duration: 1000,
      },
    });

    const t = transition(styles, {
      ...slow.transitions,
      slide: {
        x: 12,
        y: 13,
        matrix: [1, 1],
      },
      fadeIn: {
        opacity: 1,
      },
      fadeOut: {
        opacity: 0,
      },
    });

    expect(
      t.css({ slide: true, fadeIn: true }, { fadeOut: false })
    ).toMatchSnapshot();
  });

  it("should compose transitions to style object", () => {
    const t = transition(styles, {
      default: {
        duration: 1000,
      },
      slide: {
        x: 12,
        y: 13,
        matrix: [1, 1],
        duration: 300,
      },
      fadeIn: {
        opacity: 1,
      },
      fadeOut: {
        opacity: 0,
      },
    });

    expect(
      t.style({ slide: true, fadeIn: true }, { fadeOut: false })
    ).toMatchSnapshot();
  });

  it("should create default phase with a function", () => {
    type Tokens = {
      duration: {
        slow: 1000;
      };
    };

    const myStyles = createStyles<Tokens>();
    myStyles.insertTokens({
      duration: {
        slow: 1000,
      },
    });

    const t = transition(myStyles, {
      default: ({ duration }) => ({
        duration: duration.slow,
      }),
      slide: {
        x: 12,
        y: 13,
        matrix: [1, 1],
      },
    });

    expect(t.style("slide")).toMatchSnapshot();
  });

  it("should create phase with a function", () => {
    type Tokens = {
      duration: {
        slow: 1000;
      };
    };

    const myStyles = createStyles<Tokens>();
    myStyles.insertTokens({
      duration: {
        slow: 1000,
      },
    });

    const t = transition(myStyles, {
      default: {
        duration: 300,
      },
      slide: ({ duration }) => ({
        x: 12,
        y: 13,
        matrix: [1, 1],
        duration: duration.slow,
      }),
      fadeIn: {
        opacity: 1,
      },
      fadeOut: {
        opacity: 0,
      },
    });

    expect(t.style("slide")).toMatchSnapshot();
  });

  it("should have a transform-origin shortcut", () => {
    const myStyles = createStyles();

    const t = transition(myStyles, {
      default: {
        origin: "center",
      },
      zoomIn: {
        scale: 2,
      },
      zoomOut: {
        scale: 0.2,
        origin: [20, "top"],
      },
    });

    expect(t.style("zoomIn").transformOrigin).toBe("center");
    expect(t.style("zoomOut").transformOrigin).toBe("20px top");
  });

  it("should use a transform-origin array", () => {
    const myStyles = createStyles();

    const t = transition(myStyles, {
      default: {
        origin: [20, "top"],
      },
      zoomIn: {
        scale: 2,
      },
    });

    expect(t.style({ zoomIn: true }).transformOrigin).toBe("20px top");
  });
});
