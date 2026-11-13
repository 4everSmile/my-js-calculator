import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Calculator } from "./Calculator";

const setup = () => {
  const user = userEvent.setup();
  render(<Calculator />);
  const display = screen.getByRole("status", { name: "Display" });
  const press = async (...names: string[]) => {
    for (const name of names) await user.click(screen.getByRole("button", { name }));
  };
  return { user, display, press };
};

describe("<Calculator />", () => {
  it("computes a result from button clicks", async () => {
    const { display, press } = setup();
    await press("1", "2", "Add", "3", "Equals");
    expect(display).toHaveTextContent("15");
  });

  it("clears the display", async () => {
    const { display, press } = setup();
    await press("9", "All clear");
    expect(display).toHaveTextContent("0");
  });

  it("shows an error for invalid expressions", async () => {
    const { press } = setup();
    await press("5", "Divide", "0", "Equals");
    expect(screen.getByRole("alert")).toHaveTextContent("Division by zero");
  });

  it("√ on an empty display does nothing, then digits type normally", async () => {
    const { display, press } = setup();
    await press("Square root", "5", "8");
    expect(display).toHaveTextContent(/^58$/);
  });

  it("raises to a power with the ** key", async () => {
    const { display, press } = setup();
    await press("2", "Power", "8", "Equals");
    expect(display).toHaveTextContent(/^256$/);
  });

  it("uses memory keys", async () => {
    const { display, press } = setup();
    await press("2", "Multiply", "3", "Memory add", "All clear", "1", "Add", "Memory recall", "Equals");
    expect(display).toHaveTextContent("7");
  });

  it("shows only the last 10 LCD cells of long input, dots taking no cell", async () => {
    const { user, display } = setup();
    await user.keyboard("123456789012345");
    expect(display).toHaveTextContent(/^6789012345$/);
    expect(display).toHaveAttribute("title", "123456789012345");
    await user.keyboard("{Escape}1234.5678901");
    expect(display).toHaveTextContent(/^234\.5678901$/);
  });

  it("shows operators as readable symbols, one cell each", async () => {
    const { user, display } = setup();
    await user.keyboard("9%2*3/4^6-");
    expect(display).toHaveTextContent(/^9%2×3÷4\^6−$/);
    expect(display).toHaveAttribute("title", "9%2*3/4**6-");
    // 11 cells → the oldest one scrolls off.
    await user.keyboard("7");
    expect(display).toHaveTextContent(/^%2×3÷4\^6−7$/);
  });

  it("supports keyboard input", async () => {
    const { user, display } = setup();
    await user.keyboard("2^10{Enter}");
    expect(display).toHaveTextContent("1024");
    await user.keyboard("{Backspace}{Escape}");
    expect(display).toHaveTextContent("0");
  });
});
