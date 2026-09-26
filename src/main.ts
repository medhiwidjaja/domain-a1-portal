import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import './style.css';
import { useCompanyStore } from './stores/companyStore';
import { useVfcStore } from './stores/vfcStore';
import { useSpatialStore } from './stores/spatialStore';
import { usePermitStore } from './stores/permitStore';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

// Hydrate all stores from IndexedDB so state survives browser refresh
const companyStore = useCompanyStore();
const vfcStore = useVfcStore();
const spatialStore = useSpatialStore();
const permitStore = usePermitStore();

Promise.all([
  companyStore.init(),
  vfcStore.init(),
  spatialStore.init(),
  permitStore.init()
]).catch((err) => {
  console.warn('Stores IDB initialization warning:', err);
});

app.mount('#app');
