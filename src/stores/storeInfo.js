import { LocalStorage, SessionStorage } from "quasar";
import { defineStore } from "pinia";
import { api } from "boot/axios";

export const useStoreInfo = defineStore("storeInfo", {
  state: () => ({
    allStores: LocalStorage.getItem("allStores") || {},
    allStories: LocalStorage.getItem("allStories") || {},
    allMenuTables: LocalStorage.getItem("allMenuTables") || {},
    allMenus: LocalStorage.getItem("allMenus") || {},
    allEvents: LocalStorage.getItem("allEvents") || {},
    currentStore: LocalStorage.getItem("currentStore") || {},
  }),

  getters: {
    storeName(state) {
      return state.currentStore.store_title;
    },
  },

  actions: {
    setCurrentStore(store) {
      LocalStorage.set("currentStore", store);
      this.currentStore = store;
    },
    async setAllStores() {
      var query = "store/allStores";
      await api
        .get(query)
        .then((response) => {
          var stores = response.data.stores;
          LocalStorage.set("allStores", stores);
          this.allStores = stores;
        })
        .catch((error) => {});
    },
    async setAllStories() {
      var query = "brand/allStories";
      await api
        .get(query)
        .then((response) => {
          var stories = response.data.stories;
          LocalStorage.set("allStories", stories);
          this.allStories = stories;
        })
        .catch((error) => {});
    },
    async setAllMenuTables() {
      var query = "menu/allMenuTables";
      await api
        .get(query)
        .then((response) => {
          var menuTables = response.data.menuTables;
          LocalStorage.set("allMenuTables", menuTables);
          this.allMenuTables = menuTables;
        })
        .catch((error) => {});
    },
    async setAllMenus() {
      var query = "menu/allMenus";
      await api
        .get(query)
        .then((response) => {
          var menus = response.data.menus;
          LocalStorage.set("allMenus", menus);
          this.allMenus = menus;
        })
        .catch((error) => {});
    },
    async setAllEvents() {
      var query = "event/allEvents";
      await api
        .get(query)
        .then((response) => {
          var events = response.data.events;
          LocalStorage.set("allEvents", events);
          this.allEvents = events;
        })
        .catch((error) => {});
    }
  },
});
