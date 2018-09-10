<template>
  <div class="container-fluid" :class="{'fade':loading}">
    <div class="content">
      <div class="row">
        <div class="col-sm-12 header">
          <h1 class="project-title">{{title}}</h1>
          <h2 class="project-subtitle">{{subtitle}}</h2>
        </div>
      </div>
      <div class="row project-info">
        <div class="col-sm-6 image">
          <img :src="baseUrl + image"/>
        </div>
        <div class="col-sm-6 info">
          <div class="facts">
            <div class="pledge-amount">
              <span class="amount">${{topDetails.total}}</span>
              <br>
              <span class="goal">pledged of ${{topDetails.target}} goal</span>
            </div>
            <div class="backer-details">
              <span class="count">{{numberOfBackers}}</span>
              <br>
              <span>backers</span>
            </div>
            <div class="created-date">
              <span class="date">{{topDetails.date}}</span>
              <br>
              <span>creation date</span>
            </div>
          </div>
          <div class="pledge-button" v-if="status === true && getUserState.token !== ''">
            <router-link :to="{name:'UpdateProject', params:{id: projectId}}" class="btn btn-primary" v-if="isCreator === true">Update project</router-link>
            <router-link :to="{name:'PledgeProject', params:{id: projectId}}" class="btn btn-primary" v-else>Pledge project</router-link>
          </div>
          <span v-else>This project is closed</span>
        </div>
      </div>
      <div class="row project-nav">
        <div class="col-sm-12">
            <ul class="nav nav-pills nav-justified">
              <li class="nav-item" :class="{ 'active': activeTab == 1 }">
                <a class="nav-link" href="#" v-on:click="tabHandler(1, $event)">About us</a>
              </li>
              <li class="nav-item" :class="{ 'active': activeTab == 2 }">
                <a class="nav-link" href="#" v-on:click="tabHandler(2, $event)">Rewards</a>
              </li>
              <li class="nav-item" :class="{ 'active': activeTab == 3 }">
                <a class="nav-link" href="#" v-on:click="tabHandler(3, $event)">Top backers</a>
              </li>
              <li class="nav-item" :class="{ 'active': activeTab == 4 }">
                <a class="nav-link disabled" href="#" v-on:click="tabHandler(4, $event)">Creators</a>
              </li>
            </ul>
        </div>
      </div>
      <div class="row details">
        <div class="col-sm-12">
          <div class="about" v-if="activeTab == 1">
            <p>{{ about }}</p>
          </div>
          <div class="rewards" v-if="activeTab == 2">
            <div class="row clear-rows" v-for="reward in rewards">
              <div class="col-sm-12">
                <span class="amount">$ {{reward.amount}}</span>
                <br>
                <span class="goal">{{reward.description}}</span>
              </div>
            </div>
          </div>
          <div class="backers" v-if="activeTab == 3">
            <div class="rows">
              <div class="col-sm-12 clear-rows">
                <span class="backer-amount anonymous">$ {{anonymous}}</span>
                <br>
                <span>Total anonymous contribution</span>
              </div>
            </div>
            <div class="col-sm-12 clear-rows" v-if="backers.length > 0">
              <div class="col-sm-1">
                <span class="backer-rank">Rank</span>
              </div>
              <div class="col-sm-11">
                <span class="backer-name">Backer</span>
              </div>
              <div v-for="(backer, index) in backers" class="row clear-rows">
                <div class="col-sm-12">
                  <div class="col-sm-1">
                    <span class="backer-rank">{{ index + 1 }}.</span>
                  </div>
                  <div class="col-sm-11">
                    <span class="backer-name">{{backer.username}}</span>
                    <span>pledged : </span><span class="backer-amount">$ {{backer.amount}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="creators" v-if="activeTab == 4">
            <div v-for="(creator, index) in creators" class="row clear-rows">
              <div class="col-sm-10 col-sm-offset-2">
                <span class="backer-name">Creator</span>
              </div>
              <div class="col-sm-2">
                <span class="backer-rank">{{ index + 1 }}.</span>
              </div>
              <div class="col-sm-10">
                <span class="backer-name">{{creator.username}}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <i v-show="loading" class="fa fa-spinner fa-spin adjust-spinner"></i>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex';
  import globalConfig from '../config/helper.js';
  export default {
    data() {
      return {
        msg: "Inside Project Details",
        projectId: 0,
        activeTab: 1,
        image: "",
        title: "",
        subtitle: "",
        topDetails: {
          total: 0,
          target: 0,
          date: ""
        },
        about: "",
        rewards: [],
        numberOfBackers: 0,
        backers: [],
        creators: [],
        anonymous: 0,
        isCreator: false,
        status: true,
        baseUrl: globalConfig.baseUrl,
        loading:false
      }
    },
    computed: {
      ...mapGetters(['getUserState'])
    },
    created: function() {
      this.loading = true;
      let userId = this.getUserState.id;
      this.$http.get(`${this.baseUrl}/projects/`+ this.$route.params.id)
      .then(response => {
        let data = response.data;
        this.projectId = data.id;
        this.status = data.open;
        this.image = data.imageUri;
        this.title = data.title;
        this.subtitle = data.subtitle;
        this.topDetails.total = this.getFormattedNumber(data.progress.currentPledged);
        this.topDetails.target = this.getFormattedNumber(data.target);
        this.topDetails.date = this.getFormattedDate(data.creationDate);
        this.about = data.description === "" ? this.subtitle : data.description;
        this.rewards = data.rewards;
        this.numberOfBackers = data.numberOfBackers > 0 ? data.numberOfBackers : 0;
        this.backers = this.filterBackers(data.backers);
        this.creators = data.creators;
        if (userId !== "" && this.creators.map(creator => {return creator.id;}).includes(userId)) {
            this.isCreator = true;
        }
        this.anonymous = this.getAnonymousContribution(data.backers);
        this.loading = false;
      }, error => {
        this.error = error;
        this.loading = false;
      })
    },
    methods: {
      getFormattedNumber: num => {
        let numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
          int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];
        return int + '.' + dec;
      },
     getFormattedDate: creationDate => {
        let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        let time = new Date(creationDate);
        return `${monthNames[time.getMonth()]} ${time.getDate()}, ${time.getFullYear()}`;
      },
      getAnonymousContribution: backers => {
        console.log(backers);
        let anonymousBacker = backers.filter((backer) => {
          if (backer.username.toLowerCase() === 'anonymous') {
            return backer;
          }
        });
        return anonymousBacker.length > 0 ? anonymousBacker[0].amount : 0;
      },
      filterBackers: backers => {
        let sortedBackers = backers.filter(backer => { return (backer.username.toLowerCase() !== 'anonymous') });
        if (sortedBackers.length === 0) {
          return sortedBackers;
        } else {
          sortedBackers.sort((backer1, backer2) => {
            let amount1 = backer1.amount;
            let amount2 = backer2.amount;
            return amount2 - amount1;
          });
          return sortedBackers.slice(0, Math.min(5, backers.length));
        }
      },
      tabHandler: function (tabNo, event) {
        this.activeTab = tabNo;
        event.preventDefault();
      }
    }
  }

