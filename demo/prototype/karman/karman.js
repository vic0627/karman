class Karman {
  $baseURL;

  constructor(url) {
    this.$baseURL = url;
  }
}

function defineKarman(c) {
  console.log("this is karman => ", c);
}

function defineAPI(c) {
  console.log("this is API config => ", c);
}

function defineIntersection(c) {
  console.log("this is rule => ", c);
}

module.exports = {
  Karman,
  defineKarman,
  defineAPI,
  defineIntersection,
};
