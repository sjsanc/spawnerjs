export class Spawner {
  _spawnerRootContext: HTMLElement;
  protected _spawnerRootBuildList: HTMLElement[];

  _rootEntry: HTMLElement; // document entrypoint

  _refStore: any[]; // array for storing existing referneces

  constructor(rootEntry) {
    this._refStore = []; // array for storing existing referneces
    this._rootEntry = rootEntry;
    this._spawnerRootContext = null;
    this._spawnerRootBuildList = [];
  }

  store(initialState: Record<string, any>) {
    return new SpawnerStore(initialState);
  }

  create(options?: Record<string, any>): SpawnChain;
  create(props?: any[], options?: Record<string, any>): SpawnChain;
  create(props?: any[], options?: Record<string, any>): SpawnChain {
    return new SpawnChain(this, props, (options = {}), this._rootEntry);
  }

  _saveRef(ref: any) {
    this._refStore.push(ref);
  }

  _reRender() {
    // console.log(this._spawnerRootBuildList);
    // this._spawnerRootBuildList.forEach((x) => {
    //   this._rootEntry.append(x);
    // });
  }

  _build(buildList: HTMLElement[], root: HTMLElement) {
    buildList.forEach((x) => {
      root.append(x);
    });
    return root;
  }

  _saveToRootBuildList(element: HTMLElement) {
    this._spawnerRootBuildList = [...this._spawnerRootBuildList, element];
  }
}

export class SpawnChain {
  _parentSpawner: Spawner;
  _rootContext: HTMLElement;
  _buildList: HTMLElement[];
  _rootInsertion: HTMLElement;
  _propList: any[];

  constructor(parent, props, options, rootInsertion) {
    this._parentSpawner = parent;
    this._rootContext = this._create(options);
    this._buildList = [];
    this._rootInsertion = rootInsertion;
    this._propList = props;
  }

  // Create an element
  private _create(options?: Record<string, any>): HTMLElement {
    const element: HTMLElement = options["type"]
      ? document.createElement(options["type"])
      : document.createElement("div");

    // Assign attributes from options obj
    Object.entries(options).map(([key, val]) => {
      key !== "type" ? (element[key.toString()] = val) : null;
    });

    // if props are passed in, save them alongside element refernece to Spawner
    if (this._propList && this._propList.length > 0) {
      this._parentSpawner._saveRef({
        stateRef: this._propList,
        element: element,
      });
    }

    this._parentSpawner._saveToRootBuildList(element);
    return element;
  }

  // Appends an element into the SpawnChain buildlist
  append(options: Record<string, any>): SpawnChain;
  append(options: Record<string, any>[]): SpawnChain;
  append(options: Record<string, any>): SpawnChain {
    if (options.length == undefined) {
      this._buildList.push(this._create(options));
    } else {
      options.forEach((x) => {
        this._buildList.push(this._create(x));
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
  state: any; // proxy
  _state: any; // target

  constructor(initialState: Record<string, any>) {
    this._state = {};

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
    console.log("LOL");
    // this._reRender();
    return true;
  };

  _proxyGetHandler(obj, prop) {
    console.log("GET");
    // return Object.entries(obj.states).find((x) => x[0] == prop);
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
    }
  }
}
