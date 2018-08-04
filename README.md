<template>
  <div class="modal" v-show="visible">
      <div class="close" @click="cancel">X</div>
  </div>
</template>
 
<script>
export default {
    name:'modal',
    props: {
      value: {
        type: Boolean,
        default:false
      }
    },
 
  data () {
    return {
      visible:false
    }
  },
  watch:{
      value(val) {
        this.visible = val;
      },
      visible(val) {
        this.$emit("visible-change",val);
      }
  },
  methods:{
    cancel(){
      this.visible = false;
    }
  },
  mounted() {
    if (this.value) {
      this.visible = true;
    }
  }
}
</script>
 
 
///调用modal组件
<modal :value="isShow" @visible-change="modalVisibleChange"></modal>
 
export default {
  name: 'app',
  data () {
    return {
      isShow:true,
    }
  },
  methods:{
     modalVisibleChange(val){
       this.isShow = val;
     }
  }
