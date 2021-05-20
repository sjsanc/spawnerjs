import { Spawner } from "./classes/spawner";

const spawner = new Spawner(document.body);

const store = spawner.store({
  text: "hi!",
});

// store.text = "lol";

// console.log(store.text);

// const SpawnerComponent = spawner
//   .create({ innerText: store.text })
//   .append({ innerText: "As am I!" });

// PROPS NOT INLINE

// CAN't PUSH THE BUILTCHAIN, ONLY THE DATA BUILDLIST OITHERWISE REFERENCES ARE SET

spawner
  .create({ innerText: store.text }) // create SpawnChain
  .append({
    innerText: "I'm a header",
    type: "h1",
    onclick: () => {
      store.text = "LOL";
    },
  }) // push to buildList
  .append({ innerText: "I'm some boring text", type: "p", ref: "pRef" })
  .nest(
    spawner
      .create({ innerText: "nested div" })
      .append({ innerText: "nested div 2" })
    //   .nest({SpawnerComponent})
  )
  .renderAt(document.body);

// spawner.register(() => {
//   console.log("Something about this element changed!");
// }, "pRef");

// spawner.get("pRef").classList.add("cls"); // "Something about..."
spawner._reRender();
