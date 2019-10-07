import { loadEvents } from "@qawolf/fixtures";
import {
  buildClickSteps,
  buildScrollStep,
  buildSequenceSteps,
  buildSteps,
  buildTypeStep,
  findActionEvents,
  getEventAction,
  groupEventSequences,
  isMouseDownEvent,
  isScrollEvent,
  isTypeEvent
} from "./buildSteps";
import { QAEventWithTime } from "../events";
import { loginSteps } from "../fixtures/loginJob";

describe("buildClickSteps", () => {
  test("returns steps for all clicks if no next sequence", () => {
    const eventSequence = {
      action: "click" as "click",
      events: [
        {
          data: {
            properties: {
              id: "button"
            }
          },
          pageId: 0
        } as QAEventWithTime,
        {
          data: {
            properties: {
              id: "button"
            }
          },
          pageId: 0
        } as QAEventWithTime
      ],
      xpath: "button"
    };

    expect(buildClickSteps(eventSequence, null)).toMatchObject([
      {
        action: "click",
        locator: { id: "button" },
        pageId: 0
      },
      {
        action: "click",
        locator: { id: "button" },
        pageId: 0
      }
    ]);
  });

  test("returns steps for all clicks if next group not typing", () => {
    const eventSequence = {
      action: "click" as "click",
      events: [
        {
          data: {
            properties: {
              id: "button"
            }
          },
          pageId: 0
        } as QAEventWithTime,
        {
          data: {
            properties: {
              id: "button"
            }
          },
          pageId: 0
        } as QAEventWithTime
      ],
      xpath: "button"
    };

    const nextGroup = {
      action: "scroll" as "scroll",
      events: [
        {
          data: { y: 100 },
          pageId: 0
        } as QAEventWithTime
      ],
      xpath: "button"
    };

    expect(buildClickSteps(eventSequence, nextGroup)).toMatchObject([
      { action: "click", locator: { id: "button" }, pageId: 0 },
      { action: "click", locator: { id: "button" }, pageId: 0 }
    ]);
  });

  test("returns steps for all clicks if next group is different element", () => {
    const eventSequence = {
      action: "click" as "click",
      events: [
        {
          data: {
            properties: {
              id: "button"
            }
          },
          pageId: 0
        } as QAEventWithTime,
        {
          data: {
            properties: {
              id: "button"
            }
          },
          pageId: 0
        } as QAEventWithTime
      ],
      xpath: "button"
    };

    const nextGroup = {
      action: "click" as "click",
      events: [
        {
          data: {
            properties: {
              id: "anotherButton"
            }
          },
          pageId: 0
        } as QAEventWithTime
      ],
      xpath: "anotherButton"
    };

    expect(buildClickSteps(eventSequence, nextGroup)).toMatchObject([
      {
        locator: { id: "button" },
        pageId: 0,
        action: "click"
      },
      {
        locator: { id: "button" },
        pageId: 0,
        action: "click"
      }
    ]);
  });

  test("does not include last click if next group is typing into same element", () => {
    const eventSequence = {
      action: "click" as "click",
      events: [
        {
          data: {
            properties: {
              id: "input"
            }
          },
          pageId: 0
        } as QAEventWithTime,
        {
          data: {
            properties: {
              id: "input"
            }
          },
          pageId: 0
        } as QAEventWithTime
      ],
      xpath: "input"
    };

    const nextGroup = {
      action: "type" as "type",
      events: [
        {
          data: {
            properties: {
              id: "button"
            },
            text: "spirit"
          },
          pageId: 0
        } as QAEventWithTime
      ],
      xpath: "input"
    };

    expect(buildClickSteps(eventSequence, nextGroup)).toMatchObject([
      {
        action: "click",
        locator: { id: "input" },
        pageId: 0
      }
    ]);
  });
});

