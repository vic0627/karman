import FakeStore from "./layers/FakeStore";
import createKarmanLine from "./super/createKarmanLine";

const userAPI = createKarmanLine({
    karman: FakeStore,
    baseURL: "localhost:8000",
});

userAPI.auth.login();