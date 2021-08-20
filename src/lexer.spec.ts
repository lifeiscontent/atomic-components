import Lexer from "./lexer";
import * as cp from './codepoint';
import * as fs from 'fs';
import * as path from 'path';

function getNewlineLength(source: string, offset: number, code: number) {
  if (code === 13 /* \r */ && source.codePointAt(offset + 1) === 10 /* \n */) {
      return 2;
  }

  return 1;
}

function consumeEscaped(source: string, offset: number) {
  // It assumes that the U+005C REVERSE SOLIDUS (\) has already been consumed and
  // that the next input code point has already been verified to be part of a valid escape.
  offset += 2;

  // hex digit
  if (cp.isHexDigit(source.codePointAt(offset - 1)!)) {
      // Consume as many hex digits as possible, but no more than 5.
      // Note that this means 1-6 hex digits have been consumed in total.
      for (const maxOffset = Math.min(source.length, offset + 5); offset < maxOffset; offset++) {
          if (!cp.isHexDigit(source.codePointAt(offset)!)) {
              break;
          }
      }

      // If the next input code point is whitespace, consume it as well.
      const code = source.codePointAt(offset);
      if (cp.isWhitespace(code!)) {
          offset += getNewlineLength(source, offset, code!);
      }
  }

  return offset;
}

describe(Lexer, () => {
  it("parses string to tokens", () => {
    const str = fs.readFileSync(path.join(__dirname, 'escaped.css'), {encoding: 'utf-8'});
    expect(new Lexer(str).scanTokens()).toEqual([]);
  });
});
