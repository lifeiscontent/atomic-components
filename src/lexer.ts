import * as CodePoint from "./codepoint";

enum TokenName {
  AT_KEYWORD,
  BAD_URL,
  BAD_STRING,
  CDC,
  CDO,
  COLON,
  COMMA,
  COMMENT,
  DELIM,
  DIMENSION,
  EOF,
  FUNCTION,
  HASH,
  IDENT,
  LEFT_CURLY_BRACKET,
  LEFT_PARENTHESIS,
  LEFT_SQUARE_BRACKET,
  NUMBER,
  PERCENTAGE,
  RIGHT_CURLY_BRACKET,
  RIGHT_PARENTHESIS,
  RIGHT_SQUARE_BRACKET,
  SEMICOLON,
  STRING,
  URL,
  WHITESPACE,
}

type TokenValue = {
  [Name in Exclude<
    TokenName,
    | TokenName.AT_KEYWORD
    | TokenName.FUNCTION
    | TokenName.HASH
    | TokenName.IDENT
    | TokenName.STRING
    | TokenName.URL
    | TokenName.DELIM
    | TokenName.DIMENSION
    | TokenName.NUMBER
    | TokenName.PERCENTAGE
  >]: undefined;
} &
  {
    [Name in Extract<
      TokenName,
      | TokenName.AT_KEYWORD
      | TokenName.FUNCTION
      | TokenName.HASH
      | TokenName.IDENT
      | TokenName.STRING
      | TokenName.URL
      | TokenName.DELIM
    >]: string;
  } &
  {
    [Name in Extract<
      TokenName,
      TokenName.DIMENSION | TokenName.NUMBER | TokenName.PERCENTAGE
    >]: number;
  };

type TokenType = {
  [Name in Exclude<
    TokenName,
    TokenName.HASH | TokenName.NUMBER | TokenName.DIMENSION
  >]: undefined;
} &
  {
    [Name in Extract<TokenName, TokenName.HASH>]: "id" | "unrestricted";
  } &
  {
    [Name in Extract<TokenName, TokenName.NUMBER | TokenName.DIMENSION>]:
      | "integer"
      | "number";
  };

type TokenUnit = {
  [Name in Exclude<TokenName, TokenName.DIMENSION>]: undefined;
} &
  {
    [Name in Extract<TokenName, TokenName.DIMENSION>]: number[];
  };

type TokenArguments = {
  [Name in TokenName]: {
    lexeme: string;
    line: number;
    name: Name;
    type: TokenType[Name];
    unit: TokenUnit[Name];
    value: TokenValue[Name];
  };
};

class Token<Name extends TokenName = TokenName> {
  constructor(
    public readonly name: Name,
    public readonly value: TokenArguments[Name]["value"],
    public readonly type: TokenArguments[Name]["type"],
    public readonly unit: TokenArguments[Name]["unit"],
    public readonly lexeme: TokenArguments[Name]["lexeme"],
    public readonly line: TokenArguments[Name]["line"]
  ) {
    if (name === TokenName.HASH && type === undefined) {
      this.type = "unrestricted" as const;
    } else if (
      (name === TokenName.NUMBER || name === TokenName.NUMBER) &&
      type === undefined
    ) {
      this.type = "integer" as const;
    }
  }

  public toString() {
    return `${this.name} ${this.lexeme} ${this.value}`;
  }
}

export default class Lexer {
  private current: number = 0;
  private start: number = 0;
  private line: number = 1;
  private tokens: Token[] = [];
  constructor(private readonly source: string) {}

