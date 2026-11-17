declare const keyboardJS: keyboardJS.KeyboardJS;

declare namespace keyboardJS {
  // Events from the browser are KeyboardEvents (or FocusEvents when the
  // window loses or gains focus), but events created by pressKey,
  // releaseKey and releaseAllKeys are plain objects, so the browser event
  // properties may not exist.
  interface KeyEvent extends Partial<KeyboardEvent> {
    pressedKeys: string[];
    preventRepeat(): void;
  }

  interface KeyReleaseEvent extends Partial<KeyboardEvent> {
    pressedKeys: string[];
  }

  interface Callback {
    (this: Keyboard, event: KeyEvent): void;
  }

  interface ReleaseCallback {
    (this: Keyboard, event: KeyReleaseEvent): void;
  }

  type LocaleBuilder = (locale: Locale, platform: string, userAgent: string) => void;

  type MacroHandler = (pressedKeys: string[]) => string[];

  type WatchTarget = Document | Element;

  interface Keyboard {
    setLocale(localeName: string, localeBuilder?: LocaleBuilder): this;
    setLocale(locale: Locale): this;
    getLocale(localeName?: string): Locale | null;

    bind(
      keyCombo: string | string[] | null,
      pressed?: Callback | null,
      released?: ReleaseCallback | null,
      preventRepeatByDefault?: boolean,
    ): this;
    bind(pressed: Callback | null, released?: ReleaseCallback | null, preventRepeatByDefault?: boolean): this;
    addListener: Keyboard['bind'];
    on: Keyboard['bind'];
    bindPress(keyCombo: string | string[] | null, pressed: Callback | null, preventRepeatByDefault?: boolean): this;
    bindRelease(keyCombo: string | string[] | null, released: ReleaseCallback | null): this;

    unbind(keyCombo: string | string[] | null, pressed?: Callback | null, released?: ReleaseCallback | null): this;
    unbind(pressed?: Callback | null, released?: ReleaseCallback | null): this;
    removeListener: Keyboard['unbind'];
    off: Keyboard['unbind'];

    setContext(contextName: string): this;
    getContext(): string;
    withContext(contextName: string, callback: () => void): this;

    watch(
      targetWindow?: Window | null,
      targetElement?: WatchTarget | null,
      targetPlatform?: string | null,
      targetUserAgent?: string | null,
    ): this;
    watch(targetElement: WatchTarget, targetPlatform?: string | null, targetUserAgent?: string | null): this;
    stop(): this;

    pressKey(keyCode: number | string, event?: Partial<KeyboardEvent>): this;
    releaseKey(keyCode: number | string, event?: Partial<KeyboardEvent>): this;
    releaseAllKeys(event?: Partial<KeyboardEvent>): this;

    pause(): this;
    resume(): this;
    reset(): this;
  }

  interface KeyboardConstructor {
    new (
      targetWindow?: Window | null,
      targetElement?: WatchTarget | null,
      targetPlatform?: string | null,
      targetUserAgent?: string | null,
    ): Keyboard;
    readonly prototype: Keyboard;
  }

  interface Locale {
    localeName: string;
    activeTargetKeys: string[];
    pressedKeys: string[];

    bindKeyCode(keyCode: number, keyNames: string | string[]): void;
    bindMacro(keyComboStr: string, keyNames: string | string[] | MacroHandler): void;
    getKeyCodes(keyName: string): number[];
    getKeyNames(keyCode: number): string[];
    setKillKey(keyCode: number | string): void;
    pressKey(keyCode: number | string): void;
    releaseKey(keyCode: number | string): void;
  }

  interface LocaleConstructor {
    new (name: string): Locale;
    readonly prototype: Locale;
  }

  interface KeyCombo {
    sourceStr: string;
    subCombos: string[][];
    keyNames: string[];

    check(pressedKeyNames: string[]): boolean;
    isEqual(otherKeyCombo: KeyCombo | string): boolean;
  }

  interface KeyComboConstructor {
    new (keyComboStr: string): KeyCombo;
    readonly prototype: KeyCombo;
    comboDeliminator: string;
    keyDeliminator: string;
    parseComboStr(keyComboStr: string): string[][];
  }

  interface KeyboardJS extends Keyboard {
    Keyboard: KeyboardConstructor;
    Locale: LocaleConstructor;
    KeyCombo: KeyComboConstructor;
  }
}

export = keyboardJS;
export as namespace keyboardJS;
