import multiparty from "multiparty";
import firebase from "firebase/app";
import "firebase/compat/storage";
import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
} from "firebase/storage";
import { getFirestore, collection, getDocs } from "firebase/firestore/lite";
import storage from "../../lib/FirebaseConnect";
import { mongooseConnect } from "../../lib/mongoose";
import { isAdminRequest } from "./auth/[...nextauth]";
export default async function handle(req, res) {
  console.log("Req: ", req.body.data);
  const form = new multiparty.Form();
  await mongooseConnect();
  await isAdminRequest(req, res);
  const { fields, files } = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });

  //   uploadBytes(storageRef, files.file).then((snapshot) => {
  //     console.log("Uploaded a blob or file");
  //   });
  console.log("length:", files.file.length);

  const storageRef = ref(storage, `/files/toupload.jpeg`);
  console.log("files is: ", files.file[0]);
  const uploadTask = uploadBytesResumable(storageRef, files.file[0]);
  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const percent = Math.round(
        (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      );
      console.log("Percent is: ", percent);
      // update progress
    },
    (err) => console.log(err),
    () => {
      // download url
      getDownloadURL(uploadTask.snapshot.ref).then((url) => {
        console.log(url);
      });
    }
  );

  //   uploadBytes(storageRef, files.file[0])
  //     .then((snapshot) => {
  //       console.log("Uploaded a blob or file");
  //     })
  //     .catch((err) => console.log(err));
  for (let file of files.file) {
    const ext = file.originalFilename.split(".").pop();
    const newFilename = Date.now() + "." + ext;
  }
  return res.json("ok");
}

// export const config = {
//   api: { bodyParser: false },
// };
