/** Number of character cells on the LCD. */
export const LCD_CELLS = 10;

/** Cells a string uses on the LCD: "." lights the previous cell's decimal point, so it takes none. */
export const cellCount = (text: string): number => text.replaceAll(".", "").length;
