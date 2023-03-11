<template>
  <div>
    <h1>Greetings from Vite</h1>
    <h2>
      <span>count is {{ count }}</span>
      <button @click="count++">+1</button>
    </h2>
  </div>
</template>

<script>
import { ref } from "vue";
export default {
  setup() {
    const count = ref(8);
    function add() {
      count.value++;
    }
    return { count };
  },
};
</script>
