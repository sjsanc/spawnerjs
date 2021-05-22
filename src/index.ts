import { Spawner } from "./classes/spawner";

const spawner = new Spawner(document.body);

const store = spawner.store({
  text: "hi!",
});

store.createState({ name: "sjsanc" });

const { state } = store;

spawner
  .create([])
  .append([], { type: "p", innerText: state.text })
  .append([], {
    innerText: "Click me",
    type: "button",
    onclick: () => {
      store.setState({ text: "texty" });
    },
  })
  .append([], { innerText: "I'm some boring text", type: "p" })
  .nest(
    spawner.create([], { type: "ul" }).append(
      [],
      ["List 1", "List 2", "List 3"].map((li) => ({
        type: "li",
        innerText: li,
      }))
    )
  )
  .renderAt(document.body);

console.log(store.snapshot());
