<template>
  <div class="container-fluid" :class="{'fade':loading}">
    <div class="row">
      <div class="col-sm-12">
        <h2>Login</h2>
      </div>
    </div>
    <div class="row" v-if="fail === true">
      <div class="col-sm-12 info">
        <span><strong>oops!</strong> wrong user/email or password. Please try again</span>
      </div>
    </div>
    <div class="row" v-if="success === true">
      <div class="col-sm-12 info">
        <span><strong>Hurray!</strong> Redirecting to your home page</span>
      </div>
    </div>
    <div class="row clear-top">
      <div class="col-sm-12">
        <form class="form-horizontal" method="POST" @submit.prevent="loginUser">
          <div class="form-group">
            <label class="control-label col-sm-3">Username</label>
            <div class="col-sm-9">
              <input type="text" class="form-control" v-model="login.username" placeholder="Enter your username" />
            </div>
          </div>
          <div class="show-more col-sm-10 col-sm-offset-2">
            <p> OR </p>
          </div>
          <div class="form-group">
            <label class="control-label col-sm-3">Email</label>
            <div class="col-sm-9">
              <input type="email" class="form-control" v-model="login.email" placeholder="Enter your email" />
            </div>
          </div>
          <div class="form-group">
            <div class="col-sm-12 partition"></div>
          </div>
          <div class="form-group">
            <label class="control-label col-sm-3">Password</label>
            <div class="col-sm-9">
              <input type="password" class="form-control" v-model="login.password" placeholder="Enter your password" />
            </div>
          </div>
          <div class="row">
            <div class="col-sm-12">
              <button type="submit" class="btn btn-full">Login</button>
            </div>
          </div>
        </form>
      </div>
    </div>
    <i v-show="loading" class="fa fa-spinner fa-spin adjust-spinner"></i>
  </div>
</template>

<script>
  import { mapActions } from 'vuex';
  import globalConfig from '../config/helper.js';
  export default {
    data() {
      return {
        login: {
          username: "",
          email: "",
          password: "",
        },
        baseUrl: globalConfig.baseUrl,
        loading: false,
        success: false,
        fail: false
      }
    },
    methods: {
      ...mapActions(['setUserState']),
      loginUser: function () {
        if (this.login.username === "" && this.login.email === "") {
          this.formValidationMsg = "Please enter your username or email";
        } else if (this.login.password === ""){
          this.formValidationMsg = "Please enter your password";
        } else {
          this.loading = true;
          let query = (this.login.username === "" ? `email=${this.login.email}` : `username=${this.login.username}`) + `&password=${this.login.password}`;
          this.$http.post(`${this.baseUrl}/users/login?${query}`)
            .then(response => {
              if (response.ok) {
                this.setUserState({token: response.data.token, id: response.data.id});
                this.success = true;
                this.loading = false;
                this.$router.push({name:'HomePage'});
              } else {
                this.loading = false;
                this.fail = true;
                this.$router.push({name: 'LoginUser'});
              }
          }, error => {
              this.loading = false;
              this.fail = true;
              this.error = error;
          });
        }
      }
    }
  }
</script>

<style scoped>

  h2:after {
    display:block;
    height: 2px;
    background-color: #e67e22;
    content:" ";
    width: 100px;
    margin: 0 auto;
    margin-top: 30px;
  }

  .form-control:focus {
    border-color: #ccc;
    -webkit-box-shadow: none;
    box-shadow: none;
  }

  .form-horizontal {
    margin: 0 auto;
    text-align: center;
    width: 40%;
    padding-right:74px;
  }

  .btn-full {
    margin-left: 70px;
    margin-right: 0;
  }

  .control-label {
    font-weight: 300;
    font-size: 120%;
    color: #777;
  }

  .show-more p {
    text-align: center;
    padding-bottom: 15px;
    font-size: 90%;
    color: #777;
  }

  .show-more p:after,
  .show-more p:before {
    display:inline-block;
    height: 2px;
    background-color: #e67e22;
    content:" ";
    width: 30px;
    margin: 0 auto;
    margin-top: 15px;
  }

  .password-field {
    visibility: hidden;
    opacity: 0;
    transition: visibility 0.2s, opacity 0.5s linear;
  }

  .show {
    visibility: visible;
    opacity: 1;
    transition: visibility 0.2s, opacity 0.5s linear;
  }

  .partition {
    display: block;
    content: "";
    height: 2px;
    background-color: #eee;
    width: 110%;
    margin-bottom: 10px;
  }

  .clear-top {
    margin-top:30px;
  }
</style>
