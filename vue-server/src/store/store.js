import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex);

export const store =  new Vuex.Store({
  state: {
    user: {
      id: "",
      token: ""
    }
  },
  plugins: [createPersistedState({ storage: window.sessionStorage })],
  getters: {
    getUserState: state => {
      return state.user;
    },
  },
  mutations: {
    setUserState: (state, payload) => {
      state.user.token = payload.token;
      state.user.id = payload.id;

    },
  },
  actions: {
    setUserState: ({commit}, payload) => {
      commit('setUserState', payload);
    },
  }

});
