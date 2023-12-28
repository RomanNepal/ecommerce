import { initializeApp } from "firebase/app";
import { getStorage, ref } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCtnQykfae2d_XX20g6NWy_E6R2F3xhdiQ",
  authDomain: "next-ecommerce-a451d.firebaseapp.com",
  projectId: "next-ecommerce-a451d",
  storageBucket: "gs://next-ecommerce-a451d.appspot.com",
  messagingSenderId: "587957906327",
  appId: "1:587957906327:web:ccd1c8f710d467746ff2d2",
  measurementId: "G-SDPN8DSYHX",
};
const app = initializeApp(firebaseConfig);
const storage = getStorage();

export default storage;
