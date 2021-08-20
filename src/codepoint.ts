export const BACKSPACE = 8;
export const CHARACTER_TABULATION = 9;
export const CODE_POINT_RANGE_MAX = 1114111;
export const COLON = 58;
export const DELETE = 127;
export const DIGIT_NINE = 57;
export const DIGIT_ZERO = 48;
export const FULL_STOP = 46;
export const HYPHEN_MINUS = 45;
export const INFORMATION_SEPARATOR_ONE = 31;
export const LATIN_CAPITAL_LETTER_A = 65;
export const LATIN_CAPITAL_LETTER_F = 70;
export const LATIN_CAPITAL_LETTER_Z = 90;
export const LATIN_SMALL_LETTER_A = 97;
export const LATIN_SMALL_LETTER_F = 102;
export const LATIN_SMALL_LETTER_Z = 122;
export const LEFT_CURLY_BRACKET = 123;
export const LEFT_PARENTHESIS = 40;
export const LEFT_SQUARE_BRACKET = 91;
export const LINE_FEED = 10;
export const LINE_TABULATION = 11;
export const LOW_LINE = 95;
export const NULL = 0;
export const NUMBER_SIGN = 35;
export const PADDING_CHARACTER = 128;
export const PLUS_SIGN = 43;
export const QUOTATION_MARK = 34;
export const REPLACEMENT_CHARACTER = 0xfffd;
export const REVERSE_SOLIDUS = 92;
export const RIGHT_CURLY_BRACKET = 125;
export const RIGHT_PARENTHESIS = 41;
export const RIGHT_SQUARE_BRACKET = 93;
export const SEMICOLON = 59;
export const SHIFT_OUT = 14;
export const SPACE = 32;

export function isNull(codePoint: number): boolean {
  return codePoint === NULL;
}

export function isDigit(codePoint: number): boolean {
  return codePoint >= DIGIT_ZERO && codePoint <= DIGIT_NINE;
}

export function isValidEscape(
  firstCodePoint: number,
  secondCodePoint: number
): boolean {
  return firstCodePoint === REVERSE_SOLIDUS && !isNewline(secondCodePoint);
}

export function isHexDigit(codePoint: number): boolean {
  return (
    isDigit(codePoint) ||
    (codePoint >= LATIN_CAPITAL_LETTER_A &&
      codePoint <= LATIN_CAPITAL_LETTER_F) ||
    (codePoint >= LATIN_SMALL_LETTER_A && codePoint <= LATIN_SMALL_LETTER_F)
  );
}

export function isUppercaseLetter(codePoint: number): boolean {
  return (
    codePoint >= LATIN_CAPITAL_LETTER_A && codePoint <= LATIN_CAPITAL_LETTER_Z
  );
}

export function isLowercaseLetter(codePoint: number): boolean {
  return codePoint >= LATIN_SMALL_LETTER_A && codePoint <= LATIN_SMALL_LETTER_Z;
}

export function isLetter(codePoint: number): boolean {
  return isUppercaseLetter(codePoint) || isLowercaseLetter(codePoint);
}

export function isNonASCII(codePoint: number): boolean {
  return codePoint >= PADDING_CHARACTER;
}

export function isNumberStart(
  firstCodePoint: number,
  secondCodePoint: number,
  thirdCodePoint: number
): boolean {
  if (firstCodePoint === PLUS_SIGN || firstCodePoint === HYPHEN_MINUS) {
    return (
      isDigit(secondCodePoint) ||
      (secondCodePoint === FULL_STOP && isDigit(thirdCodePoint))
    );
  } else if (firstCodePoint === FULL_STOP) {
    return isDigit(secondCodePoint);
  }

  return isDigit(firstCodePoint);
}

export function isNameStart(codePoint: number): boolean {
  return isLetter(codePoint) || isNonASCII(codePoint) || codePoint === LOW_LINE;
}

export function isName(codePoint: number): boolean {
  return isNameStart(codePoint) || isDigit(codePoint) || codePoint === HYPHEN_MINUS;
}

export function isIdentifierStart(
  firstCodePoint: number,
  secondCodePoint: number,
  thirdCodePoint: number
): boolean {
  if (firstCodePoint === HYPHEN_MINUS) {
    return (
      isNameStart(secondCodePoint) ||
      secondCodePoint === HYPHEN_MINUS ||
      isValidEscape(secondCodePoint, thirdCodePoint)
    );
  } else if (isNameStart(firstCodePoint)) {
    return true;
  } else if (firstCodePoint === REVERSE_SOLIDUS) {
    return isValidEscape(firstCodePoint, secondCodePoint);
  }

  return false;
}

// export function isNonPrintable(codePoint: number): boolean {
//   return (
//     (codePoint >= NULL && codePoint <= BACKSPACE) ||
//     codePoint === LINE_TABULATION ||
//     (codePoint >= SHIFT_OUT && codePoint <= INFORMATION_SEPARATOR_ONE) ||
//     codePoint === DELETE
//   );
// }

export function isNewline(codePoint: number): boolean {
  return codePoint === LINE_FEED;
}

export function isWhitespace(codePoint: number): boolean {
  return (
    isNewline(codePoint) ||
    codePoint === CHARACTER_TABULATION ||
    codePoint === SPACE
  );
}

// export function isMaximumAllowed(codePoint: number): boolean {
//   return codePoint === CODE_POINT_RANGE_MAX;
// }

export function isSurrogate(codePoint: number): boolean {
  return codePoint >= 55296 && codePoint <= 57343;
}
