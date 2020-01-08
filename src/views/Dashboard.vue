<template>
  <div class="animated fadeIn">
{{computedStatistics}}
    <b-row>

      <b-col class="col-6">
        <b-col lg="12" v-for="(m_item, m_index) in auto_machines" v-if="(m_index%2)==0">
          <b-card>
            <div slot="header">
              <h4><strong>{{m_item.machine}}</strong></h4>
            </div>
            <b-row>
            <b-col lg="6">
              <h4>
                <li>今日總工單數量: {{nof_jobs[m_index]}}</li>
                <li>今日目標數量: {{target_qty[m_index]}} pcs</li>
                <li>今日達成率: {{progress_today[m_index].toFixed(2)}}%</li>
                <li>效率: ---</li>
                <li>OEE: ---</li>
                <li>不良率: {{ng_ratio[m_index].toFixed(2)}}%</li>
              </h4>
            </b-col>
            <b-col lg="6" align="center">
              <h4>今日工單百分比 {{series[m_index][0].toFixed(2)}}%</h4>
              <apexchart type=radialBar :options="chartOptions" :series="series[m_index]"/>
            </b-col>
            </b-row>
          </b-card>
        </b-col>
      </b-col>



      <b-col class="col-6">
        <b-col lg="12" v-for="(m_item, m_index) in auto_machines" v-if="(m_index%2)==1">
          <b-card>
            <div slot="header">
              <h4><strong>{{m_item.machine}}</strong></h4>
            </div>
            <b-row>
            <b-col lg="6">
              <h4>
                <li>今日總工單數量: {{nof_jobs[m_index]}}</li>
                <li>今日目標數量: {{target_qty[m_index]}} pcs</li>
                <li>今日達成率: {{progress_today[m_index].toFixed(2)}}%</li>
                <li>效率: ---</li>
                <li>OEE: ---</li>
                <li>不良率: {{ng_ratio[m_index].toFixed(2)}}%</li>
              </h4>
            </b-col>
            <b-col lg="6" align="center">
              <h4>今日工單百分比 {{series[m_index][0].toFixed(2)}}%</h4>
              <apexchart type=radialBar :options="chartOptions" :series="series[m_index]"/>
            </b-col>
            </b-row>
          </b-card>
        </b-col>
      </b-col>

    </b-row>
  </div>
</template>



<script>
//npm install --save apexcharts
//npm install --save vue-apexcharts
import VueApexCharts from "vue-apexcharts";

export default {
  name: 'StatProduct',

  components: {apexchart: VueApexCharts},

  data () {
    return {

      auto_jobs: [],
      auto_machines: [],

      nof_jobs: [],
      target_qty: [],
      done: [],
      
      acc_good: [],
      acc_ng: [],
      ng_ratio: [],
      
      progress_today: [],
      progress_current: [],

      series: null, //series: [95, 85],

      chartOptions: {
        plotOptions: {
          radialBar: {
            dataLabels: {
              name: {
                fontSize: '22px',
              },
              value: {
                //fontSize: '16px',
                fontSize: '22px',
              },
              total: {
                show: true,
                label: '目前工單百分比',
                formatter: function (w) {
                  // By default this function returns the average of all series. The below is just an example to show the use of custom formatter function
                  //return series[0];
                  return w.globals.series[1].toFixed(2) + '%';
                }
              },
            }
          }
        },
        labels: ['今日工單百分比', '目前工單百分比'],
      },
    }
  },

  created() {
    var sql = "SELECT DISTINCT machine FROM job_status WHERE job_type='自動' \
                AND machine!='' AND machine!='-1' AND machine IS NOT NULL \
                ORDER BY machine";
    let param = {sql: sql};
    this.$http.get('/api/statistic/generalQuery', {params: param}).then(res => {
      this.auto_machines = res.data;
    });

    this.getData();

    setInterval(this.getData, 3000);
  },

  computed: {
    computedStatistics () {
      var j, m;
      var byFoo = {};
      this.series = new Array(this.auto_machines.length);

      for (m=0; m<this.auto_machines.length; m++)
      {
        byFoo[this.auto_machines[m].machine] = m;
        
        this.nof_jobs[m] = 0;
        this.target_qty[m] = 0;
        this.done[m] = 0;

        this.acc_good[m] = 0;
        this.acc_ng[m] = 0;
        this.ng_ratio[m] = 0;

        this.progress_current[m] = 0;
        this.progress_today[m] = 0;

        this.series[m] = new Array(2);
        this.series[m][0] = 0;
        this.series[m][1] = 0;//(70 + 30*Math.random()).toFixed(2);
      }

      for (j=0; j<this.auto_jobs.length; j++)
      {
        m = byFoo[this.auto_jobs[j].machine];

        this.nof_jobs[m] = this.nof_jobs[m] + 1;

        this.target_qty[m] = this.target_qty[m] + this.auto_jobs[j].target_qty;

        if(this.auto_jobs[j].state == '已出站')
          this.done[m] = this.done[m] + 1;

        this.acc_good[m] = this.acc_good[m] + this.auto_jobs[j].acc_good;

        this.acc_ng[m] = this.acc_ng[m] + this.auto_jobs[j].acc_ng;

        if(this.auto_jobs[j].state == '生產中' || this.auto_jobs[j].state == '中斷')
          this.series[m][1] = this.progress_current[m] = 100*this.auto_jobs[j].acc_good / this.auto_jobs[j].target_qty;
        else if(this.auto_jobs[j].state == '未進站')
          this.series[m][1] = this.progress_current[m] = 0;
        else if(this.auto_jobs[j].state == '已出站')
          this.series[m][1] = this.progress_current[m] = 100;

        this.series[m][1] = this.progress_current[m] = 70 + 30*Math.random();
        //this.series[m][1] = 60;
      }

      for (m=0; m<this.auto_machines.length; m++)
      {
        if (this.acc_ng[m] + this.acc_good[m] > 0)
          this.ng_ratio[m] = 100*this.acc_ng[m] / (this.acc_ng[m] + this.acc_good[m]);
        else
          this.ng_ratio[m] = 0;

        if (this.nof_jobs[m] > 0)
          this.series[m][0] = this.progress_today[m] = 100*this.done[m] / this.nof_jobs[m];
        else
          this.series[m][0] = this.progress_today[m] = 100;

        this.series[m][0] = this.progress_today[m] = 70 + 30*Math.random();
      }
    }
  },

  methods: {
    getData()
    {
      var sql = "SELECT * FROM job_status WHERE job_type='自動' \
                    AND machine!='' AND machine!='-1' AND machine IS NOT NULL ORDER BY machine";
      let param = {sql: sql};
      this.$http.get('/api/statistic/generalQuery', {params: param}).then(res => {
        this.auto_jobs = res.data;
      });
    },
  }
}
</script>
