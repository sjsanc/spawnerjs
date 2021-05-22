## Spawner

A small JS framework for frontend stuff.

NOTE: not kept up to date -- see index.ts for correct syntax

```javascript
import { Spawner } from "./classes/spawner";

// Create a Spawner and set the root insertion point
const spawner = new Spawner(document.body);

// Start chaining elements
spawner
    .create([])
    .append([], { type: "h1", classList: "bold", innerText: "My life for Aiur" })
    .append([], { type: "p", innerText: "Jeffrey, we're leaving" });
    .render();

```

Nesting

```javascript
spawner
  .create([])
  .append([], { type: "h1", classList: "bold", innerText: "My life for Aiur" })
  .append([], { type: "p", innerText: "Jeffrey, we're leaving" })
  .nest(
    spawner.create([], { type: "ul" }).append(
      [],
      ["1", "2", "3"].map((li) => ({ type: "li", innerText: li }))
    )
  )
  .render();
```

State management

```javascript
// Create a store
const initialValue = { name: "Jim Raynor" };
const store = spawner.store(initialValue);

const { state } = store;

// Insert some state
store.createState({ killCount: 25 });

// Reference the state by name
spawner
  .create([], { type: "p", innerText: state.name })
  .append([], {
    type: "button",
    onclick: () => store.setState({ name: "Sarah Kerrigan" }),
  })
  .render();

// Or compute it
const cb = (state) => {
  return state + 1;
};

store.computeState(state.number, cb);
```
