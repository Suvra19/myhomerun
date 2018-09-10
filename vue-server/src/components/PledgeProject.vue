<template>
  <div class="container-fluid" :class="{'fade':loading}">
    <div class="row">
      <div class="col-sm-12">
        <h2>Pledge</h2>
      </div>
    </div>
    <div class="row content-section">
      <div class="col-sm-12 form-section">
        <div class="col-sm-11 col-sm-offset-1">
          <i class="fa fa-angle-left"></i><router-link :to="{name:'ProjectDetail', params: {id: projectId }}" class="back-btn">Back to project details</router-link>
        </div>
        <div class="alert alert-success col-sm-7 col-sm-offset-5" v-if="success">
          <strong>Thank you</strong> for your support.
        </div>
        <div class="alert alert-info col-sm-8 col-sm-offset-4" v-if="fail">
          <strong>Sorry!</strong> your pledge could not be registered. Please try again.
        </div>
        <div class="alert alert-warn col-sm-9 col-sm-offset-3" v-if="stripeErrorMessage !== ''">
          <strong>Sorry!</strong> {{stripeErrorMessage}}. <strong>Just testing ? </strong> try 4111111111111111
        </div>
        <form class="form-horizontal" method="POST" @submit.prevent="addPledge">
          <div class="form-group">
            <label class="control-label col-sm-4">Amount</label>
            <div class="col-sm-4">
              <input type="number" class="form-control" v-model.number="pledge.amount" placeholder="Enter pledge amount" required/>
            </div>
          </div>
          <div class="form-group">
            <label class="control-label col-sm-4">Stay anonymous</label>
            <div class="col-sm-1 adjust-checkbox">
              <input type="checkbox" v-model="pledge.anonymous"/>
            </div>
          </div>
          <div class="form-group">
             <label class="col-sm-4 control-label">Card Number</label>
             <div class="col-sm-4">
               <input type="number" v-model.number="card.number" class="form-control" placeholder="Enter your 16-digit card number" required />
              </div>
          </div>
          <div class="form-group">
             <label class="col-sm-4 control-label">Expiration Date</label>
             <div class="col-sm-4">
               <div class="row">
                 <div class="col-sm-4">
                   <select v-model="card.exp.month" class="form-control" required>
                     <option disabled value="">Month</option>
                     <option value="01">Jan (01)</option>
                     <option value="02">Feb (02)</option>
                     <option value="03">Mar (03)</option>
                     <option value="04">Apr (04)</option>
                     <option value="05">May (05)</option>
                     <option value="06">June (06)</option>
                     <option value="07">July (07)</option>
                     <option value="08">Aug (08)</option>
                     <option value="09">Sep (09)</option>
                     <option value="10">Oct (10)</option>
                     <option value="11">Nov (11)</option>
                     <option value="12">Dec (12)</option>
                   </select>
                 </div>
                 <div class="col-xs-4">
                   <select v-model="card.exp.year" class="form-control" required>
                     <option disabled value="">Year</option>
                     <option value="17">2017</option>
                     <option value="18">2018</option>
                     <option value="19">2019</option>
                     <option value="20">2020</option>
                     <option value="21">2021</option>
                     <option value="22">2022</option>
                     <option value="23">2023</option>
                     <option value="23">2024</option>
                     <option value="23">2025</option>
                     <option value="23">2026</option>
                     <option value="23">2027</option>
                     <option value="23">2028</option>
                     <option value="23">2029</option>
                     <option value="23">2030</option>
                   </select>
                 </div>
               </div>
             </div>
           </div>
           <div class="form-group">
             <label class="col-sm-4 control-label" for="cvv">Card CVC</label>
             <div class="col-sm-4">
               <input type="number" v-model.number="card.cvc" class="form-control" name="cvv" id="cvv" placeholder="Enter your 3-digit security Code" required />
             </div>
           </div>
           <div class="form-group">
             <div class="col-sm-4 col-sm-offset-4">
               <button type="submit" class="btn btn-full">Pledge</button>
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
        projectId: 0,
        card: {
          number: "",
          exp: {
            month: "",
            year: ""
          },
          cvc: ""
        },
        pledge: {
          id: "",
          amount: "",
          anonymous: false,
          card: {
            authToken: ""
          }
        },
        success: false,
        successMsg: "",
        fail: false,
        failMsg: "",
        error: "",
        stripeErrorMessage: "",
        baseUrl: globalConfig.baseUrl,
        loading:false
      }
    },
    computed: {
      ...mapGetters(['getUserState'])
    },
    created: function () {
      this.projectId = this.$route.params.id;
      this.pledge.id = this.getUserState.id;
    },
    methods: {
      addPledge: function () {
        this.loading = true;
        Stripe.setPublishableKey('pk_test_6pRNASCoBOKtIshFeQd4XMUh');
        Stripe.card.createToken({
          number: this.card.number,
          cvc: this.card.cvc,
          exp_month: this.card.exp.month,
          exp_year: this.card.exp.year
        }, (status, response) => {
           if (!response.error) {
            this.pledge.card.authToken = response.id;
            this.$http.post(`${this.baseUrl}/projects/${this.projectId}/pledge`, this.pledge, {headers: {'X-Authorization': this.getUserState.token}})
              .then(response => {
                if (response.ok) {
                  this.success = true;
                  this.pledge = {
                    amount: "",
                    anonymous: false,
                    card: {
                      authToken: ""
                    }
                  };
                  this.card = {
                    number: "",
                      exp: {
                      month: "",
                        year: ""
                    },
                    cvc: ""
                  };
                  this.loading = false;
                } else {
                  this.loading = false;
                  this.fail = false;
                }
              }, error => {
                this.loading = false;
                this.error = error;
                this.fail = false;
              }
            );
          } else {
             this.loading = false;
             this.stripeErrorMessage = response.error.message;
           }
        });
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
    font-size: 100%;
    color: #777;
  }

  .form-horizontal {
    margin: 0 auto;
    text-align: center;
    padding-top: 50px;
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

  .alert {
    padding: 0;
  }

  .alert-success, .alert-info {
    color: #e67e22;
    background-color: transparent;
    border-color:transparent;
  }

  .alert-success a {
    color: #e67e22;
    text-decoration: none;
  }

  .alert-success a:hover,
  .alert-success a:active {
    color: #cf6d17;
  }

  .adjust-checkbox {
    margin-left:-2.5%;
  }

  input[type=checkbox] {
    margin: 9px 0 0;
  }

  .alert-warn {
    color: #e67e22;
    background-color: transparent;
    border-color:transparent;
    padding-left: 7%;
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
