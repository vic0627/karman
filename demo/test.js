const init = (onError) => {
  const p = new Promise((resolve, reject) => {
    p.resolve = resolve;
    p.reject = reject;
  });

  return p;
};

const fn = async () => {
  try {
    // const onError = (r) => {
    //   console.error("catch from inner =>", r);
    //   return r?.message;
    // };
    const onError = null;
    const p = init(onError);

    // r.reject(new Error("hello"));
    p.resolve("yeah!!!!!");
    const res = await p;

    console.log(res);
  } catch (r) {
    console.error("catch from outter =>", r);
  }
};

fn();
