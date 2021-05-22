export class Spawner {
  _spawnerRootContext: HTMLElement;
  protected _spawnerRootBuildList: HTMLElement[];
  _rootEntry: HTMLElement;
  _refStore: Ref[];

  constructor(rootEntry) {
    this._refStore = []; // array for storing existing referneces
    this._rootEntry = rootEntry; // document entrypoint
    this._spawnerRootContext = null; // unusued
    this._spawnerRootBuildList = []; // the flat root SpawnChain
  }

  // SpawnStore intialiser
  store(initialState: Record<string, any>) {
    return new SpawnerStore(this, initialState);
  }

  // SpawnChain initiialiser, wraps the _create internal method
  create(props: any[]): SpawnChain;
  create(props: any[], options?: Record<string, any>): SpawnChain;
  create(props: any[], options?: Record<string, any>): SpawnChain {
    if (options !== undefined) {
      return new SpawnChain(this, props, {}, this._rootEntry);
    } else {
      return new SpawnChain(this, props, options, this._rootEntry);
    }
  }

  // Saves the reference between a Store prop and DOM element
  _saveRef(ref: Ref) {
    this._refStore.push(ref);
  }

  // Builds the DOM and returns a root element
  _build(buildList: HTMLElement[], root: HTMLElement) {
    buildList.forEach((x) => {
      root.append(x);
    });
    return root;
  }

  // Brings compiled SpawnChains from their host class into the Spawner buildchain
  _saveToRootBuildList(element: HTMLElement) {
    this._spawnerRootBuildList = [...this._spawnerRootBuildList, element];
  }
}

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

    for (let [key, val] of Object.entries(attributes)) {
      if (typeof val == "object") {
        const stateName = Object.keys(val)[0];
        statefulAttributes.push({ [key]: stateName }); // { innerText: text }
        this._parentSpawner._saveRef({
          stateName: stateName,
          attr: key,
          element: element,
        });
        element[key] = Object.values(val)[0]; // build element
      } else {
        element[key] = val;
      }
    }

    this._parentSpawner._saveToRootBuildList(element);
    return element;
  }

  // Appends an element into the SpawnChain buildlist
  append(propList?: any[], attributes?: Record<string, any>): SpawnChain;
  append(propList?: any[], attributes?: Record<string, any>[]): SpawnChain;
  append(propList?: any[], attributes?: Record<string, any>): SpawnChain {
    if (attributes.length == undefined) {
      this._buildList.push(this._create(propList, attributes));
    } else {
      attributes.forEach((x) => {
        this._buildList.push(this._create(propList, x));
      });
    }
    return this;
  }

  // Compiles a buildList into a root element
  _build(buildList: HTMLElement[], rootElement: HTMLElement) {
    buildList.forEach((x) => {
      rootElement.append(x);
    });
    return rootElement;
  }

  // Takes a SpawnChain and joins it to the parent one
  nest(spawnChain: SpawnChain) {
    this._buildList.push(
      this._build(spawnChain._buildList, spawnChain._rootContext)
    );
    return this;
  }

  // Append the build SpawnChain at the passed argument
  renderAt(insertionPoint: HTMLElement) {
    const builtSpawnChain = this._build(this._buildList, this._rootContext);
    insertionPoint.append(builtSpawnChain);
  }

  // Append the built SpawnChain at the defined Spawner rootInsertion
  render() {
    const builtSpawnChain = this._build(this._buildList, this._rootContext);
    this._rootInsertion.append(builtSpawnChain);
  }

  // Return the built SpawnChain
  return(): HTMLElement {
    return this._build(this._buildList, this._rootContext);
  }
}

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

  _proxyGetHandler(obj, prop) {
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
      this.state[key] = val;
      console.log(this._parent._refStore);
      this._parent._refStore.forEach((ref) => {
        if (ref.stateName == key) {
          ref.element[ref.attr] = Object.values(this.state[key])[0];
        }
      });
    }
  }

  snapshot() {
    return this._state;
  }
}
