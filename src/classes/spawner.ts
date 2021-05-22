//  .d8888.d8888b. .d8b. db   d8b   dbd8b   dbd88888bd8888b.   d88b.d8888.
//  88'  YP88  `8Dd8' `8b88   I8I   88888o  8888'    88  `8D   `8P'88'  YP
//  `8bo.  88oodD'88ooo8888   I8I   8888V8o 8888ooooo88oobY'    88 `8bo.
//    `Y8b.88~~~  88~~~88Y8   I8I   8888 V8o8888~~~~~88`8b      88   `Y8b.
//  db   8D88     88   88`8b d8'8b d8'88  V88888.    88 `88.db. 88 db   8D
//  `8888Y'88     YP   YP `8b8' `8d8' VP   V8PY88888P88   YDY8888P `8888Y'

// NOTES
// Conditional Rendering -- currently half-scaffolded.
// Not sure if it's possible to do realistically without a Shadow DOM implementation
// Current aim is to insert placeholder References where an element that has failed
// it's condition should go, then insert/replace using the placeholder index on
// condition update.

// =============================================================================== //
// Spawner
// =============================================================================== //

export class Spawner {
  _spawnerRootContext: HTMLElement;
  protected _spawnerRootBuildList: HTMLElement[];
  _rootEntry: HTMLElement;
  _refStore: Ref[];
  _stateStore: SpawnerStore;

  constructor(rootEntry) {
    this._refStore = []; // array for storing existing referneces
    this._rootEntry = rootEntry; // document entrypoint
    this._spawnerRootContext = null; // unusued
    this._spawnerRootBuildList = []; // the flat root SpawnChain
  }

  // SpawnStore intialiser
  store(initialState: Record<string, any>) {
    const store = new SpawnerStore(this, initialState);
    this._stateStore = store;
    return store;
  }

  // SpawnChain initiialiser, wraps the _create internal method
  create(props: any[]): SpawnChain;
  create(props: any[], attributes?: Record<string, any>): SpawnChain;
  create(props: any[], attributes?: Record<string, any>): SpawnChain {
    if (attributes == undefined) {
      return new SpawnChain(this, props, {}, this._rootEntry);
    } else {
      return new SpawnChain(this, props, attributes, this._rootEntry);
    }
  }

  _redraw() {
    console.log(this._spawnerRootBuildList);
    console.log(this._refStore);
    // this._rootEntry.innerText = "";
    // this._build(this._spawnerRootBuildList, this._rootEntry);
  }

  // Saves the reference between a Store prop and DOM element
  _saveRef(ref: Ref) {
    this._refStore.push(ref);
  }

  // Builds the DOM and returns a root element
  _build(buildList: HTMLElement[], root: HTMLElement) {
    buildList.forEach((x) => {
      if (x.dataset.display !== "0") {
        root.append(x);
      }
    });
    return root;
  }

  // Brings compiled SpawnChains from their host class into the Spawner buildchain
  _saveToRootBuildList(element: HTMLElement) {
    this._spawnerRootBuildList = [...this._spawnerRootBuildList, element];
  }

  render() {
    this._rootEntry.append(this._spawnerRootContext);
  }
}

// =============================================================================== //
// SpawnChain
// =============================================================================== //

export class SpawnChain {
  _parentSpawner: Spawner;
  _rootContext: HTMLElement;
  _buildList: HTMLElement[];
  _rootInsertion: HTMLElement;

  constructor(parent, conditions, attributes, rootInsertion) {
    this._parentSpawner = parent;
    this._buildList = [];
    this._rootInsertion = rootInsertion;
    this._rootContext = this._create(conditions, attributes);
  }