describe("buildScrollStep", () => {
  test("returns null if not enough actions", () => {
    const eventSequence = {
      action: "scroll" as "scroll",
      events: [
        {
          data: { y: 0 }
        } as QAEventWithTime
      ],
      xpath: null
    };

    expect(buildScrollStep(eventSequence)).toBeNull();
  });

  test("returns last scroll step if scrolling down", () => {
    const eventSequence = {
      action: "scroll" as "scroll",
      events: [
        {
          data: { y: 0 },
          pageId: 0
        } as QAEventWithTime,
        {
          data: { y: 150 },
          pageId: 0
        } as QAEventWithTime,
        {
          data: { y: 100 },
          pageId: 0
        } as QAEventWithTime
      ],
      xpath: null
    };

    expect(buildScrollStep(eventSequence)).toMatchObject({
      action: "scroll",
      locator: { xpath: "scroll" },
      pageId: 0,
      scrollDirection: "down",
      scrollTo: 100
    });
  });

  test("returns last scroll step if scrolling up", () => {
    const eventSequence = {
      action: "scroll" as "scroll",
      events: [
        {
          data: { y: 100 },
          pageId: 0
        } as QAEventWithTime,
        {
          data: { y: 150 },
          pageId: 0
        } as QAEventWithTime,
        {
          data: { y: 0 },
          pageId: 0
        } as QAEventWithTime
      ],
      xpath: null
    };

    expect(buildScrollStep(eventSequence)).toMatchObject({
      action: "scroll",
      locator: { xpath: "scroll" },
      pageId: 0,
      scrollDirection: "up",
      scrollTo: 0
    });
  });
});

describe("buildSequenceSteps", () => {
  test("returns correct steps for action groups", async () => {
    const events = await loadEvents("login");
    const actionEvents = findActionEvents(events);
    const eventSequences = groupEventSequences(actionEvents);

    const steps = buildSequenceSteps(eventSequences);
    expect(steps).toMatchObject(loginSteps);
  });
});

describe("buildTypeStep", () => {
  test("returns buildted type step", () => {
    const eventSequence = {
      action: "type" as "type",
      events: [
        {
          data: {
            properties: {
              id: "username"
            },
            text: "s"
          },
          pageId: 0
        } as QAEventWithTime,
        {
          data: {
            properties: {
              id: "username"
            },
            text: "sp"
          },
          pageId: 0
        } as QAEventWithTime
      ],
      xpath: "username"
    };

    expect(buildTypeStep(eventSequence)).toMatchObject({
      action: "type",
      locator: {
        id: "username"
      },
      pageId: 0,
      value: "sp"
    });
  });
});

describe("findActionEvents", () => {
  test("returns only click, scroll, and type events", async () => {
    const events = await loadEvents("login");
    expect(events).toHaveLength(135);

    const filteredEvents = findActionEvents(events);
    expect(filteredEvents).toHaveLength(83);
  });
});

describe("getEventAction", () => {
  test("returns click if click action", () => {
    const action = {
      data: {
        isTrusted: true,
        source: 2,
        type: 1
      }
    } as QAEventWithTime;

    expect(getEventAction(action)).toBe("click");
  });

  test("returns scroll if scroll action", () => {
    const action = {
      data: { source: 3, id: 1 }
    } as QAEventWithTime;

    expect(getEventAction(action)).toBe("scroll");
  });

  test("returns type if type action", () => {
    const action = {
      data: { source: 5, isTrusted: true, text: "spirit" }
    } as QAEventWithTime;

    expect(getEventAction(action)).toBe("type");
  });

  test("throws error if action type not found", () => {
    expect(() => {
      getEventAction({ data: { source: 11 } } as QAEventWithTime);
    }).toThrowError();
  });
});

describe("groupEventSequences", () => {
  test("returns actions grouped by element and type", async () => {
    const events = await loadEvents("login");
    const actions = findActionEvents(events);
    const eventSequences = groupEventSequences(actions);

    expect(eventSequences).toHaveLength(10);

    expect(eventSequences[0].action).toBe("scroll");
    expect(eventSequences[0].events).toHaveLength(41);

    expect(eventSequences[1]).toMatchObject({
      action: "click",
      xpath: "//*[@id='content']/ul/li[18]/a"
    });
    expect(eventSequences[1].events).toHaveLength(1);

    expect(eventSequences[2]).toMatchObject({
      action: "click",
      xpath: "//*[@id='username']"
    });
    expect(eventSequences[2].events).toHaveLength(1);

    expect(eventSequences[3]).toMatchObject({
      action: "type",
      xpath: "//*[@id='username']"
    });
    expect(eventSequences[3].events).toHaveLength(8);

    expect(eventSequences[4]).toMatchObject({
      action: "click",
      xpath: "//*[@id='login']/button"
    });
    expect(eventSequences[4].events).toHaveLength(1);

    expect(eventSequences[5]).toMatchObject({
      action: "click",
      xpath: "//*[@id='username']"
    });
    expect(eventSequences[5].events).toHaveLength(1);

    expect(eventSequences[6]).toMatchObject({
      action: "type",
      xpath: "//*[@id='username']"
    });
    expect(eventSequences[6].events).toHaveLength(8);

    expect(eventSequences[7]).toMatchObject({
      action: "click",
      xpath: "//*[@id='password']"
    });
    expect(eventSequences[7].events).toHaveLength(1);

    expect(eventSequences[8]).toMatchObject({
      action: "type",
      xpath: "//*[@id='password']"
    });
    expect(eventSequences[8].events).toHaveLength(20);

    expect(eventSequences[9]).toMatchObject({
      action: "click",
      xpath: "//*[@id='login']/button/i"
    });
    expect(eventSequences[9].events).toHaveLength(1);
  });
});

