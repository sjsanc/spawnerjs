import { Spawner } from "./classes/spawner";

const spawner = new Spawner(document.getElementById("app"));

const store = spawner.store({
  text: "hi!",
  isVisible: false,
});

store.createState({ number: 0 });

const { state } = store;

spawner
  .create([])
  .append([state.isVisible], {
    type: "div",
    style: "border: 2px solid black;",
    innerText: state.text,
  })
  .append([], { type: "p", innerText: state.number })
  .append([], {
    innerText: "Click me",
    type: "button",
    onclick: () => {
      store.setState({ text: "Changed" });
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
  .end();

const cb = (state) => {
  return state + 1;
};

store.computeState(state.number, cb);

setInterval(() => {
  store.computeState(state.number, cb);
}, 1000);

spawner._redraw();

spawner.render();
