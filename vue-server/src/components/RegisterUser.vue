<template>
  <div class="container-fluid" :class="{'fade':loading}">
    <div class="row">
      <div class="col-sm-12">
        <h2>Join the community</h2>
      </div>
    </div>
    <div class="row content-section">
      <div class="col-sm-8 form-section">
        <h5 class="form-validation">{{ formValidationMsg }}</h5>
        <form class="form-horizontal" method="POST" @submit.prevent="registerUser">
          <div class="form-group">
            <label class="control-label col-sm-4">Username</label>
            <div class="col-sm-8">
              <input type="text" class="form-control" v-model="user.username" placeholder="Enter a username" />
            </div>
          </div>
          <div class="form-group">
            <label class="control-label col-sm-4">Email</label>
            <div class="col-sm-8">
              <input type="email" class="form-control" v-model="user.email" placeholder="Enter your email" />
            </div>
          </div>
          <div class="form-group">
            <label class="control-label col-sm-4">Location</label>
            <div class="col-sm-8">
              <input type="text" class="form-control" v-model="user.location" placeholder="Enter your location" />
            </div>
          </div>
          <div class="form-group">
            <label class="control-label col-sm-4">Password</label>
            <div class="col-sm-8">
              <input type="password" class="form-control" v-model="user.password" placeholder="Enter a password" />
            </div>
          </div>
          <div class="form-group">
            <div class="col-sm-9 col-sm-offset-3">
              <button type="submit" class="btn btn-full">Sign up</button>
            </div>
          </div>
        </form>
      </div>
      <div class="col-sm-4 who-we-are">
        <router-link :to="{name:'HomePage'}" class="style-logo"><span class="logo-two">MY</span><span class="logo-one">HOME</span><span class="logo-two">RUN</span></router-link>
        <br>
        <span class="side-text">We help creators find the support they need to make their awesome ideas a reality.</span>
        <br>
        <span class="side-text">Join us and be a part of a global community built around creativity and creative people.</span>
      </div>
    </div>
    <i v-show="loading" class="fa fa-spinner fa-spin adjust-spinner"></i>
  </div>
</template>

<script>
  import { mapActions } from 'vuex';
  import globalConfig from '../config/helper.js'
  export default {
    data() {
      return {
        user: {
          username: "",
          email: "",
          password: "",
          location: ""
        },
        success: false,
        loginSuccess: false,
        formValidationMsg: "",
        failMsg: "",
        baseUrl: globalConfig.baseUrl,
        loading: false
      }
    },
    methods: {
      ...mapActions(['setUserState']),
      registerUser: function () {
        if (this.user.username === "" && this.user.email === "") {
          this.formValidationMsg = "Please provide username or email.";
        } else if (this.user.password === "") {
          this.formValidationMsg = "Please enter a password.";
        } else {
          this.loading = true;
          this.$http.post(`${this.baseUrl}/users`,
            {
              "username": this.user.username,
              "email": this.user.email,
              "password": this.user.password,
              "location": this.user.location
            }).then(response => {
              if (response.ok) {
                let query = (this.user.username === "" ? `email=${this.user.email}` : `username=${this.user.username}`) + `&password=${this.user.password}`;
                this.$http.post(`${this.baseUrl}/users/login?${query}`, ).then(response => {
                    if (response.ok) {
                      this.loginSuccess = true;
                      this.setUserState({token: response.data.token, id: response.data.id});
                      this.loading = false;
                      this.$router.push({name:'HomePage'});
                    } else {
                      this.loading = false;
                      this.loginSuccess = false;
                      this.$router.push({name: 'LoginUser'});
                    }
                }, error => {
                    this.error = error;
                    this.loginSuccess = false;
                    this.loading = false;
                    this.$router.push({name: 'LoginUser'});
                });
              } else {
                this.success = false;
                this.failMsg = "Request could not be completed. Please try again.";
                this.loading = false;
                this.$router.push({ name: 'RegisterUser' });
              }
              }, error => {
                this.error = error;
                this.success = false;
                this.loading = false;
                this.failMsg = "Request could not be completed. Please try again.";
                this.$router.push({ name: 'RegisterUser' });
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

  .control-label {
    font-weight: 300;
    font-size: 120%;
    color: #777;
  }

  .form-horizontal {
    margin: 0 auto;
    text-align: center;
  }

  .form-control {
    padding: 18px;
  }

  .btn-showmore {
    width: 25%;
    font-size: 105%;
    margin-bottom: 30px;
  }

  .form-control:focus{
    border-color: #ccc;
    -webkit-box-shadow: none;
    box-shadow: none;
  }

  .form-validation {
    text-align: center;
    margin-top: 0;

  }

  .form-section {
    width: 50%
  }

  .content-section {
    margin-right: 40px;
    margin-left: 60px;
  }

  .btn-showmore {
    background-color: transparent;
    border-color: #e67e22;
    color: #e67e22;
    border-radius: 200px;
    padding: 10px 30px;
    transition: color 0.2s;
  }

  .btn-showmore:hover,
  .btn-showmore:active {
    background-color: #cf6d17;
    color: #fff;
  }

  .side-text {
    font-size: 100%;
    word-spacing:2px;
    line-height:22px;
    letter-spacing:0.25px;
  }

  .who-we-are {
    width: 30%;
    padding-top: 5px;
    padding-bottom: 5px;
  }

  .style-logo:hover {
    color: #cf6d17;
    text-decoration: none;
  }

  .style-logo, logo-one, logo-two {
    color: #e67e22;
  }

</style>
