interface Ref {
  stateName: string;
  attr?: string;
  element: HTMLElement;
  renderDependency?: boolean;
}

interface StatefulAttr {
  [x: string]: string;
}

type StateObj = {
  [key: string]: Record<string, any>;
};
