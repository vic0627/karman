const h = {
  fn() {
    console.log("this from func", this);
  },
  fn2: () => {
    console.log("this from arrow func", this);
  },
  fn3: function () {
    console.log("this from func 2", this);
  },
};

class C {
  constructor() {
    this.h = h;
    this.h.fn.apply(this);
    this.h.fn2.apply(this);
    this.h.fn3.apply(this);
  }

  getFn() {
    function f() {
      console.log("this from getFn", this);
    }

    return f.bind(this);
  }
}

const cc = new C();

const f = cc.getFn();
f();
