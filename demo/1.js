class C {
  getFn(o) {
    const c = this;

    function fn() {
      c.print();
      console.log(this.name);
    }

    return fn.bind(o);
  }

  print() {
    console.log("from class C");
  }
}
const cc = new C();
const a = { name: "vic" };
const fn = cc.getFn(a);
fn();
