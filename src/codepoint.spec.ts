import * as fc from "fast-check";
import * as cp from "./codepoint";

function apply<T extends (...args: any[]) => any>(
  fn: T
): (args: Parameters<T>) => ReturnType<T> {
  return (args: Parameters<T>) => fn(...args);
}

const codePoint = ({ min = 0, max = cp.CODE_POINT_RANGE_MAX } = {}) =>
  fc.integer({ min, max });

const codePointDigit = () =>
  fc.integer({ min: cp.DIGIT_ZERO, max: cp.DIGIT_NINE });

const codePointReverseSolidus = () => fc.constant(cp.REVERSE_SOLIDUS);

const codePointAF = () =>
  fc.integer({
    min: cp.LATIN_CAPITAL_LETTER_A,
    max: cp.LATIN_CAPITAL_LETTER_F,
  });

const codePointaf = () =>
  fc.integer({
    min: cp.LATIN_SMALL_LETTER_A,
    max: cp.LATIN_SMALL_LETTER_F,
  });

const codePointAZ = () =>
  fc.integer({
    min: cp.LATIN_CAPITAL_LETTER_A,
    max: cp.LATIN_CAPITAL_LETTER_Z,
  });

const codePointaz = () =>
  fc.integer({
    min: cp.LATIN_SMALL_LETTER_A,
    max: cp.LATIN_SMALL_LETTER_Z,
  });

const codePointExceptWhitespace = () =>
  codePoint().filter(
    (codePoint) =>
      ![cp.LINE_FEED, cp.CHARACTER_TABULATION, cp.SPACE].includes(codePoint)
  );

const codePointExceptAscii = () =>
  fc.integer({ min: cp.PADDING_CHARACTER, max: cp.CODE_POINT_RANGE_MAX });

const codePointPlusOrMinus = () =>
  fc.oneof(fc.constant(cp.PLUS_SIGN), fc.constant(cp.HYPHEN_MINUS));

const codePointNameStart = () =>
  fc.oneof(
    fc.oneof(codePointAZ(), codePointaz()),
    codePointExceptAscii(),
    fc.constant(cp.LOW_LINE)
  );

test(cp.isDigit.name, () => {
  fc.assert(fc.property(codePointDigit(), cp.isDigit));
});

test(cp.isValidEscape.name, () => {
  fc.assert(
    fc.property(
      codePointReverseSolidus(),
      codePointExceptWhitespace(),
      cp.isValidEscape
    )
  );
});

test(cp.isHexDigit.name, () => {
  fc.assert(
    fc.property(
      fc.oneof(codePointDigit(), codePointAF(), codePointaf()),
      cp.isHexDigit
    ),
    {
      verbose: true,
    }
  );
});

test(cp.isUppercaseLetter.name, () => {
  fc.assert(fc.property(codePointAZ(), cp.isUppercaseLetter));
});

test(cp.isLowercaseLetter.name, () => {
  fc.assert(fc.property(codePointaz(), cp.isLowercaseLetter));
});

test(cp.isLetter.name, () => {
  fc.assert(fc.property(fc.oneof(codePointAZ(), codePointaz()), cp.isLetter));
});

test(cp.isNonASCII.name, () => {
  fc.assert(fc.property(codePointExceptAscii(), cp.isNonASCII));
});

test(cp.isNumberStart.name, () => {
  fc.assert(
    fc.property(
      fc.oneof(
        fc.tuple(codePointPlusOrMinus(), codePointDigit(), codePoint()),
        fc.tuple(
          codePointPlusOrMinus(),
          fc.constant(cp.FULL_STOP),
          codePointDigit()
        ),
        fc.tuple(fc.constant(cp.FULL_STOP), codePointDigit(), codePoint()),
        fc.tuple(codePointDigit(), codePoint(), codePoint())
      ),
      apply(cp.isNumberStart)
    )
  );
});

test(cp.isNameStart.name, () => {
  fc.assert(fc.property(codePointNameStart(), cp.isNameStart));
});

test(cp.isIdentifierStart.name, () => {
  fc.assert(
    fc.property(
      fc.oneof(
        fc.tuple(
          fc.constant(cp.HYPHEN_MINUS),
          fc.oneof(codePointNameStart(), fc.constant(cp.HYPHEN_MINUS)),
          codePoint()
        ),
        fc.tuple(
          fc.constant(cp.HYPHEN_MINUS),
          fc.constant(cp.REVERSE_SOLIDUS),
          codePoint().filter((c) => !cp.isNewline(c))
        ),
        fc.tuple(codePointNameStart(), codePoint(), codePoint()),
        fc.tuple(
          fc.constant(cp.REVERSE_SOLIDUS),
          codePoint().filter((c) => !cp.isNewline(c)),
          codePoint()
        )
      ),
      apply(cp.isIdentifierStart)
    )
  );
});

test(cp.isNewline.name, () => {
  fc.assert(fc.property(fc.constant(cp.LINE_FEED), cp.isWhitespace));
});

test(cp.isWhitespace.name, () => {
  fc.assert(
    fc.property(
      fc.oneof(
        fc.constant(cp.LINE_FEED),
        fc.constant(cp.CHARACTER_TABULATION),
        fc.constant(cp.SPACE)
      ),
      cp.isWhitespace
    )
  );
});

test(cp.isSurrogate.name, () => {
  fc.assert(
    fc.property(fc.integer({ min: 0xd800, max: 0xdfff }), cp.isSurrogate)
  );
});

test(cp.isNull.name, () => {
  fc.assert(fc.property(fc.constant(cp.NULL), cp.isNull));
});

// test(cp.isMaximumAllowed.name, () => {
//   fc.assert(
//     fc.property(fc.constant(cp.CODE_POINT_RANGE_MAX), cp.isMaximumAllowed)
//   );
// });
