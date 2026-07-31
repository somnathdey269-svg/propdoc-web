interface BlockBodyScrollOptions {
    className?: string;
    variableName?: string;
}
declare function blockBodyScroll(option?: string | BlockBodyScrollOptions): void;

declare function exportCSV(csv: string, filename: string): void;

declare function saveAs(file: {
    name: string;
    src: string;
}): boolean;

interface UnblockBodyScrollOptions {
    className?: string;
    variableName?: string;
}
declare function unblockBodyScroll(option?: string | UnblockBodyScrollOptions): void;

declare function absolutePosition(element: HTMLElement, target: HTMLElement, gutter?: boolean): void;

declare function addClass(element: Element, className: string | undefined | null | (string | undefined | null)[]): void;

declare function addStyle(element: HTMLElement, style: string | object): void;

declare function alignOverlay(overlay: HTMLElement, target: HTMLElement, appendTo: string, calculateMinWidth?: boolean): void;

declare function appendChild(element: unknown, child: Node | Element): void;

declare function applyEventListener(element: HTMLElement, eventName: string, listener: unknown): void;

type StyleApplyOptions = {
    clear?: boolean;
};
declare function applyStyleDeclarationsSafely(element: HTMLElement, declarations: string[], options?: StyleApplyOptions): void;
declare function applyInlineStyleSafely(element: HTMLElement, style: string | Record<string, unknown>, options?: StyleApplyOptions): void;
declare const _default$1: {
    applyInlineStyleSafely: typeof applyInlineStyleSafely;
    applyStyleDeclarationsSafely: typeof applyStyleDeclarationsSafely;
};

declare function calculateBodyScrollbarWidth(): number;

declare function calculateScrollbarHeight(element?: HTMLElement): number;

declare function calculateScrollbarWidth(element?: HTMLElement): number;

declare function clearSelection(): void;

declare function createElement(type: string, attributes?: Record<string, unknown>, ...children: (string | Node)[]): HTMLElement | undefined;

/**
 * @deprecated Use `createStyleMarkup` instead.
 */
declare function createStyleAsString(css?: string, options?: Record<string, unknown>): string;

declare function createStyleElement(css: string, attributes?: Record<string, unknown>, container?: Element): HTMLStyleElement;

declare function createStyleMarkup(css?: string, attributes?: Record<string, unknown>): string;

/**
 * @deprecated Use `createStyleElement` instead.
 */
declare function createStyleTag(attributes?: Record<string, unknown>, container?: Element): HTMLStyleElement;

/**
 * HTML-escapes a value for safe interpolation into a double-quoted HTML attribute (e.g. an emitted
 * `<style nonce="…">` tag). Prevents a `"` (or `&`/`<`/`>`) in the value from breaking out of the
 * attribute context and injecting markup — the attribute-injection XSS sink.
 */
declare function escapeAttribute(value: unknown): string;

/**
 * Fades `element` in over `duration` ms.
 *
 * @returns A cancel function that stops the in-flight animation. Call it when the element unmounts
 *   mid-fade so the scheduling loop doesn't keep running and pin the detached node.
 */
declare function fadeIn(element: HTMLElement, duration: number): () => void;

/**
 * Fades `element` out over `duration` ms.
 *
 * @returns A cancel function that clears the interval. Call it when the element unmounts mid-fade
 *   so the interval doesn't keep running against a detached node.
 */
declare function fadeOut(element: HTMLElement, duration: number): () => void;

declare function find<T extends Element = HTMLElement>(element: Element, selector: string): T[];

declare function findSingle<T extends Element = HTMLElement>(element: Element, selector: string): T | null;

declare function focus(element: HTMLElement, options?: FocusOptions): void;

declare function getAttribute(element: Element, name: string): string | number | boolean | null | undefined;

type BrowserType = {
    version?: string;
    chrome?: boolean;
    webkit?: boolean;
    safari?: boolean;
    opera?: boolean;
    msie?: boolean;
    mozilla?: boolean;
    [key: string]: string | boolean | undefined;
};
declare function getBrowser(): BrowserType;

