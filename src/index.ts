import { Spawner } from "./classes/spawner";

const spawner = new Spawner(document.body);

const store = spawner.store({
  text: "hi!",
});

store.createState({ test: "initialvalue" });
store.setState({ test: "LOL" });

const { state } = store;

spawner
  .create([state.text], { innerText: state.text }) // create SpawnChain
  .append({
    innerText: "I'm a header",
    type: "h1",
    onclick: () => {
      store.setState({ test: "Gmmm" });
    },
  }) // push to buildList
  .append({ innerText: "I'm some boring text", type: "p" })
  .nest(
    spawner
      .create({ innerText: "nested div" })
      .append({ innerText: "nested div 2" })
    //   .nest({SpawnerComponent})
  )
  .renderAt(document.body);

// spawner._reRender();

// store.setState({ test: "Haha" });

// console.log(state.test);

console.log(store);
