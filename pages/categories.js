import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import axios from "axios";
import Swal from "sweetalert2";

export default function CategoriesPage() {
  const [name, setName] = useState("");
  const [parentCategory, setParentCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [editedCategory, setEditedCategory] = useState(null);
  const [properties, setProperties] = useState([]);
  useEffect(() => {
    fetchCategories();
  }, []);

  function fetchCategories() {
    axios
      .get("/api/categories")
      .then((result) => {
        setCategories(result.data);
      })
      .catch((err) => console.log(err));
  }

  async function saveCategory(e) {
    e.preventDefault();
    const data = {
      name,
      parent: parentCategory,
      properties: properties.map((p) => {
        return {
          name: p.name,
          values: p.values.split(","),
        };
      }),
    };
    console.log("data is: ", data);
    if (editedCategory) {
      data._id = editedCategory._id;
      await axios.put("/api/categories", data);
      setEditedCategory(null);
    } else {
      let value = await axios.post("/api/categories", {
        ...data,
        name,
        parent: parentCategory ? parentCategory : "",
      });
      console.log(value);
    }

    setName("");
    setParentCategory("");
    setProperties([]);
    fetchCategories();
  }

  const editCategory = (category) => {
    setEditedCategory(category);
    setName(category.name);
    setParentCategory(category.parent?._id);
    setProperties(
      category.properties.map((p) => ({
        name: p.name,
        values: p.hasOwnProperty("values") === true ? p?.values?.join(",") : "",
      }))
    );
  };

  const deleteCategory = (category) => {
    Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete ${category.name}`,
      showCancelButton: true,
      confirmButtonText: "Confirm Delete",
      confirmButtonColor: "#d55",
      cancelButtonText: "No",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { _id } = category;
        await axios.delete("/api/categories?_id=" + _id);
        fetchCategories();
      }
    });
  };

  const addProperty = (e) => {
    e.preventDefault();
    setProperties((prev) => {
      return [...prev, { name: "", values: "" }];
    });
  };
  function handlePropertyNameChange(index, property, newName) {
    setProperties((prev) => {
      const properties = [...prev];
      properties[index].name = newName;
      return properties;
    });
  }

  function handlePropertyValuesChange(index, property, newValues) {
    setProperties((prev) => {
      const properties = [...prev];
      properties[index].values = newValues;
      return properties;
    });
  }

  function removeProperty(e, indexToRemove) {
    e.preventDefault();
    setProperties((prev) => {
      return [...prev].filter((p, index) => {
        return index !== indexToRemove;
      });
    });
  }

  return (
    <Layout>
      <h1>Categories</h1>
      <label>
        {editedCategory
          ? `Edit Category ${editedCategory.name}`
          : "Create New Category"}
      </label>
      <form onSubmit={saveCategory}>
        <div className="flex gap-1">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-0"
            type="text"
            placeholder="Category Name"
          />

          <select
            value={parentCategory}
            onChange={(e) => setParentCategory(e.target.value)}
          >
            <option value={""}>No Parent Category</option>
            {categories.length > 0 &&
              categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>
        <div className="mb-2 mt-2">
          <label className="block">Properties</label>
          <button className="btn-default mb-2" onClick={addProperty}>
            Add New Property
          </button>
          {properties.length > 0 &&
            properties.map((property, index) => (
              <div className="flex gap-1" key={property}>
                <input
                  type="text"
                  placeholder="property name(eg.: Color)"
                  value={property.name}
                  onChange={(e) =>
                    handlePropertyNameChange(index, property, e.target.value)
                  }
                ></input>
                <input
                  type="text"
                  placeholder="values, comma separated"
                  value={property.values}
                  onChange={(e) =>
                    handlePropertyValuesChange(index, property, e.target.value)
                  }
                ></input>
                <button
                  className="btn-red"
                  onClick={(e) => removeProperty(e, index)}
                >
                  Delete
                </button>
              </div>
            ))}
        </div>
        <div className="flex gap-1">
          {editedCategory && (
            <button
              className="btn-default"
              type="button"
              onClick={() => {
                setEditedCategory(null);
                setName("");
                setParentCategory("");
                setProperties([]);
              }}
            >
              Cancel
            </button>
          )}
          <button type="submit" className="btn-primary py-1">
            Save
          </button>
        </div>
      </form>
      {!editedCategory && (
        <table className="basic mt-4">
          <thead>
            <tr>
              <td>Category Name</td>
              <td>Parent Category</td>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 &&
              categories.map((category) => (
                <tr key={category}>
                  <td>{category.name}</td>
                  <td>{category?.parent?.name}</td>
                  <td>
                    <button
                      onClick={() => editCategory(category)}
                      className="btn-default"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCategory(category)}
                      className="btn-red"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </Layout>
  );
}
