interface Ref {
  stateName: string;
  attr: string;
  element: HTMLElement;
}

interface StatefulAttr {
  [x: string]: string;
}

type StateObj = {
  [key: string]: Record<string, any>;
};
