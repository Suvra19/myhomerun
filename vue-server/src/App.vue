<template>
  <div id="app">
    <header>
      <nav>
        <div class="row primary-nav">
          <ul class="main-nav js--main-nav">
            <div class="col-sm-4 project">
              <li><router-link :to="{name:'ProjectList', params: {type: 'all'}}" class="nav-item nav-link">Explore projects</router-link></li>
              <li v-if="getUserState.token !== ''"><router-link :to="{name:'CreateProject'}" class="nav-item nav-link">Create project</router-link></li>
            </div>
            <div class="col-sm-4 logo">
              <li><router-link :to="{name:'HomePage'}" class="style-logo"><span class="logo-two">MY</span><span class="logo-one">HOME</span><span class="logo-two">RUN</span></router-link></li>
            </div>
            <div class="col-sm-4 user">
              <li v-if="getUserState.token !== ''"><a href="#" v-on:click="logoutUser">Logout</a></li>
              <li v-if="getUserState.token === ''"><router-link :to="{name:'RegisterUser'}">Sign up</router-link></li>
              <li v-if="getUserState.token === ''"><router-link :to="{name:'LoginUser'}">Login</router-link></li>
              <li v-if="getUserState.token !== ''"><router-link :to="{name:'UpdateUser', params: {id: getUserState.id }}">Update profile</router-link></li>
            </div>
          </ul>
        </div>
      </nav>
    </header>
    <transition name="slide-fade">
      <router-view></router-view>
    </transition>
    <footer>
      <div class="row">
        <p>
          This webpage was created for the University of Canterbury SENG 365 Term 2 assignment. No copyrights here.<br>
        </p>
        <p>
          Christchurch, New Zealand, Oct 2017.
        </p>
      </div>
    </footer>
  </div>
</template>

<script>
  import {mapGetters, mapMutations} from 'vuex'
  import globalConfig from './config/helper.js'

  export default {
    name: 'app',
    data() {
      return {
        baseUrl: globalConfig.baseUrl
      }
    },
    computed: {
      ...mapGetters(['getUserState'])
    },
    methods: {
      ...mapMutations(['setUserState']),
      logoutUser: function () {
        this.$http.post(`${this.baseUrl}/users/logout`, {}, {headers: {'X-Authorization': this.getUserState.token}})
          .then(function (response) {
            this.setUserState({id:"", token:""});
            sessionStorage.clear();
            this.$router.push({name: 'HomePage'});
          });
      }
    }
  }
</script>

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html,
  body {
    background-color: #fff;
    color: #555;
    font-family: 'Lato', 'Arial', sans-serif;
    font-weight: 300;
    font-size: 20px;
    text-rendering: optimizeLegibility;
    overflow-x: hidden;
  }

  .clearfix {zoom: 1;}
  .clearfix:after {
    content: '.';
    clear: both;
    display: block;
    height: 0;
    visibility: hidden;
  }

  h1,
  h2,
  h3 {
    font-weight: 300;
    text-transform: uppercase;
  }

  h1 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #fff;
    font-size: 240%;
    word-spacing: 4px;
    letter-spacing: 1px;
  }

  h2 {
    font-size: 180%;
    word-spacing: 2px;
    text-align: center;
    margin-bottom: 30px;
    letter-spacing: 1px;
  }

  h3 {
    font-size: 110%;
    margin-bottom: 15px;
  }

  h2:after {
    display: block;
    height: 2px;
    background-color: #e67e22;
    content: " ";
    width: 100px;
    margin: 0 auto;
    margin-top: 30px;
  }

  /* ---- Buttons ------ */

  .btn,
  .btn:link,
  .btn:visited,
  input[type=submit],
  input[type=reset]{
    display: inline-block;
    padding: 10px 30px;
    font-size: 100%;
    font-weight: 300;
    text-decoration: none;
    border-radius: 200px;
    -webkit-transition: background-color 0.2s, border 0.2s, color 0.2s;
    transition: background-color 0.2s, border 0.2s, color 0.2s;
  }

  .btn-full,
  .btn-full:link,
  .btn-full:visited,
  input[type=submit] {
    background-color: #e67e22;
    border: 1px solid #e67e22;
    color: #fff;
    margin-right: 15px;
  }

  .btn-ghost,
  .btn-ghost:link,
  .btn-ghost:visited,
  input[type=submit],
  input[type=reset]{
    border: 1px solid #e67e22;
    color: #e67e22;
    background-color: transparent;
  }

  .btn:hover,
  .btn:active,
  .btn:focus,
  input[type=submit]:hover,
  input[type=submit]:active {
    background-color: #cf6d17;
  }

  .btn-full:hover,
  .btn-full:active,
  .btn-full:focus {
    outline: none;
    border: 1px solid #cf6d17;
    color:#fff;
  }

  .btn-ghost:hover,
  .btn-ghost:active,
  .btn-ghost:focus {
    outline: none;
    border: 1px solid #cf6d17;
    color: #fff;
  }

  /* -------- Nav ------------ */
  .primary-nav {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: rgba(255, 255, 255, 0.98);
    box-shadow: 0 2px 2px #efefef;
    z-index: 9999;
    margin: 0 auto;
  }

  .main-nav {
    float: right;
    list-style: none;
    margin-top: 18px;
  }

  ul {
    margin-bottom: 12px;
    width: 100%;
  }

  .main-nav li {
    display: inline-block;
    margin-left: 40px;
  }

  .main-nav li a:link,
  .main-nav li a:visited {
    color: #e67e22;
    text-decoration: none;
    text-transform: uppercase;
    font-size: 90%;
    border-bottom: 2px solid transparent;
    -webkit-transition: border-bottom 0.2s;
    transition: border-bottom 0.2s;
    padding: 15px 0;
  }

  .main-nav li a:hover,
  .main-nav li a:active {
    border-bottom: 2px solid #e67e22;
  }

  .logo, .user {
    text-align:center;
    padding-right: 72px;
  }

  .logo-one, .logo-two {
    font-size: 120%;
  }

  .logo-one {
    font-weight: 600;
  }

  .main-nav li .style-logo a:hover,
  .main-nav li .style-logo a:active {
    border-bottom: none;
  }

  .container-fluid {
    margin-top: 70px;
  }

  /*--------Footer------------------*/
  footer {
    margin-top: 60px;
    background-color: #333;
    padding: 50px;
    font-size: 80%;
  }

  .footer-nav {
    list-style: none;
    float: left;
  }

 footer p {
    color: #888;
    text-align: center;
    margin-top: 20px;
  }

  /*----Loading effect----------*/
  .adjust-spinner {
    position: absolute;
    font-size: 340%;
    font-weight: 700;
    color: #cf6d17;
    top: 50%;
    right: 48%;
  }

  .fade {
    opacity: 0.25;
  }

  .info {
    text-align: center;
    margin-top: 0;
    font-size: 100%;
    color: #e67e22;
  }
</style>
