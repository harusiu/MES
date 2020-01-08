<template>
  <div class="animdated fadeIn" align="center">
    <b-col lg="12">
      <b-card>
        <h4><strong>請掃描員工 QR Code 及工單 QR Code</strong></h4>
        <!--<qrcode-stream @decode="onDecode" @init="onInit"/>-->
        <qrcode-stream @decode="onDecode"/>
        <br>
          <table>
            <tr>
              <td>
              </td>
              <td>
                <!--<input type="password" id="myInput" @input="parseInput()" autofocus="true" style="font-size: 1em;" size="50%">-->
                <input type="password" id="myInput" @keypress="checkEnter()" autofocus="true" style="font-size: 1em;" size="50%">
              </td>
            </tr>
            <br>
            <tr>
              <td>
                <h5>員工 ID&emsp;</h5>
              </td>
              <td>
                <b-form-input type="text" v-model="empID" readonly></b-form-input>
              </td>
            </tr>
            <br>
            <tr>
              <td>
                <h5>工單 ID&emsp;</h5>
              </td>
              <td>
                <b-form-input type="text" v-model="jobID" readonly></b-form-input>
              </td>
            </tr>
          </table>
        <br>
        <b-button type="submit" :variant="variant" :disabled="disabled" :href="'http://192.168.1.18:8084/pages/jobReport/' + empID + '/' + jobID"><h5>確認 (前往報工)</h5></b-button>
        <!-- http://192.168.1.18:8084/pages/jobReport/ ... -->
        <!-- http://192.168.1.18:8084/pages/jobReport/A01281020902/A511-10810020010_90-0S01SYN_1_2-->
        <br><br><br><br><br><br><br><br><br><br>
      </b-card>
    </b-col>
  </div>
</template>



<script>
export default {
  data () {
    return {
      empID: '',
      jobID: '',
      disabled: true,
      variant: 'secondary'
    }
  },

  methods: {
    checkEnter() {
      var x = event.keyCode;
      if(x != 13)
        return;

      this.parseInput();
    },

    parseInput() {
      var test = document.getElementById('myInput').value.trim();
      document.getElementById('myInput').value= '';
      
      /*if(test[test.length-1] == '#')
        document.getElementById('myInput').value= '';
      else
        return;

      test = test.substr(0, test.length-1);*/

      if(test.substr(0, 6).toLowerCase() == 'empid:' || test.substr(0, 6).toLowerCase() == 'empid=')
      {
        var newLen = test.length - 6;
        var newStr = test.substr(6, newLen).trim();
        //document.getElementById('empid').value = newStr;
        this.empID = newStr;
      }
      else if(test.substr(0, 6).toLowerCase() == 'jobid:' || test.substr(0, 6).toLowerCase() == 'jobid=')
      {
        var newLen = test.length - 6;
        var newStr = test.substr(6, newLen).trim();
        //document.getElementById('jobid').value = newStr;
        this.jobID = newStr;
      }

      //var empid = document.getElementById('empid').value;
      //var jobid = document.getElementById('jobid').value;
      if (this.empID != '' && this.jobID != '')
      {
        this.disabled = false;
        this.variant = "primary";
      }
      else
      {
        this.disabled = true;
        this.variant = "secondary";
      }
    },

    onDecode (value) {
      document.getElementById('myInput').value = value;
      this.parseInput();
    },
  }
}
</script>



<style scoped>
.error {
  font-weight: bold;
  color: red;
}
</style>
