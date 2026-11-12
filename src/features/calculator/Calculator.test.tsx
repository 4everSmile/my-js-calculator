import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Calculator } from "./Calculator.tsx";

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
    await press("9", "Clear");
    expect(display).toHaveTextContent("0");
  });

  it("shows an error for invalid expressions", async () => {
    const { press } = setup();
    await press("5", "Divide", "0", "Equals");
    expect(screen.getByRole("alert")).toHaveTextContent("Division by zero");
  });

  it("supports keyboard input", async () => {
    const { user, display } = setup();
    await user.keyboard("2^10{Enter}");
    expect(display).toHaveTextContent("1024");
    await user.keyboard("{Backspace}{Escape}");
    expect(display).toHaveTextContent("0");
  });
});
