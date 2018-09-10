<template>
  <div class="container-fluid" :class="{'fade':loading}">
    <div class="row">
      <div class="col-sm-12">
        <h2>Your project profile</h2>
      </div>
    </div>
    <div class="content-section">
      <div class="row">
        <div class="col-sm-11 col-sm-offset-1">
          <i class="fa fa-angle-left"></i><router-link :to="{name:'ProjectDetail', params: {id: projectId }}" class="back-btn">Back to project details</router-link>
        </div>
      </div>
      <div class="row" v-if="fail === true">
        <div class="col-sm-12 info">
          <span><strong>oops!</strong> Could not update</span>
        </div>
      </div>
      <div class="row" v-if="success === true">
        <div class="col-sm-12 info">
          <span><strong>Success!</strong> project profile updated</span>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-11 col-sm-offset-1 partition">
          <span class="section-header">Project details</span>
        </div>
      </div>
      <div class="row adjust-width">
        <div class="col-sm-11 col-sm-offset-1 form-group">
          <div class="col-sm-4">
            <span class="control-label">Title</span>
          </div>
          <div class="col-sm-8">
            <span>{{ projectDetails.title }}</span>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-11 col-sm-offset-1 partition">
          <span class="section-header">Project Rewards</span>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-11 col-sm-offset-1">
          <form method="POST" @submit.prevent="updateRewards">
            <div v-for="(reward, index) in projectRewards">
              <label class="control-label col-sm-4" :class="{'hide': index > 0}">Rewards (NZD)</label>
              <div class="col-sm-2" :class="{'col-sm-offset-4': index > 0}">
                <input v-model.number="reward.amount" type="number" class="form-control" placeholder="Enter reward amount" required/>
              </div>
              <div class="col-sm-4 adjust-button form-group">
                <textarea class="form-control" v-model="reward.description" placeholder="Enter reward description" required></textarea>
              </div>
              <div class="col-sm-1 adjust-button" v-if="projectStatus === true">
                <button v-if="index > 0" type="button" class="btn btn-default removeButton" v-on:click="removeRewardFields(index)"><i class="fa fa-minus"></i></button>
                <button v-else type="button" class="btn btn-default addButton" v-on:click="addRewardFields"><i class="fa fa-plus"></i></button>
              </div>
            </div>
            <div class="row" v-if="projectStatus === true">
              <div class="col-sm-8 col-sm-offset-4">
                <button type="submit" class="btn btn-full">Update</button>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-11 col-sm-offset-1 partition">
          <span class="section-header">Project Image</span>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-11 col-sm-offset-1">
          <div class="col-sm-12">
            <div class="col-sm-5">
              <img :src="baseUrl + projectImage" class="fix-image" v-if="isInitial"/>
            </div>
            <div class="col-sm-7" v-if="projectStatus === true">
              <form enctype="multipart/form-data">
                  <div class="dropbox">
                    <input type="file" accept="image/*" @change="uploadImage" class="input-file">
                    <p v-if="isInitial">
                      Drag your new image here to begin<br> or click to browse
                    </p>
                    <p v-else>
                      Uploading new image...
                    </p>
                  </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-11 col-sm-offset-1 partition">
          <span class="section-header">Project Status</span>
        </div>
      </div>
      <div class="row form-group">
        <div class="col-sm-11 col-sm-offset-1">
          <div class="col-sm-4">
            <span class="control-label">Status</span>
          </div>
          <div class="col-sm-8">
            <span v-if="projectStatus === false" class="closed">Closed</span>
            <div v-else>
              <button class="btn btn-ghost" data-toggle="modal" data-target="#closeProjectModal">Close project</button>
              <p class="warning-text">*Please note you will not be able to re-open it</p>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-sm-11 col-sm-offset-1">
          <i class="fa fa-angle-left"></i><router-link :to="{name:'ProjectDetail', params: {id: projectId }}" class="back-btn">Back to project details</router-link>
        </div>
      </div>
      <div class="modal fade" id="closeProjectModal" tabindex="-1" role="dialog" aria-labelledby="closeProjectModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <p class="text-warning">Closed project cannot be re-opened. Are you sure you want to close the project ?</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary yes" v-on:click="updateStatus" data-dismiss="modal">Yes</button>
              <button type="button" class="btn btn-primary no" data-dismiss="modal">No</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <i v-show="loading" class="fa fa-spinner fa-spin adjust-spinner"></i>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import globalConfig from '../config/helper.js'

  export default {
    data() {
      return {
        projectId: 0,
        projectDetails: {
          "title": "",
        },
        projectRewards: [],
        projectImage: "",
        projectStatus: true,
        success: false,
        fail: false,
        formValidationMsg: "",
        error: "",
        uploadFile: null,
        uploadError: null,
        currentStatus: null,
        uploadFieldName: "",
        uploadMessage: "Uploading image...",
        showMessage: "No image found",
        isInitial: true,
        baseUrl: globalConfig.baseUrl,
        loading: false
      }
    },
    created: function () {
      this.loading = true;
      this.$http.get(`${this.baseUrl}/projects/`+ this.$route.params.id, )
        .then(response => {
          if (response.ok) {
            let project = response.data;
            this.projectId = project.id;
            this.projectDetails.title = project.title;
            this.projectRewards = project.rewards.map(reward => {return {'amount' : reward.amount, 'description': reward.description}});
            this.projectImage = project.imageUri;
            this.projectStatus = project.open;
            this.loading = false;
          } else {
            this.loading = false;
          }
        }, error => {
          this.error = error;
          this.loading = false;
        })
    },
    computed: {
      ...mapGetters(['getUserState']),
    },
    methods: {
      updateRewards: function () {
        this.loading = true;
        this.$http.put(`${this.baseUrl}/projects/${this.projectId}/rewards`, this.projectRewards, {headers: {'X-Authorization': this.getUserState.token}})
          .then(response => {
            if (response.ok){
              this.success = true;
              this.formValidationMsg = "Rewards updated";
              this.loading = false;
            } else {
              this.fail = true;
              this.formValidationMsg = "Sorry, your rewards could not be updated. Please try again."
              this.loading = false;
            }
          }, error => {
            this.error = error;
            this.fail = true;
            this.formValidationMsg = "Something went wrong. Please try again."
            this.loading = false;
          });
      },
      addRewardFields: function () {
        let reward = {
          "amount": 0,
          "description": ""
        };
        this.projectRewards.push(reward);
      },
      removeRewardFields: function (index) {
        this.projectRewards.splice(index, 1);
      },
      uploadImage: function (e) {
        this.uploadFile = e.target.files[0];
        this.isInitial = false;
        this.loading = true;
        this.$http.put(`${this.baseUrl}/projects/${this.projectId}/image`, this.uploadFile,
          {
            headers: {
              'X-Authorization': this.getUserState.token,
              'Content-Type': this.uploadFile.type
            }
          })
          .then(response => {
            if (response.ok){
              this.success = true;
              this.formValidationMsg = "Image successfully uploaded";
              this.isInitial = true;
              this.$http.get(`${this.baseUrl}/projects/`+ this.projectId)
                .then(response => {
                  let project = response.data;
                  this.projectImage = project.imageUri;
                  this.loading = false;
                }, error => {
                  this.error = error;
                })
            } else {
              this.fail = true;
              this.formValidationMsg = "Sorry, image could not be uploaded. Please try again."
              this.isInitial = true;
              this.loading = false;
            }
          }, error => {
            this.error = error;
            this.fail = true;
            this.formValidationMsg = "Something went wrong. Please try again."
            this.isInitial = true;
            this.loading = false;
          });
      },
      updateStatus: function () {
        this.loading = true;
        this.$http.put(`${this.baseUrl}/projects/${this.projectId}`, {'open' : !this.projectStatus}, {headers: {'X-Authorization': this.getUserState.token}})
          .then(response => {
            if (response.ok){
              this.projectStatus = !this.projectStatus;
              this.loading = false;
            }
          }, error => {
            this.error = error;
            this.loading = false;
          });
      }
    }
  }

  /*$(document).ready(function() {

  });*/
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

  .form-control:focus {
    border-color: #ccc;
    -webkit-box-shadow: none;
    box-shadow: none;
  }

  .form-horizontal {
    margin: 0 auto;
    text-align: center;
  }

  .btn-showmore {
    width: 20%;
    font-size: 105%;
    background-color: transparent;
    border-color: #e67e22;
    color: #e67e22;
    border-radius: 200px;
    padding: 10px 30px;
    transition: color 0.2s;
    margin-top:15px;
  }

  .btn-showmore:hover,
  .btn-showmore:active {
    background-color: #cf6d17;
    color: #fff;
  }

  .control-label {
    font-weight: 300;
    font-size: 100%;
    color: #777;
    text-align: start;
    text-transform: capitalize;
  }

  .form-horizontal {
    width: 40%;
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
    border-bottom: 1px solid #cf6d17;
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

  .hide {
    visibility: hidden;
  }

  .adjust-button {
    margin-left: -2%;
  }

  .alert-success, .alert-info {
    color: #e67e22;
    background-color: transparent;
    border-color:transparent;
    padding-left: 5%;
  }

  .partition {
    padding-top: 20px;
  }

  .partition:after {
    display: block;
    content: "";
    height: 2px;
    background-color: #e67e22;
    width: 90%;
    margin-bottom: 20px;
  }

  .section-header {
    text-transform: uppercase;
    font-size: 125%;
    letter-spacing: 0.25px;
  }

  .dropbox {
    outline: 2px dashed grey; /* the dash box */
    outline-offset: -10px;
    background: #f7f7f7;
    color: dimgray;
    padding: 10px 10px;
    min-height: 240px; /* minimum height */
    position: relative;
    cursor: pointer;
    width: 70%;
  }

  .input-file {
    opacity: 0; /* invisible but it's there! */
    width: 100%;
    height: 200px;
    position: absolute;
    cursor: pointer;
  }

  .dropbox:hover {
    background: #eee;
  }

  .dropbox p {
    font-size: 1.2em;
    text-align: center;
    padding: 50px 0;
  }

  .adjust-width .col-sm-8 {
    width: 60%;
  }

  .btn-danger {
    border-radius: 200px;
    width:20%;
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

  .zero-width {
    width: 0%;
  }

  .fix-image {
    width: 80%;
    height: 240px;
  }

  .fa-angle-left {
    color: #e67e22;
    margin-right: 5px;
  }

  .back-btn {
    color: #e67e22;
    font-size: 100%;
    text-decoration: none;
    transition: color 0.2s;
  }

  .back-btn:hover,
  .back-btn:active {
    color: #cf6d17;
  }

</style>
