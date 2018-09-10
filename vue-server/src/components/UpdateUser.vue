<template>
  <div class="container-fluid" :class="{'fade':loading}">
    <div class="row">
      <div class="col-sm-12">
        <h2>Profile</h2>
      </div>
    </div>
    <div class="row content-section">
      <div class="col-sm-12 info" v-if="success">
        <span><strong>Success!</strong> user profile updated</span>
      </div>
      <div class="col-sm-12 info" v-if="fail">
        <span><strong>oops!</strong> Could not update user</span>
      </div>
      <div class="col-sm-12 form-section">
        <span v-if="accountStatus === false" class="form-validation">Your account has been deactivated</span>
        <form class="form-horizontal" method="POST" @submit.prevent="updateUser">
          <div class="form-group">
            <label class="control-label col-sm-4">Username</label>
            <div class="col-sm-8">
              <input type="text" class="form-control" v-model="user.username" placeholder="Update username" required/>
            </div>
          </div>
          <div class="form-group">
            <label class="control-label col-sm-4">Email</label>
            <div class="col-sm-8">
              <input type="email" class="form-control" v-model="user.email" placeholder="Update email" required/>
            </div>
          </div>
          <div class="form-group">
            <label class="control-label col-sm-4">Location</label>
            <div class="col-sm-8">
              <input type="text" class="form-control" v-model="user.location" placeholder="Update location" />
            </div>
          </div>
          <div class="form-group">
            <label class="control-label col-sm-4">Password</label>
            <div class="col-sm-8">
              <input type="password" class="form-control" v-model="user.password" placeholder="Enter new password" required/>
            </div>
          </div>
          <div class="form-group">
            <div class="col-sm-12">
              <button type="submit" class="btn btn-full">Update</button>
            </div>
          </div>
        </form>
        <div class="row reset">
            <button class="border-less" v-on:click="resetForm">Reset</button>
        </div>
      </div>
    </div>
    <div class="row" v-if="accountStatus === true">
      <div class="col-sm-9 col-sm-offset-3 partition">
        <span class="section-header">Deactivation</span>
      </div>
    </div>
    <div class="row" v-if="accountStatus === true">
      <div class="col-sm-7 col-sm-offset-5 adjust-button">
          <button class="btn btn-ghost" data-toggle="modal" data-target="#closeAccountModal">Deactivate</button>
          <p class="warning-text">*Please note you will not be login to your account again.</p>
      </div>
    </div>
    <div class="modal fade" id="closeAccountModal" tabindex="-1" role="dialog" aria-labelledby="closeAccountModalLabel" aria-hidden="true">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p class="text-warning">Are you sure you want to deactivate your account ?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary yes" v-on:click="closeAccount" data-dismiss="modal">Yes</button>
            <button type="button" class="btn btn-primary no" data-dismiss="modal">No</button>
          </div>
        </div>
      </div>
    </div>
    <i v-show="loading" class="fa fa-spinner fa-spin adjust-spinner"></i>
  </div>
</template>