declare function getBrowserLanguage(): string;

declare function getCSSProperty(element?: HTMLElement, property?: string, inline?: boolean): string | null;

declare function getCSSVariableByRegex(variableRegex: RegExp): {
    name: string | undefined;
    value: string | undefined;
} | null;

declare function getCursorOffset(element: Element, prevText: string, nextText: string, currentText: string): {
    top: number | string;
    left: number | string;
};

declare function getFirstFocusableElement(element: Element, selector?: string): Element | null;

declare function getFocusableElements<T extends Element = HTMLElement>(element: Element, selector?: string): T[];

declare function getHeight(element: HTMLElement): number;

declare function getHiddenElementDimensions(element?: HTMLElement): {
    width: number;
    height: number;
};

declare function getHiddenElementOuterHeight(element: HTMLElement): number;

declare function getHiddenElementOuterWidth(element: HTMLElement): number;

declare function getIndex(element: HTMLElement): number;

declare function getInnerWidth(element: HTMLElement): number;

declare function getLastFocusableElement(element: Element, selector?: string): Element | null;

declare function getNextElementSibling(element: Element, selector: string): Element | null;

declare function getNextFocusableElement(container: Element, element: Element, selector?: string): Element | null;

declare function getOffset(element?: Element | null): {
    top: number | string;
    left: number | string;
};

declare function getOuterHeight(element: HTMLElement, margin?: boolean): number;

declare function getOuterWidth(element: unknown, margin?: boolean): number;

declare function getParentNode(element: Node): ParentNode | null;

declare function getParents(element: Node, parents?: ParentNode[]): ParentNode[];

declare function getPreviousElementSibling(element: Element, selector: string): Element | null;

declare function getScrollLeft(element?: HTMLElement): number;

declare function getScrollableParents(element: Element): Element[];

declare function getSelection(): string | undefined;

declare function getTargetElement(target: unknown, currentElement?: Element): Window | Document | Element | null | undefined;

declare function getUserAgent(): string;

declare function getViewport(): {
    width: number;
    height: number;
};

declare function getWidth(element: HTMLElement): number;

declare function getWindowScrollLeft(): number;

declare function getWindowScrollTop(): number;

declare function hasCSSAnimation(element: Element): boolean;

declare function hasCSSTransition(element: Element): boolean;

declare function hasClass(element: Element, className: string): boolean;

declare function invokeElementMethod<T extends keyof Element>(element: Element, methodName: T, args?: unknown[]): void;

declare function isAndroid(): boolean;

declare function isAttributeEquals(element: Element, name: string, value: unknown): boolean;

declare function isAttributeNotEquals(element: Element, name: string, value: unknown): boolean;

declare function isClickable(element: Element): boolean;

declare function isClient(): boolean;

/**
 * Checks if a given CSS property-value pair is supported by the browser.
 *
 * @param property - CSS property string
 * @param value - CSS value string
 * @returns True if supported, false otherwise
 */
declare function isCssSupported(property: keyof CSSStyleDeclaration | string, value: string): boolean;
/**
 * Checks if a given CSS condition is supported by the browser.
 *
 * @param condition - CSS condition string
 * @returns True if supported, false otherwise
 */
declare function isCssSupported(condition: string): boolean;
/**
 * Checks if a given CSS property-value pair or condition is supported by the browser.
 *
 * @param input - CSS property or condition
 * @param value - CSS value (optional)
 * @returns True if supported, false otherwise
 */
declare function isCssSupported(input: keyof CSSStyleDeclaration | string, value?: string): boolean;

declare function isElement(element: unknown): element is Element;

declare function isExist(element: Node): boolean;

declare function isFocusableElement(element: unknown, selector?: string): boolean;

declare function isHidden(element: HTMLElement): boolean;

declare function isIOS(): boolean;

declare function isPrefersReducedMotion(): boolean;

declare function isRTL(element?: HTMLElement): boolean;

