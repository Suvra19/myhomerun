<template>
  <div class="home-body" :class="{'fade':loading}">
    <div class="header">
      <div class="hero-text-box" v-if="getUserState.token !== ''">
        <h1>Kia Ora!<br>Good to see you</h1>
        <a href="#" class="btn btn-full js--scroll-to-all-projects" @click="gotoSection('all')">Explore projects</a>
        <a href="#" class="btn btn-ghost js--scroll-to-created-projects" @click="gotoSection('created')" v-if="created.length > 0">Created by me</a>
        <router-link :to="{name:'CreateProject'}" class="btn btn-ghost" v-else>Create a project</router-link>
        <a href="#" class="btn btn-ghost js--scroll-to-pledged-projects" @click="gotoSection('pledged')" v-if="pledged.length > 0">Backed by me</a>
      </div>
      <div class="hero-text-box" v-else>
        <h1>Welcome to the #1<br>crowdfunding website in NZ</h1>
        <a href="#" class="btn btn-full js--scroll-to-all-projects" @click="gotoSection('all')">Explore projects</a>
        <router-link :to="{name:'RegisterUser'}" class="btn btn-ghost">Sign up</router-link>
      </div>
    </div>
    <div class="all-projects">
      <div class="container-fluid">
        <div class="info-row js--section-all-projects">
          <h2>Our latest projects</h2>
          <p class="long-copy">All our projects are created and supported by our awesome community.
            <br> Checkout our {{pageSize}} new projects!</p>
        </div>
        <div class="project-row">
          <div v-for="project in projects" class="box col-sm-3">
            <router-link :to="{name:'ProjectDetail', params: {id: project.id }}">
              <img :src="baseUrl + project.imageUri"/>
              <h3 class="title">{{ project.title }}</h3>
            </router-link>
          </div>
        </div>
      </div>
      <div class="show-more">
        <router-link :to="{name:'ProjectList', params: {type: 'all'}}" class="btn btn-full">Show more</router-link>
      </div>
    </div>
    <div class="all-projects" v-if="getUserState.token !== '' && created.length > 0">
      <div class="container-fluid js--section-created-projects">
        <div class="info-row">
          <h2>Created by you</h2>
        </div>
        <div class="project-row">
          <div v-for="project in created" class="box col-sm-3">
            <router-link :to="{name:'ProjectDetail', params: {id: project.id }}">
              <img :src="baseUrl + project.imageUri"/>
              <h3 class="title">{{ project.title }}</h3>
            </router-link>
          </div>
        </div>
      </div>
      <div class="show-more">
        <router-link :to="{name:'ProjectList', params: {type: 'created'}}" class="btn btn-full">Show more</router-link>
      </div>
    </div>
    <div class="all-projects" v-if="getUserState.token !== '' && pledged.length > 0">
      <div class="container-fluid">
        <div class="info-row js--section-pledged-projects">
          <h2>Backed by you</h2>
        </div>
        <div class="project-row">
          <div v-for="project in pledged" class="box col-sm-3">
            <router-link :to="{name:'ProjectDetail', params: {id: project.id }}">
              <img :src="baseUrl + project.imageUri"/>
              <h3 class="title">{{ project.title }}</h3>
            </router-link>
          </div>
        </div>
      </div>
      <div class="show-more">
        <router-link :to="{name:'ProjectList', params: {type: 'pledged'}}" class="btn btn-full">Show more</router-link>
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
        welcomeMsg: "Welcome to the best crown funding site",
        projects : [],
        created: [],
        pledged: [],
        pageSize: 4,
        error: "",
        formValidationMsg: "",
        user: "",
        baseUrl: globalConfig.baseUrl,
        loading:false
      }
    },
    computed: {
      ...mapGetters(['getUserState']),
      filteredProjects: function() {
        return this.projects.filter((project) => {
          return project.title.toUpperCase().match(this.searchTerm.toUpperCase()) || project.subtitle.toUpperCase().match(this.searchTerm.toUpperCase())
        });
      },
    },
    methods: {
      gotoSection: function (type) {
        let sectionId = `.js--section-${type}-projects`;
        $('html, body').animate({scrollTop: $(sectionId).offset().top}, 1000);
      },
      setProjectsToShow: function (created, pledged) {
        this.showCreated = created.slice(0, Math.min(this.pageSize, created.length));
        this.showPledged = pledged.slice(0, Math.min(this.pageSize, pledged.length));
      },
      prepareProjects: function (userId) {
        let projectIds = this.projects.map(project => { return project.id });
        let counter = 0;
        this.projects.forEach(project => {
          this.$http.get(`${this.baseUrl}/projects/${project.id}`)
            .then(response => {
              let creators = response.data.creators.map(creator => {return creator.id});
              let backers = response.data.backers.map(backer => {return backer.id});
              if (creators.includes(userId)) {
                this.created.push(project);
              }
              if (backers.includes(userId)) {
                this.pledged.push(project);
              }
              counter++;
              if (counter === projectIds.length) {
                this.setProjectsToShow(this.created, this.pledged)
              }
            }, error => {
              this.error = error;
            })
        });
      },
      showProjects: function (type) {
        if (type === 'all') {
          let projectsShown = this.showing.length;
          let nextProjects = this.projects.slice(projectsShown, Math.min(projectsShown + this.pageSize, this.projects.length));
          this.showing.push(...nextProjects);
        } else if (type === 'created') {
          let projectsShown = this.showCreated.length;
          let nextProjects = this.created.slice(projectsShown, Math.min(projectsShown + this.pageSize, this.created.length));
          this.showCreated.push(...nextProjects);
        } else if (type === 'pledged') {
          let projectsShown = this.showPledged.length;
          let nextProjects = this.pledged.slice(projectsShown, Math.min(projectsShown + this.pageSize, this.pledged.length));
          this.showPledged.push(...nextProjects);
        }
      }
    },
    created: function() {
        this.$http.get(`${this.baseUrl}/projects?open=true&startIndex=0&count=${this.pageSize}`)
          .then(response => {
            this.projects = response.data;
            let userId = this.getUserState.id;
            if (userId !== "") {
              this.$http.get(`${this.baseUrl}/projects?creator=${userId}&startIndex=0&count=${this.pageSize}`)
                .then(response => {
                  this.created = response.data;
                  this.$http.get(`${this.baseUrl}/projects?backer=${userId}&startIndex=0&count=${this.pageSize}`)
                    .then(response => {
                      this.pledged = response.data;
                    })
                })
            }
          }, error => {
            this.error = error;
          })
    }
  }