<script>
  import {mapGetters, mapMutations} from 'vuex'
  import globalConfig from '../config/helper'
  export default {
    data() {
      return {
        user: {
          id: "",
          username: "",
          email: "",
          password: "",
          location: ""
        },
        success: false,
        loginSuccess: false,
        formValidationMsg: "Profile successfully updated",
        failMsg: "",
        show: false,
        accountStatus: true,
        baseUrl: globalConfig.baseUrl,
        loading: false,
        fail: false
      }
    },
    created: function () {
        this.loading = true;
        let userId = this.$route.params.id;
        let token = this.getUserState.token;
        this.$http.get(`${this.baseUrl}/users/${userId}`, {headers: {'X-Authorization': token}})
          .then(response => {
            if (response.ok) {
              this.user.id = response.data.id;
              this.user.username = response.data.username;
              this.user.email = response.data.email;
              this.user.location = response.data.location;
              this.loading = false;
            } else {
              this.loading = false;
            }
          }, error => {
            this.error = error;
            this.loading = false;
          }
        );
    },
    computed: {
      ...mapGetters(['getUserState'])
    },
    methods: {
      ...mapMutations(['setUserState']),
      updateUser: function () {
        this.loading = true;
        let userId = this.user.id;
        let token = this.getUserState.token;
        let requestData = {
          "username": this.user.username,
          "email": this.user.email,
          "password": this.user.password,
          "location": this.user.location === null ? "" : this.user.location
        };
        if (this.user.location === "") {
          requestData.location = "";
        }
        this.$http.put(`${this.baseUrl}/users/${userId}`,
          requestData, {headers: {'X-Authorization': token}}).then(response => {
          if (response.ok) {
            this.success = true;
            this.loading = false;
          } else {
            this.loading = false;
            this.fail = true;
            this.$router.push({ name: 'UpdateUser', params: {id:userId}});
          }
        }, error => {
          this.loading = false;
          this.error = error;
          this.fail = true;
          this.$router.push({ name: 'UpdateUser', params: {id:userId}});
        });
      },
      resetForm: function () {
        this.loading = true;
        this.success = false;
        let userId = this.user.id;
        let token = this.getUserState.token;
        this.$http.get(`${this.baseUrl}/users/${userId}`, {headers: {'X-Authorization': token}})
          .then(response => {
            if (response.ok) {
              this.user.username = response.data.username;
              this.user.email = response.data.email;
              this.user.location = response.data.location;
              this.user.password = response.data.password;
              this.loading = false;
              this.success = true;
            } else {
              this.loading = false;
              this.fail = true;
            }
            }, error => {
              this.error = error;
              this.fail = true;
              this.loading = false;
            }
          );
      },
      closeAccount: function () {
        this.loading = true;
        let userId = this.user.id;
        let token = this.getUserState.token;
        this.$http.delete(`${this.baseUrl}/users/${userId}`, {headers: {'X-Authorization': token}})
          .then(response => {
              if (response.ok) {
                this.success = true;
                this.accountStatus = false;
                this.setUserState({id:"", token:""});
                sessionStorage.clear();
                this.$router.push({name: 'HomePage'});
                this.loading = false;
              } else {
                this.fail = true;
                this.loading = false;
              }
            }, error => {
              this.error = error;
              this.fail = true;
              this.loading = false;
            }
          );
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

  .password-field {
    display: none;
    transition: display 0.2s linear;
  }

  .show {
    display: block;
  }

  .form-section {
    text-align: center;
  }

  .form-control:focus {
    border-color: #ccc;
    -webkit-box-shadow: none;
    box-shadow: none;
  }

  .form-horizontal {
    margin: 0 auto;
    text-align: center;
    margin-top: 15px;
  }

  .btn-showmore {
    width: 25%;
    font-size: 105%;
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

  .control-label {
    font-weight: 300;
    font-size: 120%;
    color: #777;
    text-align: start;
  }

  .form-horizontal {
    width: 45%;
  }

  .pledge-button {
    text-transform: uppercase;
    background-color: #e67e22;
    border-color:#e67e22;
    transition: background-color 0.2s, border-color 0.2s;
    width: 40%;
    font-size: 90%;
    font-weight: 300;
    padding: 7px 0;
    letter-spacing: 0.75px;
  }

  .pledge-button:hover,
  .pledge-button:active {
    background-color: #cf6d17;
    border-color:#cf6d17;
  }

  .cancel {
    width: 10%;
  }

  .border-less:link,
  .border-less {
    border: none;
    background-color: transparent;
    color: #e67e22;
    float:left;
    padding-top: 1.4%;
    transition: color 0.2s;
    text-decoration: none;
  }

  .border-less:active,
  .border-less:hover {
    outline: 0;
    color: #cf6d17;
  }

  .border-less:focus {
    outline: 0;
  }

  .reset {
    margin: 0 48%;
  }

  .form-validation {
    text-align: center;
    margin-top: 0;
    color: #e67e22;
  }

  .partition {
    padding-top: 20px;
  }

  .partition:after {
    display: block;
    content: "";
    height: 2px;
    background-color: #e67e22;
    margin-bottom: 20px;
    width: 70%;
  }

  .section-header {
    text-transform: uppercase;
    font-size: 110%;
    letter-spacing: 0.25px;
  }

  .yes {
    color: #e67e22;
    background-color: transparent;
    border-color: #e67e22;
    transition: background-color 0.2s;
  }

  .yes:active,
  .yes:hover {
    color: #fff;
    background-color: #e67e22;
  }

  .no {
    color: #fff;
    background-color: #e67e22;
    border-color: #e67e22;
    transition: background-color 0.2s, border-color 0.2s;
  }

  .no:active,
  .no:hover {
    color: #fff;
    background-color: #cf6d17;
    border-color: #cf6d17;
  }

  .btn-danger {
    border-radius: 200px;
    width:16%;
  }

  .warning-text {
    font-size: 90%;
    color: #e67e22;
    margin-top: 10px;
  }

  .closed {
    color: red;
    font-weight:600;
  }

  .adjust-button {
    padding-left:35px;
  }
</style>