</script>

<style scoped>
  .content {
    margin: 20px 30px;
  }

  h1 {
    color: #555;
    margin: 30px 100px;
    text-align: left;
  }

  h2 {
    text-align: left;
    margin: 30px 100px;
  }

  .header {
    margin: 17.5px 0;
  }

  .info {
    padding-left: 7%;
  }

  .info:before {
    display: block;
    content: "";
    height: 2px;
    background-color: #e67e22;
    width: 500px;
    margin-bottom: 20px;
  }

  .project-info {
    margin-bottom: 30px;
    padding-left: 3%;
  }

  .pledge-amount,
  .backer-details,
  .created-date {
    margin-bottom: 20px;
  }

  .amount, .date, .count {
    color: #e67e22;
    font-size: 200%;
  }

  .facts {
    padding-bottom: 50px;
  }

  .pledge-button a:link,
  .pledge-button a:visited {
    text-transform: uppercase;
    background-color: #e67e22;
    border-color:#e67e22;
    transition: background-color 0.2s, border-color 0.2s;
    width: 92%;
    font-size: 100%;
    font-weight: 300;
    padding: 12px 0;
    letter-spacing: 1.5px;
  }

  .pledge-button a:hover,
  .pledge-button a:active {
    background-color: #cf6d17;
    border-color:#cf6d17;
  }

  .image {
    text-align: center;
    background-color: #f6f6f6;
  }
  .image img {
    width: 70%;
    height: auto;
  }

  .nav-item {
    text-transform: uppercase;
    font-size:100%;
    border-bottom: 2px solid transparent;
    transition: border-bottom 0.2s;
    letter-spacing: 2px;
  }

  .nav li a:focus,
  .nav li a:hover,
  .nav li a:active
  {
    text-decoration: none;
    color: #555;
    background-color: #f7f7f7;
  }

  .nav  a {
    border-bottom: 1px solid #e67e22;
    background-color: #f7f7f7;
    color: #555;
    transition: color 0.2s, background-color 0.2s;
  }

  .nav-pills>li.active>a, .nav-pills>li.active>a:focus, .nav-pills>li.active>a:hover {
    color: #fff;
    background-color: #e67e22;
  }

  .details {
    padding: 20px 5px;
    text-align: left;
  }

  .rewards, .backers, .creators {
    padding: 0 100px;
  }

  .clear-rows {
    margin-bottom: 20px;
  }

  .backer-rank, .backer-name {
    color: #555;
    font-size: 150%;
  }

  .backer-amount {
    color: #e67e22;
    font-size: 100%;
  }

   .partition {
    display: block;
    content: "";
    height: 2px;
    background-color: #e67e22;
    width: 90%;
    margin-bottom: 20px;
  }

  .light-partition {
    display: block;
    content: "";
    height: 2px;
    background-color: #eee;
    width: 90%;
    margin-top: 20px;
    margin-bottom: 20px;
  }

  .align-center {
    text-align:center;
    padding-right:0px;
  }

  .align-start {
    text-align: start;
    padding-left: 0px;
  }

  .anonymous {
    font-size: 120%;
  }
</style>
