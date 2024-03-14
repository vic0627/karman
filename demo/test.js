const init = (onError) => {
  let resolver = {};

  const p = new Promise((resolve, reject) => {
    resolver = { resolve, reject };
  });

  const _p = p.catch((r) => {
    if (onError) return onError(r);
    else throw r;
  });

  return [_p, resolver];
};

const fn = async () => {
  try {
    // const onError = (r) => {
    //   console.error("catch from inner =>", r);
    //   return r?.message;
    // };
    const onError = null;
    const [p, r] = init(onError);

    r.reject(new Error("hello"));

    const res = await p;

    console.log(res);
  } catch (r) {
    console.error("catch from outter =>", r);
  }
};

fn();