  scanTokens() {
    while (!this.isAtEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.tokens.push(
      new Token(TokenName.EOF, undefined, undefined, undefined, "", this.line)
    );
    return this.tokens;
  }

  scanToken() {
    const codePoint = this.advance();
    switch (codePoint) {
      case CodePoint.QUOTATION_MARK:
        this.string();
        break;
      // case CodePoint.NUMBER_SIGN:
      //   if (
      //     CodePoint.isNameStart(this.peek()) ||
      //     CodePoint.isValidEscape(this.peek(), this.peekNext())
      //   ) {
      //     if (
      //       CodePoint.isIdentifierStart(
      //         this.peek(),
      //         this.peekNext(),
      //         this.peekNext(2)
      //       )
      //     ) {
      //       this.addToken(TokenName.HASH, undefined);
      //     }
      //     this.addToken(TokenName.HASH);
      //   }
      //   break;
      case CodePoint.LEFT_PARENTHESIS:
        this.addToken(TokenName.LEFT_PARENTHESIS);
        break;
      case CodePoint.RIGHT_PARENTHESIS:
        this.addToken(TokenName.RIGHT_PARENTHESIS);
        break;
      case CodePoint.COLON:
        this.addToken(TokenName.COLON);
        break;
      case CodePoint.SEMICOLON:
        this.addToken(TokenName.SEMICOLON);
        break;
      case CodePoint.LEFT_SQUARE_BRACKET:
        this.addToken(TokenName.LEFT_SQUARE_BRACKET);
        break;
      case CodePoint.RIGHT_SQUARE_BRACKET:
        this.addToken(TokenName.RIGHT_SQUARE_BRACKET);
        break;
      case CodePoint.LEFT_CURLY_BRACKET:
        this.addToken(TokenName.LEFT_CURLY_BRACKET);
        break;
      case CodePoint.RIGHT_CURLY_BRACKET:
        this.addToken(TokenName.RIGHT_CURLY_BRACKET);
        break;
      default:
        if (CodePoint.isWhitespace(codePoint)) {
          this.whitespace();
        } else if (
          CodePoint.isNumberStart(codePoint, this.peek(), this.peekNext())
        ) {
          this.number();
        }
    }
  }

  advance(): number {
    const codePoint = this.source.codePointAt(this.current++);
    if (codePoint === undefined) {
      throw new TypeError("called advanced at EOF");
    }
    return codePoint;
  }

  private addToken(name: TokenName): void;
  private addToken<Name extends TokenName>(
    name: Name,
    value: TokenArguments[Name]["value"]
  ): void;
  private addToken<Name extends TokenName>(
    name: Name,
    value: TokenArguments[Name]["value"],
    type: TokenArguments[Name]["type"]
  ): void;
  private addToken<Name extends TokenName>(
    name: Name,
    value: TokenArguments[Name]["value"],
    type: TokenArguments[Name]["type"],
    unit: TokenArguments[Name]["unit"]
  ): void;
  private addToken<Name extends TokenName>(
    name: Name,
    value: TokenArguments[Name]["value"] = undefined,
    type: TokenArguments[Name]["type"] = undefined,
    unit: TokenArguments[Name]["unit"] = undefined
  ): void {
    const lexeme = this.source.slice(this.start, this.current);
    this.tokens.push(new Token(name, value, type, unit, lexeme, this.line));
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private peek(): number {
    if (this.isAtEnd()) return 0;
    const codePoint = this.source.codePointAt(this.current);
    if (codePoint === undefined) {
      throw new TypeError("called peek at EOF");
    }
    return codePoint;
  }
  private peekNext(next = 1): number {
    if (this.current + next >= this.source.length) return 0;
    const codePoint = this.source.codePointAt(this.current + next);
    if (codePoint === undefined) {
      throw new TypeError("called peekNext at EOF");
    }
    return codePoint;
  }
  private whitespace(): void {
    while (CodePoint.isWhitespace(this.peek())) {
      if (CodePoint.isNewline(this.peek())) this.line++;
      this.advance();
    }

    this.addToken(TokenName.WHITESPACE);
  }
  escapedOffset(): number {
    const next = this.advance();
    if (CodePoint.isHexDigit(next)) {
      for (let i = 0; i < 5; i++) {
        if (!CodePoint.isHexDigit(this.peek())) {
          break;
        }

        this.advance();
      }

      const hexDigits = parseInt(
        this.source.substring(this.start + 1, this.current),
        16
      );

      if (CodePoint.isWhitespace(this.peek())) {
        this.advance();
      }

      if (
        hexDigits === 0 ||
        CodePoint.isSurrogate(hexDigits) ||
        hexDigits > CodePoint.CODE_POINT_RANGE_MAX
      ) {
        return -1;
      } else {
        return this.current;
      }
    } else if (this.isAtEnd()) {
      return -1;
    } else {
      return this.current;
    }
  }

  private name() {
    let result = '';

    const start = this.start;
    const next = this.start + 1;

    while(true) {
      const next = this.advance();
      if(CodePoint.isName(next)) {
        result += String.fromCodePoint(next);
      } else if (CodePoint.isValidEscape(codePoint, next)) {}
    }
  }

  private string(): void {
    while (this.peek() !== 34 && !this.isAtEnd()) {
      if (this.peek() === 10) this.line++;
      this.advance();
    }

    if (this.isAtEnd()) {
      throw new SyntaxError(`Unterminated string at line: ${this.line}.`);
    }

    this.advance();

    this.addToken(
      TokenName.STRING,
      this.source.substring(this.start + 1, this.current - 1)
    );
  }
  // private escaped(): string {
  //   while (CodePoint.isHexDigit(this.peek())) this.advance();
  // }
  // private name(): string {
  //   while (
  //     CodePoint.isName(this.peek()) ||
  //     CodePoint.isValidEscape(this.current, this.peek())
  //   )
  //     this.advance();

  //   return this.source.substring(this.start, this.current);
  // }
  private number(): void {
    while (CodePoint.isDigit(this.peek())) this.advance();

    // Look for a fractional part.
    if (this.peek() == 46 && CodePoint.isDigit(this.peekNext())) {
      // Consume the '.'
      this.advance();

      while (CodePoint.isDigit(this.peek())) this.advance();
      // Look for a 'e' or 'E'
      if (this.peek() === 69 || this.peek() === 101) {
        // Consume the 'e' or 'E'
        this.advance();
        // look for '+' or '-'
        if (this.peek() === 43 || this.peek() === 45) {
          // Consume the '+' or '-'
          this.advance();
        }

        while (CodePoint.isDigit(this.peek())) this.advance();
      }
    }

    this.addToken(
      TokenName.NUMBER,
      Number(this.source.substring(this.start, this.current))
    );
  }
}
