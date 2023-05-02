<template>
  <q-page>
    <div><q-btn @click="getOrders"></q-btn></div>
    <div>{{ retOrders }}</div>
  </q-page>
</template>

<script>
import { defineComponent, onMounted, ref } from "vue";
import { api, baseURL } from "boot/axios";

export default defineComponent({
  name: "IndexPage",
  setup() {
    var retOrders = ref({});
    function getOrders() {
      api
        .get("/order/selectAllOrders")
        .then((response) => {
          console.log(response.data);
          retOrders.value = response.data;
        })
        .catch(() => {});
    }
    onMounted(() => {
      getOrders;
    });
    return {
      getOrders,
      retOrders,
    };
  },
});
</script>
