class CreateContainer {
  constructor() {
    console.log("Constructor called");
    document.body.addEventListener("load", this.onLoadFunction);
  }

  onLoadFunction() {
    console.log("Body loaded!");
  }
}

export {CreateContainer};
