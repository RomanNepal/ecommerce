import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import storage from "../lib/FirebaseConnect";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import Spinner from "./Spinner";
import { ReactSortable } from "react-sortablejs";
import React from "react";
export default function ProductForm({
  _id,
  title: existingTitle,
  description: existingDescription,
  price: existingPrice,
  images: existingImages,
  category: existingCategory,
  properties: existingProperties,
}) {
  const [title, setTitle] = useState(existingTitle || "");
  const [description, setDescription] = useState(existingDescription || "");
  const [price, setPrice] = useState(existingPrice || "");
  const [images, setImages] = useState(existingImages || "");
  const [goToProducts, setGoToProducts] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState(existingCategory || "");
  const [categories, setCategories] = useState([]);
  const [productProperties, setProductProperties] = useState(
    existingProperties || {}
  );
  const router = useRouter();
  useEffect(() => {
    axios.get("/api/categories").then((result) => {
      setCategories(result.data);
    });
  }, []);
  async function saveProduct(e) {
    e.preventDefault();
    const data = {
      title,
      description,
      price,
      images,
      category,
      properties: productProperties,
    };

    if (_id) {
      await axios.put("/api/products", { ...data, _id });
    } else {
      let d = await axios.post("/api/products", data);
    }
    setGoToProducts(true);
  }
  if (goToProducts) {
    router.push("/products");
  }

  function uploadImages(e) {
    setUploading(true);
    const files = e.target?.files;

    if (files?.length > 0) {
      console.log("Uploading first: ", uploading);
      for (let i = 0; i < e.target.files.length; i++) {
        let file = e.target.files[i];
        const ext = file.name.split(".").pop();
        const onlyName = file.name.split(".")[0];
        const newFilename = Date.now() + onlyName + "." + ext;
        const storageRef = ref(storage, `/files/${newFilename}`);

        async function go() {
          const uploadTask = uploadBytesResumable(storageRef, file);
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const percent = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              );
              setUploading(true);
              console.log("Percent is: ", percent);
              // update progress
            },
            (err) => console.log(err),
            () => {
              // download url
              getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                setImages((prevLinks) => {
                  return [...prevLinks, url];
                });
                setUploading(false);
              });
            }
          );
        }
        go();
      }
    }
    setUploading(false);
    console.log("Uploading second:", uploading);
  }

  function updateImagesOrder(images) {
    setImages(images);
  }

  const propertiesToFill = [];
  if (categories.length > 0 && category) {
    let catInfo = categories.find(({ _id }) => _id === category);
    propertiesToFill.push(...catInfo.properties);
    while (catInfo?.parent?.id) {
      const parentCat = categories.find(
        ({ _id }) => _id === catInfo?.parent?._id
      );
      propertiesToFill.push(parentCat.properties);
      catInfo = parentCat;
    }
  }

  function setProductProp(propName, value) {
    setProductProperties((prev) => {
      const newProductProps = { ...prev };
      newProductProps[propName] = value;
      return newProductProps;
    });
  }

  return (
    <form onSubmit={saveProduct}>
      <label>Product Name</label>

      <input
        type="text"
        placeholder="Product Name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      ></input>

      <label>Category</label>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value={""}>Uncategoriezed</option>
        {categories.length > 0 &&
          categories.map((c) => {
            return <option value={c._id}>{c.name}</option>;
          })}
      </select>
      {propertiesToFill.length > 0 &&
        propertiesToFill.map((p) => (
          <div className="">
            <label>{p.name[0].toUpperCase() + p.name.substring(1)}</label>
            <select
              value={productProperties[p.name]}
              onChange={(e) => setProductProp(p.name, e.target.value)}
            >
              {p.values.map((v) => (
                <option value={v}>{v}</option>
              ))}
            </select>
          </div>
        ))}
      <label>Photos</label>
      <div className="mb-2 flex flex-wrap gap-2">
        <ReactSortable
          list={images}
          setList={updateImagesOrder}
          className="flex flex-wrap gap-1"
        >
          {!!images?.length &&
            images.map((link, index) => {
              return (
                <div
                  key={index}
                  className="h-24 bg-white p-4 shadow-sm rounded-sm border border-gray-200"
                >
                  <img className="rounded-lg" src={link} alt=""></img>
                </div>
              );
            })}
        </ReactSortable>
        {uploading && (
          <div className="h-24 bg-gray-200 flex items-center p-1 gap-1">
            <Spinner />
          </div>
        )}

        <label className="w-24 h-24 flex flex-col items-center justify-center bg-white p-1 cursor-pointer text-center text-sm gap-1 text-primary rounded-sm shadow-sm border border-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-6 h-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <div>Add Image</div>
          <input
            type="file"
            multiple
            className="hidden"
            onChange={uploadImages}
          ></input>
        </label>

        {/* {!images?.length && <div>No photos in this product</div>} */}
      </div>
      <label>Description</label>
      <textarea
        placeholder="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>
      <label>Price (in Rupees)</label>
      <input
        type="text"
        placeholder="price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      ></input>
      <button type="submit" className="btn-primary">
        Save
      </button>
    </form>
  );
}