declare function isServer(): boolean;

declare function isTouchDevice(): boolean;

declare function isVisible(element?: HTMLElement): boolean;

declare function nestedPosition(element: HTMLElement, level: number): void;

declare function nextFrame(): Promise<void>;

declare function relativePosition(element: HTMLElement, target: HTMLElement, gutter?: boolean, fixedOrigin?: 'top' | 'bottom' | undefined): void;

declare function remove(element: Element): void;

declare function removeAttributes(element: HTMLElement): void;

declare function removeChild(element: unknown, child: Node): void;

declare function removeClass(element: Element, className: string | undefined | null | (string | undefined | null)[]): void;

declare function removeStyleTag(element: Node): Node | null;

declare function resolveUserAgent(): {
    browser: string;
    version: string;
};

declare function scrollInView(container: HTMLElement, item: HTMLElement): void;

declare function hasUnsafeCssValue(value: unknown): boolean;
declare function isUnsafeUrlAttribute(attribute: string, value: unknown): boolean;
declare function isUnsafeHtmlAttribute(attribute: string, value: unknown): boolean;
declare const _default: {
    hasUnsafeCssValue: typeof hasUnsafeCssValue;
    isUnsafeUrlAttribute: typeof isUnsafeUrlAttribute;
    isUnsafeHtmlAttribute: typeof isUnsafeHtmlAttribute;
};

declare function setAttribute(element: HTMLElement, attribute: string | undefined, value: unknown): void;

declare function setAttributes(element: HTMLElement, attributes?: {
    [key: string]: unknown;
}): void;

declare function setCSSProperty(element?: HTMLElement, property?: string, value?: string | null, priority?: string): void;

/**
 * Converts various framework-specific element references to a DOM HTMLElement
 * Supports:
 * - React refs: { current: HTMLElement }
 * - Vue refs: { value: HTMLElement }
 * - Lit refs: { value: HTMLElement }
 * - Angular ViewChild: { nativeElement: HTMLElement }
 * - Vue template ref: { el: HTMLElement }
 * - Direct HTMLElement
 *
 * @param ref - Framework-specific element reference
 * @returns The resolved HTMLElement or undefined if not found
 */
declare function toElement(ref: unknown): HTMLElement | undefined;

export { absolutePosition, addClass, addStyle, alignOverlay, appendChild, applyEventListener, _default$1 as applyStyle, blockBodyScroll, calculateBodyScrollbarWidth, calculateScrollbarHeight, calculateScrollbarWidth, clearSelection, createElement, createStyleAsString, createStyleElement, createStyleMarkup, createStyleTag, escapeAttribute, exportCSV, fadeIn, fadeOut, find, findSingle, focus, getAttribute, getBrowser, getBrowserLanguage, getCSSProperty, getCSSVariableByRegex, getCursorOffset, getFirstFocusableElement, getFocusableElements, getHeight, getHiddenElementDimensions, getHiddenElementOuterHeight, getHiddenElementOuterWidth, getIndex, getInnerWidth, getLastFocusableElement, getNextElementSibling, getNextFocusableElement, getOffset, getOuterHeight, getOuterWidth, getParentNode, getParents, getPreviousElementSibling, getScrollLeft, getScrollableParents, getSelection, getTargetElement, getUserAgent, getViewport, getWidth, getWindowScrollLeft, getWindowScrollTop, hasCSSAnimation, hasCSSTransition, hasClass, invokeElementMethod, isAndroid, isAttributeEquals, isAttributeNotEquals, isClickable, isClient, isCssSupported, isElement, isExist, isFocusableElement, isHidden, isIOS, isPrefersReducedMotion, isRTL, isServer, isTouchDevice, isVisible, nestedPosition, nextFrame, relativePosition, remove, removeAttributes, removeChild, removeClass, removeStyleTag, resolveUserAgent, saveAs, scrollInView, _default as security, setAttribute, setAttributes, setCSSProperty, toElement, unblockBodyScroll };
