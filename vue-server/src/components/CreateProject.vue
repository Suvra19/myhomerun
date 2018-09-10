<template>
  <div class="container-fluid" :class="{'fade':loading}">
    <div class="row">
      <div class="col-sm-12">
        <h2>Create project</h2>
      </div>
    </div>
    <div class="row content-section">
      <div class="col-sm-12 form-section">
        <div class="alert alert-info col-sm-8 col-sm-offset-4" v-if="success">
          <strong>Congratulations!</strong> Redirecting to your project profile.
        </div>
        <div class="alert alert-info col-sm-8 col-sm-offset-4" v-if="fail">
          <strong>Sorry</strong>, your project could not be created. Please try again.
        </div>
        <form class="form-horizontal" method="POST" @submit.prevent="createProject">
          <div class="form-group">
            <label class="control-label col-sm-4">Title</label>
            <div class="col-sm-8">
              <input type="text" class="form-control" v-model="project.title" placeholder="Enter project title" required/>
            </div>
          </div>
          <div class="form-group">
            <label class="control-label col-sm-4">Subtitle</label>
            <div class="col-sm-8">
              <input type="text" class="form-control" v-model="project.subtitle" placeholder="Enter project subtitle" required/>
            </div>
          </div>
          <div class="form-group">
            <label class="control-label col-sm-4">Description</label>
            <div class="col-sm-8">
              <textarea class="form-control" v-model="project.description" placeholder="Enter project description" required></textarea>
            </div>
          </div>
          <div class="form-group">
            <label class="control-label col-sm-4">Target amount</label>
            <div class="col-sm-8">
              <input v-model.number="project.target" type="number" class="form-control" placeholder="Enter target amount" required/>
            </div>
          </div>
          <div class="form-group" v-for="(reward, index) in project.rewards">
            <label class="control-label col-sm-4" :class="{'hide': index > 0}">Rewards (NZD)</label>
            <div class="col-sm-2" :class="{'col-sm-offset-4': index > 0}">
               <input v-model.number="reward.amount" type="number" class="form-control" placeholder="Enter reward amount" required/>
            </div>
            <div class="col-sm-5 adjust-button">
              <textarea class="form-control" v-model="reward.description" placeholder="Enter reward description" required></textarea>
            </div>
            <div class="col-sm-1 adjust-button">
              <button v-if="index > 0" type="button" class="btn btn-ghost removeButton" v-on:click="removeRewardFields(index)"><i class="fa fa-minus"></i></button>
              <button v-else type="button" class="btn btn-ghost addButton" v-on:click="addRewardFields"><i class="fa fa-plus"></i></button>
            </div>
          </div>
          <div class="form-group">
            <div class="col-sm-12 col-sm-offset-1">
              <button type="submit" class="btn btn-full">Create</button>
              <input type="reset" class="btn btn-ghost" value="Reset">
            </div>
          </div>
        </form>
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
        project: {
          "title": "",
          "subtitle": "",
          "description": "",
          "target": 0,
          "creators": [],
          "rewards": [{
            "amount": 0,
            "description": ""
          }]
        },
        createdProject: {
          "id": 0
        },
        creator: {
          "id": 0
        },
        loading: false,
        success: false,
        fail: false,
        formValidationMsg: "",
        error: "",
        baseUrl: globalConfig.baseUrl
      }
    },
    created: function () {
      let creator = {'id': this.getUserState !== undefined ? this.getUserState.id : ''};
      this.project.creators.push(creator);
    },
    computed: {
      ...mapGetters(['getUserState']),
    },
    methods: {
      createProject: function () {
        this.loading = true;
        this.$http.post(`${this.baseUrl}/projects`, this.project, {headers: {'X-Authorization': this.getUserState.token}})
          .then(response => {
            if (response.ok){
              this.createdProject.id = response.data.id;
              this.success = true;
              this.loading = false;
              this.$router.push({name: 'UpdateProject', params:{id:this.createdProject.id}});
            } else {
              this.fail = true;
              this.formValidationMsg = "Sorry, your project could not be created. Please try again."
              this.loading = false;
              this.project = {};
            }
          }, error => {
            this.error = error;
            this.fail = true;
            this.formValidationMsg = "Something went wrong. Please try again."
            this.loading = false;
            this.project = {};
          });
      },
      addRewardFields: function () {
        let reward = {
          "amount": 0,
          "description": ""
        };
        this.project.rewards.push(reward);
      },
      removeRewardFields: function (index) {
        this.project.rewards.splice(index, 1);
      }
    }
  }

</script>

<style scoped>
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

  .control-label {
    font-weight: 300;
    font-size: 120%;
    color: #777;
    text-align: start;
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

  .alert-link {
    color: #e67e22;
    transition: color 0.2s;
  }

  .alert-link:hover,
  .alert-link:active {
    color: #cf6d17;
    text-decoration: none;
  }
</style>
