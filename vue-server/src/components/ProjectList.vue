<template>
  <div class="container-fluid" :class="{'fade':loading}">
    <div class="row">
      <div class="col-sm-12">
        <h2>Projects</h2>
      </div>
    </div>
    <div class="row">
      <div class="col-sm-12 search-section">
        <input type="text" name="search" placeholder="Project title or subtitle" v-model="searchTerm">
      </div>
    </div>
    <div class="row project-nav">
      <div class="col-sm-12">
        <ul class="nav nav-pills nav-justified">
          <li class="nav-item col-sm-4" :class="{'active': activeTab == 1}">
            <a class="nav-link" :class="{'hide': getUserState.token === ''}" href="#" v-on:click="tabHandler(1, $event)">Created by me</a>
          </li>
          <li class="nav-item col-sm-4" :class="{'active': activeTab == 2}">
            <a class="nav-link" href="#" v-on:click="tabHandler(2, $event)">All projects</a>
          </li>
          <li class="nav-item col-sm-4" :class="{ 'active': activeTab == 3}">
            <a class="nav-link" href="#" :class="{'hide': getUserState.token === ''}" v-on:click="tabHandler(3, $event)">Backed by me</a>
          </li>
        </ul>
      </div>
    </div>
    <div class="row details">
      <div class="col-sm-12" v-if="searchTerm !== ''">
        <div class="project-row">
          <span v-if="filteredProjects.length === 0">
            Sorry! We could not find any projects matching your search
          </span>
          <div v-for="(project, index) in filteredProjects" class="box col-sm-3">
              <router-link :to="{name:'ProjectDetail', params: {id: project.id }}">
                <img :src="baseUrl + project.imageUri"/>
                <h3 class="title">{{ project.title }}</h3>
              </router-link>
          </div>
        </div>
      </div>
      <div class="col-sm-12" v-else>
        <div class="project-row" :class="{'no-content': showing.length === 0}">
          <span v-if="showing.length === 0 && activeTab === 1">
            You have not created any project yet.
            <router-link :to="{name:'CreateProject'}" class="nav-item nav-link"><strong>Get started now!</strong></router-link>
          </span>
          <span class="align-center" v-if="showing.length === 0 && activeTab === 3">
            You have not backed any project yet.
            <router-link :to="{name:'ProjectList', params:{type: 'all'}}" class="nav-item nav-link"><strong>See if you like something here!</strong></router-link>
          </span>
          <div v-for="project in showing" class="box col-sm-3">
              <router-link :to="{name:'ProjectDetail', params: {id: project.id }}">
                <img :src="baseUrl + project.imageUri"/>
                <h3 class="title">{{ project.title }}</h3>
              </router-link>
          </div>
        </div>
      </div>
      <div class="show-more" v-if="searchTerm === '' && showing.length < projects.length">
         <div class="row">
           <div class="col-sm-12">
           <p>&nbsp&nbsp&nbspShowing {{ showing.length }} of {{ projects.length }}&nbsp&nbsp&nbsp</p>
         </div>
         </div>
         <div class="row">
            <div class="col-sm-12 align-showmore-btn">
              <button class="btn btn-full" v-on:click="showProjects">Show more</button>
            </div>
          </div>
        </div>
      </div>
    <i v-show="loading" class="fa fa-spinner fa-spin adjust-spinner"></i>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import globalConfig from '../config/helper.js';
  export default {
    data() {
      return {
        baseUrl: globalConfig.baseUrl,
        searchTerm: "",
        projectId: "",
        activeTab: "",
        projects: [],
        showing: [],
        error: "",
        tabs: ['created', 'all', 'pledged'],
        rowSize: 4,
        pageSize: 8,
        loading: false
      }
    },
    created: function() {
      this.getProjects();
    },
    watch: {
      '$route': 'getProjects'
    },
    computed: {
      ...mapGetters(['getUserState']),
      filteredProjects: function() {
        this.loading = true;
        return this.projects.filter((project) => {
          this.loading = false;
          return project.title.toUpperCase().match(this.searchTerm.toUpperCase()) || project.subtitle.toUpperCase().match(this.searchTerm.toUpperCase())
        });
      }
    },
    methods: {
      tabHandler: function (tabNo, event) {
        this.activeTab = tabNo;
        let type = this.tabs[tabNo - 1];
        event.preventDefault();
        this.$router.push({name: 'ProjectList', params: {type: type}});
      },
      showProjects: function () {
          let projectsShown = this.showing.length;
          let nextProjects = this.projects.slice(projectsShown, Math.min(projectsShown + this.pageSize, this.projects.length));
          this.showing.push(...nextProjects);
      },
      getProjects: function () {
        this.loading = true;
        let type = this.$route.params.type;
        let userId = this.getUserState.id;
        this.activeTab = this.tabs.indexOf(type) + 1;
        if (type === 'all') {
          this.$http.get(`${this.baseUrl}/projects?open=true`)
            .then(response => {
              if (response.ok) {
                this.projects = response.data;
                this.showing = this.projects.slice(0, Math.min(this.pageSize, this.projects.length));
                this.loading = false;
              }
            }, error => {
              this.error = error;
              this.loading = false;
            })
        } else if (userId !== '') {
          if (type === 'created') {
            this.loading = true;
            this.$http.get(`${this.baseUrl}/projects?creator=${userId}`)
              .then(response => {
                if (response.ok) {
                  this.projects = response.data;
                  this.showing = this.projects.slice(0, Math.min(this.pageSize, this.projects.length));
                  this.loading = false;
                }
              }, error => {
                this.error = error;
                this.loading = false;
              });
          } else if (type === 'pledged') {
            this.loading = true;
            this.$http.get(`${this.baseUrl}/projects?backer=${userId}`)
              .then(response => {
                if (response.ok) {
                  this.projects = response.data;
                  this.showing = this.projects.slice(0, Math.min(this.pageSize, this.projects.length));
                  this.loading = false;
                }
              }, error => {
                this.error = error;
                this.loading = false;
              });
          }
        }

        }

      }
  }
