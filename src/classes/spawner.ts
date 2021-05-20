export class Spawner {
  _spawnerRootContext: HTMLElement;
  protected _spawnerRootBuildList: HTMLElement[];

  _rootEntry: HTMLElement; // document entrypoint
  _refStore: SpawnerRef[]; // array for storing existing referneces
  _store: Record<string, any>; // array for storing spawner state

  _proxyHandler: any; // proxy handler
  _proxy: any;

  constructor(rootEntry) {
    this._refStore = []; // array for storing existing referneces
    this._store = {}; // array for storing spawner state
    this._rootEntry = rootEntry;
    this._spawnerRootContext = null;
    this._spawnerRootBuildList = [];
    this._proxy = null;
  }

  _proxySetHandler = (obj, prop, value) => {
    obj[prop] = value;
    this._reRender();
    return true;
  };

  _proxyGetHandler(obj, prop) {
    if (Object.values(obj).length == 1) return Object.values(obj)[0];
    else return Object.values(obj);
  }

  store(initialState: Record<string, any>) {
    this._store = initialState;
    return (this._proxy = new Proxy(this._store, {
      get: this._proxyGetHandler,
      set: this._proxySetHandler,
    }));
  }

  create(options?: Record<string, any>): SpawnChain {
    return new SpawnChain(this, options, this._rootEntry);
  }

  _saveRef(ref: SpawnerRef) {
    this._refStore.push(ref);
  }

  _reRender() {
    console.log(this._spawnerRootBuildList[0]);
    console.log(this._rootEntry);
    document.body.appendChild(document.createElement("div"));
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

  _saveSpawnChain(builtSpawnChain: HTMLElement) {
    this._spawnerRootBuildList.push(builtSpawnChain);
  }
}

export class SpawnChain {
  _parentSpawner: Spawner;
  _rootContext: HTMLElement;
  _buildList: HTMLElement[];
  _rootInsertion: HTMLElement;

  constructor(parent, options, rootInsertion) {
    this._parentSpawner = parent;
    this._rootContext = this._create(options);
    this._buildList = [];
    this._rootInsertion = rootInsertion;
  }

  private _create(options?: Record<string, any>): HTMLElement {
    const element: HTMLElement = options["type"]
      ? document.createElement(options["type"])
      : document.createElement("div");

    Object.entries(options).map(([key, val]) => {
      key !== "type" ? (element[key.toString()] = val) : null;
    });

    // if (typeof options["ref"] == "string") {
    //   let reference: string = options["ref"];
    //   this._saveRef({ reference, element });
    // }

    return element;
  }

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

  _build(buildList: HTMLElement[], rootElement: HTMLElement) {
    buildList.forEach((x) => {
      rootElement.append(x);
    });
    return rootElement;
  }

  nest(spawnChain: SpawnChain) {
    this._buildList.push(
      this._build(spawnChain._buildList, spawnChain._rootContext)
    );
    return this;
  }

  renderAt(insertionPoint: HTMLElement) {
    const builtSpawnChain = this._build(this._buildList, this._rootContext);
    // super._saveSpawnChain(builtSpawnChain);
    this._parentSpawner._saveSpawnChain(builtSpawnChain);
    insertionPoint.append(builtSpawnChain);
  }

  render() {
    const builtSpawnChain = this._build(this._buildList, this._rootContext);
    // super._saveSpawnChain(builtSpawnChain);
    this._rootInsertion.append(builtSpawnChain);
  }
}