  // Create an element
  private _create(
    conditions?: any[],
    attributes?: Record<string, any>
  ): HTMLElement {
    if (attributes == undefined) attributes = {};

    const element: HTMLElement = attributes["type"]
      ? document.createElement(attributes["type"])
      : document.createElement("div");

    let statefulAttributes: StatefulAttr[] = [];

    // Build element and create any references between state and attributes
    for (let [key, val] of Object.entries(attributes)) {
      if (typeof val == "object") {
        const stateName = Object.keys(val)[0];
        statefulAttributes.push({ [key]: stateName }); // { innerText: text }
        this._parentSpawner._saveRef({
          stateName: stateName,
          attr: key,
          element: element,
        });
        element[key] = Object.values(val)[0];
      } else {
        element[key] = val;
      }
    }

    let checker = (arr) =>
      arr.every((v) => this._parentSpawner._stateStore.getState(v) === true);

    // Check that all conditions eval to true;
    // if(checker(conditions) == false) {
    //     element.dataset.display = "0"
    // } else {

    conditions.forEach((condition) => {
      const stateName = Object.keys(condition)[0];
      this._parentSpawner._saveRef({
        stateName: stateName,
        renderDependency: true,
        element: element,
      });
    });

    this._buildList.push(element); // save this particular element
    this._parentSpawner._saveToRootBuildList(element);

    return element;
  }

  // Appends an element into the SpawnChain buildlist
  append(conditions?: any[], attributes?: Record<string, any>): SpawnChain;
  append(conditions?: any[], attributes?: Record<string, any>[]): SpawnChain;
  append(conditions?: any[], attributes?: Record<string, any>): SpawnChain {
    if (attributes.length == undefined) {
      const element = this._create(conditions, attributes);

      this._buildList.push(element);
      this._rootContext.append(element);
    } else {
      attributes.forEach((x) => {
        const element = this._create(conditions, x);

        this._buildList.push(element);
        this._rootContext.append(element);
      });
    }
    return this;
  }

  // Takes a SpawnChain and joins it to the parent one
  nest(spawnChain: SpawnChain) {
    this._rootContext.append(spawnChain._rootContext);
    this._buildList = [...this._buildList, ...spawnChain._buildList];
    return this;
  }

  end() {
    if (this._parentSpawner._spawnerRootContext == null) {
      this._parentSpawner._spawnerRootContext = this._rootContext;
    } else {
      this._parentSpawner._spawnerRootContext.append(this._rootContext);
    }
  }

  // Return the built SpawnChain
  return(): HTMLElement {
    return this._parentSpawner._build(this._buildList, this._rootContext);
  }
}

// =============================================================================== //
// SpawnerStore
// =============================================================================== //

export class SpawnerStore {
  state: Record<string, any>; // proxy
  _state: any; // target
  _parent: Spawner;

  constructor(parent: Spawner, initialState: Record<string, any>) {
    this._state = {};
    this._parent = parent;

    const state: ProxyConstructor = new Proxy(this._state, {
      get: this._proxyGetHandler,
      set: this._proxySetHandler,
    });

    // set the initial State
    Object.entries(initialState).map((x) => {
      state[x[0]] = x[1];
    });

    this.state = state;
    return this;
  }

  _proxySetHandler = (obj, prop, value) => {
    obj[prop] = value;
    // this._reRender();
    return true;
  };

  _proxyGetHandler(obj, prop, receiver) {
    return { [prop]: obj[prop] };
  }

  createState<T>(stateObj: Record<string, T>) {
    const [key, val] = Object.entries(stateObj)[0];
    this.state[key] = val;
  }

  setState<T>(stateObj: Record<string, T>) {
    const [key, val] = Object.entries(stateObj)[0];

    if (key == undefined) {
      throw ReferenceError(
        `Could not find state with key '${key}'. Check for typos.`
      );
    } else {
      const currentVal = Object.values(this.state[key])[0];

      if (typeof val !== "object") {
        if (typeof currentVal !== typeof val) {
          throw new TypeError(
            `Cannot assign variable of type '${typeof val}' to state container of type '${typeof currentVal}'. State type cannot be mutated after initialising.`
          );
        } else {
          this.state[key] = val;
          this._parent._refStore.forEach((ref) => {
            if (ref.stateName == key) {
              ref.element[ref.attr] = Object.values(this.state[key])[0];
            }
          });
        }
      }
    }
  }

  computeState(stateObj, callback) {
    const [key, val] = Object.entries(stateObj)[0];
    this.setState({ [key]: callback(val) });
  }

  getState<T>(stateObj: Record<string, T>): T {
    const [key, val] = Object.entries(stateObj)[0];
    return val;
  }

  snapshot() {
    return this._state;
  }
}