</script>

<style scoped>

  .show-more p {
    text-align: center;
    padding-bottom: 30px;
    font-size: 90%;
    color: #777;
  }

  .show-more p:after,
  .show-more p:before {
    display:inline-block;
    height: 2px;
    background-color: #e67e22;
    content:" ";
    width: 60px;
    margin: 0 auto;
    margin-top: 30px;
  }

  .show {
    visibility: visible;
    opacity: 1;
    transition: visibility 0.2s, opacity 0.5s linear;
  }

  .info {
    text-align: center;
    margin-top: 0;
    color: #777;
    padding-bottom: 5px;
  }

  .partition {
    display: block;
    content: "";
    height: 2px;
    background-color: #eee;
    width: 110%;
    margin-bottom: 10px;
  }

  .search-section {
    text-align: center;
    margin-bottom: 45px;
  }

  .search-section input {
    width: 30%;
    padding: 12px 20px 12px 55px;
    text-decoration: none;
    background-color: white;
    font-weight: 300;
    border: 1px solid #e67e22;
    text-transform: uppercase;
    outline: none;
    transition: border 0.2s;
    background-image: url('../assets/searchicon.png');
    background-position: 15px, 10px;
    background-repeat: no-repeat;
  }

  .search-section input:hover,
  .search-section input:active {
    border: 1px solid #cf6d17;
  }

  .hide {
    visibility: hidden;
  }

  .nav-pills>li>a {
    background-color: transparent;
    text-transform: uppercase;
    font-size: 150%;
    color: #e67e22;
    border-bottom: 2px solid transparent;
    -webkit-transition: border-bottom 0.2s, color 0.2s;
    transition: border-bottom 0.2s, color 0.2s;
    padding: 15px 0;
  }

  .nav-pills>li.active>a,
  .nav-pills>li>a:focus,
  .nav-pills>li>a:hover,
  .nav-pills>li.active>a:focus,
  .nav-pills>li.active>a:hover {
    background-color: transparent;
    text-transform: uppercase;
    font-size: 150%;
    color: #e67e22;
    border-bottom: 2px solid #e67e22;
    -webkit-transition: border-bottom 0.2s;
    transition: border-bottom 0.2s;
    padding: 15px 0;
  }

  .project-nav {
    margin-bottom: 50px;
  }

  .box img {
    width: 100%;
    height: 240px;
    transform: scale(1.04);
    overflow: hidden;
    transition: transform 0.5s, opacity 0.5s;
    opacity: 0.8;
    margin-bottom: 15px;
  }

  .box img:hover,
  .box img:active {
    transform: scale(1.00);
    opacity: 1;
  }

  .box a:link,
  .box a:visited {
    text-decoration: none;
    color: #555;
  }

  .box a:hover,
  .box a:active {
    text-decoration: none;
    color: #3c3c3c;
    transition: color 0.2s;
  }

  .box {
    margin-bottom: 30px;
    overflow: hidden;
    max-height: 325px;
  }

  .align-showmore-btn {
    text-align: center;
  }

  .no-content {
    text-align: center;
  }

  .no-content span,
  .no-content strong {
    color: #e67e22
  }

  .no-content a:hover,
  .no-content a:active {
    color: #cf6d17;
    text-decoration: none;
  }


</style>