describe("isMouseDownEvent", () => {
  test("returns false if event undefined", () => {
    expect(isMouseDownEvent()).toBe(false);
  });

  test("returns false if no data", () => {
    const event = {} as QAEventWithTime;

    expect(isMouseDownEvent(event)).toBe(false);
  });

  test("returns false if data source not mouse interaction", () => {
    const event = {
      data: {
        source: 1
      }
    } as QAEventWithTime;

    expect(isMouseDownEvent(event)).toBe(false);
  });

  test("returns false if data type not mouse down", () => {
    const event = {
      data: {
        source: 2,
        type: 2
      }
    } as QAEventWithTime;

    expect(isMouseDownEvent(event)).toBe(false);
  });

  test("returns false if data not trusted", () => {
    const event = {
      data: {
        isTrusted: false,
        source: 2,
        type: 1
      }
    } as QAEventWithTime;

    expect(isMouseDownEvent(event)).toBe(false);
  });

  test("returns true if mouse down event", () => {
    const event = {
      data: {
        isTrusted: true,
        source: 2,
        type: 1
      }
    } as QAEventWithTime;

    expect(isMouseDownEvent(event)).toBe(true);
  });
});

describe("isScrollEvent", () => {
  test("returns false if event undefined", () => {
    expect(isScrollEvent()).toBe(false);
  });

  test("returns false if no data", () => {
    const event = {} as QAEventWithTime;

    expect(isScrollEvent(event)).toBe(false);
  });

  test("returns false if data source not scroll", () => {
    const event = {
      data: { source: 2 }
    } as QAEventWithTime;

    expect(isScrollEvent(event)).toBe(false);
  });

  test("returns false if scroll not on page body", () => {
    const event = {
      data: { source: 3, id: 11 }
    } as QAEventWithTime;

    expect(isScrollEvent(event)).toBe(false);
  });

  test("returns true if scroll on page body event", () => {
    const event = {
      data: { source: 3, id: 1 }
    } as QAEventWithTime;

    expect(isScrollEvent(event)).toBe(true);
  });
});

describe("isTypeEvent", () => {
  test("returns false if event undefined", () => {
    expect(isTypeEvent()).toBe(false);
  });

  test("returns false if no data", () => {
    const event = {} as QAEventWithTime;

    expect(isTypeEvent(event)).toBe(false);
  });

  test("returns false if data source not input", () => {
    const event = {
      data: { source: 2 }
    } as QAEventWithTime;

    expect(isTypeEvent(event)).toBe(false);
  });

  test("returns false if data not trusted", () => {
    const event = {
      data: { source: 5, isTrusted: false }
    } as QAEventWithTime;

    expect(isTypeEvent(event)).toBe(false);
  });

  test("returns false if no text", () => {
    const event = {
      data: { source: 5, isTrusted: true }
    } as QAEventWithTime;

    expect(isTypeEvent(event)).toBe(false);
  });

  test("returns true if type event", () => {
    const event = {
      data: { source: 5, isTrusted: true, text: "spirit" }
    } as QAEventWithTime;

    expect(isTypeEvent(event)).toBe(true);
  });

  test("returns true if type event with empty string", () => {
    const event = {
      data: { source: 5, isTrusted: true, text: "" }
    } as QAEventWithTime;

    expect(isTypeEvent(event)).toBe(true);
  });
});

describe("buildSteps", () => {
  test("returns steps from events", async () => {
    const events = await loadEvents("login");

    const steps = buildSteps(events);
    expect(steps).toMatchObject(loginSteps);
  });
});