</script>

<style scoped>

  .header {
    background-image: -webkit-linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('../assets/hero3.jpg');
    background-image: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),  url('../assets/hero3.jpg');
    background-size: cover;
    background-position: center;
    height: 100vh;
    background-attachment: fixed;
  }

  .hero-text-box {
    position: absolute;
    width: 1140px;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    -ms-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
  }

  .home-body {
    margin:0;
  }

  .all-projects {
    padding: 30px 25px 0 0;
  }

  .project-row {
    padding-top: 20px;
  }



  .long-copy {
    line-height: 145%;
    width: 70%;
    margin-left: 16%;
    margin-bottom: 30px;
    text-align: center;
  }

  .box p {
    font-size: 90%;
    line-height: 145%;
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
  }

  .show-more {
    text-align: center;
    padding-bottom: 30px;
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

  .search-section {
    text-align: center;
    margin-bottom: 45px;
  }

  .search-section input {
    width: 30%;
    padding: 12px 20px 12px 40px;
    text-decoration: none;
    background-color: white;
    font-weight: 300;
    border: 1px solid #e67e22;
    text-transform: uppercase;
    outline: none;
    transition: border 0.2s;
    background-image: url('../assets/searchicon.png');
    background-position: 10px, 10px;
    background-repeat: no-repeat;
  }

  .search-section input:hover,
  .search-section input:active {
     border: 1px solid #cf6d17;
  }
</style>
