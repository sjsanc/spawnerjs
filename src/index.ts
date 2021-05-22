import { Spawner } from "./classes/spawner";

const spawner = new Spawner(document.body);

const store = spawner.store({
  text: "hi!",
});

store.createState({ number: 0 });

const { state } = store;

spawner
  .create([])
  .append([], { type: "p", innerText: state.number })
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

const cb = (state) => {
  return state + 1;
};

store.setState({ number: 1 });
store.computeState(state.number, cb);

setInterval(() => {
  store.computeState(state.number, cb);
}, 1000);
