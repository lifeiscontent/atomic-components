import Lexer from "./lexer";

describe(Lexer, () => {
  it("parses string to tokens", () => {
    expect(new Lexer('"Hello world"').scanTokens()).toEqual([]);
  });
});
