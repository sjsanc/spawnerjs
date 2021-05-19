interface Store {
  reference: string;
  element: HTMLElement;
}

class SpawnerElement {
  //  REWRITE SO THAT CREATE returns a spawnerElement
  // This will allow for the "creation chain" to be exist only after a create is called
}

export class Spawner {
  _context: HTMLElement;
  _buildList: HTMLElement[];
  _proxy: ProxyConstructor;
  _proxyTarget: any;
  _store: Store[];

  constructor() {
    this._context = null;
    this._buildList = [];
    this._store = []; // change to Ref store
    this._proxyTarget = {};
    this._proxy = new Proxy(this._proxyTarget, {});

    // Implement some sort of state, to allow for conditional rendering
  }

  create(options?: Record<string, any>): Spawner {
    this._context = null;
    this._context = this._create(options);
    return this;
  }

  private _create(options?: Record<string, any>): HTMLElement {
    const element: HTMLElement = options["type"]
      ? document.createElement(options["type"])
      : document.createElement("div");

    Object.entries(options).map(([key, val]) => {
      key !== "type" ? (element[key.toString()] = val) : null;
    });

    if (typeof options["ref"] == "string") {
      let reference: string = options["ref"];
      this._store.push({ reference, element });
    }

    return element;
  }

  insertInto(target: Element): HTMLElement {
    if (this._buildList.length > 0) {
      this._buildList.forEach((x) => {
        this._context.append(x);
      });
    }
    target.append(this._context);

    let tempContext = this._context;
    this._context = null;
    this._buildList = [];
    return tempContext;
  }

  append(options: Record<string, any>) {
    this._buildList.push(this._create(options));
    return this;
  }

  get(ref: string) {
    const element = this._getRef(ref);
    if (this._getRef(ref)) {
      return element.element;
    } else {
      return undefined;
    }
  }

  private _getRef(ref: string) {
    return this._store.find((x) => x.reference == ref) || null;
  }

  register(cb: any, ref: any) {
    const elem = typeof ref == "string" ? this._getRef(ref).element : ref;
    if (elem !== "undefined") {
      const observer = new MutationObserver(function (mutations) {
        mutations.forEach((mutation) => {
          cb();
        });
      });
      observer.observe(elem, {
        characterData: false,
        attributes: true,
        childList: true,
        subtree: false,
      });
    }
  }
}
