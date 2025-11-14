type CSSColorProperty =
  | 'accentColor'
  | 'backgroundColor'
  | 'border'
  | 'borderBlock'
  | 'borderBlockColor'
  | 'borderBlockEnd'
  | 'borderBlockEndColor'
  | 'borderBlockStart'
  | 'borderBlockStartColor'
  | 'borderBottom'
  | 'borderBottomColor'
  | 'borderColor'
  | 'borderInline'
  | 'borderInlineColor'
  | 'borderInlineEnd'
  | 'borderInlineEndColor'
  | 'borderInlineStart'
  | 'borderInlineStartColor'
  | 'borderLeft'
  | 'borderLeftColor'
  | 'borderRight'
  | 'borderRightColor'
  | 'borderTop'
  | 'borderTopColor'
  | 'caret'
  | 'caretColor'
  | 'color'
  | 'columnRule'
  | 'columnRuleColor'
  | 'outline'
  | 'outlineColor'
  | 'textDecorationColor'
  | 'textEmphasis'
  | 'textEmphasisColor'
  | 'mozBorderBottomColors'
  | 'mozBorderLeftColors'
  | 'mozBorderRightColors'
  | 'mozBorderTopColors'
  | 'msScrollbar3dlightColor'
  | 'msScrollbarArrowColor'
  | 'msScrollbarBaseColor'
  | 'msScrollbarDarkshadowColor'
  | 'msScrollbarFaceColor'
  | 'msScrollbarHighlightColor'
  | 'msScrollbarShadowColor'
  | 'msScrollbarTrackColor'
  | 'webkitBorderBefore'
  | 'webkitBorderBeforeColor'
  | 'webkitTapHighlightColor'
  | 'webkitTextFillColor'
  | 'webkitTextStroke'
  | 'webkitTextStrokeColor'
  | 'floodColor'
  | 'lightingColor'
  | 'stopColor'

type Variant = 'pale' | 'bright'

/**
 * Creates CSS classes to apply a color pulse animation for a warning, alarm, or critical condition
 * to the given CSS property.
 * @param {Object} options
 * @param {string} options.property - the camel-cased CSS property to animate (e.g. `backgroundColor`)
 * @param {string} options.variant - which set of colors to use:
 *   - 'pale' - light, less saturated colors (used for gauge backgrounds)
 *   - 'bright' - fully saturated colors
 * @returns an object with `info`, `warning`, `alarm`, and `critical` properties (as well as upper case variants),
 * which are CSS class names.  The `info` class doesn't apply an animation, but is provided for convenience
 * since `info` is one of the severity enum constants.
 */
export function useSeverityPulseStyles(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options: {
    property: CSSColorProperty
    variant: Variant
  }
) {
  return {
    info: '',
    warning: '',
    alarm: '',
    critical: '',
    INFO: '',
    WARNING: '',
    ALARM: '',
    CRITICAL: '',
  }
}
