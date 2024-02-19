class SuperClass {
  constructor() {
    Object.freeze(this);
  }

  createAPI() {
    return () => {};
  }
}

class SubClass extends SuperClass {
  greet = this.createAPI();
}

const sub = new SubClass();

// sub.greet = "abc";

console.log(sub.greet);
