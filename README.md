## Spawner

A small helper library that adds reactive and functional features to the native DOM api.

Example:

```javascript
import { Spawner } from "./spawner";

// const newEl = new U.element("div", { innerText: "LOL" }).append(document.body);

const spawner = new Spawner();

spawner
  .create({ innerText: "I'm a div" })
  .append({ innerText: "I'm a header", type: "h1" })
  .append({ innerText: "I'm some boring text", type: "p", ref: "pRef" })
  .insertInto(document.body);

spawner.register(() => {
  console.log("Something about this element changed!");
}, "pRef");

spawner.get("pRef").classList.add("cls"); // "Something about..."
```
